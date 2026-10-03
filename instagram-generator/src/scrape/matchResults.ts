// Tischtennis-Spiele vom click-TT-Vereins-Spielplan (alle Mannschaften in
// einem Request, Parser in shared/tableTennis/clubSchedule.ts).
// Zeilen mit Ergebnis → Ergebnis-Post; künftige ohne Ergebnis → Spielankündigung.
import axios from "axios";
import * as cheerio from "cheerio";
import {
  parseDeDate,
  scrapeClubSchedule,
  type ClubMatch,
} from "../../../shared/tableTennis/clubSchedule.ts";
import { headers, REQUEST_TIMEOUT_MS } from "../../../shared/http.ts";
import { deInDays, yesterdayDe } from "../dates.ts";
import { withRetry } from "../retry.ts";
import { isOurs, venueOf } from "./club.ts";
import { displayName } from "./names.ts";
import type { MatchDayData, ResultData } from "../types.ts";

// mytischtennis rate-limitet (HTTP 429) bei Abrufen in schneller Folge; der
// beobachtete Cooldown liegt bei 15–20 s. Daher träges Backoff (5/10/20/40 s)
// und eine Pause zwischen Mannschaftsübersicht und Spielplan.
const RETRIES = 5;
const RETRY_BASE_MS = 5000;
const PAGE_PAUSE_MS = 2000;

function label(ours: number, theirs: number): string {
  if (ours === theirs) return "Hart umkämpftes Remis";
  const diff = Math.abs(ours - theirs);
  if (ours > theirs) {
    if (diff >= 6) return "Deutlicher Sieg";
    if (diff <= 2) return "Knapper Sieg";
    return "Sieg";
  }
  if (diff <= 2) return "Knappe Niederlage";
  return "Niederlage";
}

// mytischtennis sperrt IPs mit auffälligem Zugriffsmuster sporadisch per
// Captcha: Umleitung auf /verify, ausgeliefert als 429 — trotz freiem
// Rate-Limit-Kontingent. Beobachtet: trifft auch private IPs, die Sperre löst
// sich nach ca. 4 Minuten. Das Backoff hier ist dafür zu kurz, deshalb sofort
// abbrechen; der Retry-Job im Workflow versucht es verzögert auf einem neuen
// Runner erneut.
export class CaptchaError extends Error {}

function isCaptcha(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const finalUrl: string = error.request?.res?.responseUrl ?? "";
  return (
    new URL(finalUrl, "https://www.mytischtennis.de").pathname === "/verify"
  );
}

async function get(url: string): Promise<string> {
  try {
    const { data } = await axios.get<string>(url, {
      headers,
      timeout: REQUEST_TIMEOUT_MS,
    });
    return data;
  } catch (error) {
    if (isCaptcha(error)) {
      throw new CaptchaError(
        "mytischtennis verlangt ein Captcha (IP vorübergehend gesperrt)",
      );
    }
    throw error;
  }
}

// Ligaspiele des Vereins an einem Tag ("DD.MM.YYYY"). Pokalspiele werden
// (noch) nicht gepostet. Schlägt der Abruf fehl — auch wenn die Seite keine
// Spielplan-Tabelle enthält (Rate-Limit-Interstitial) —, wird das gesamte
// Paar aus Mannschaftsübersicht + Spielplan erneut versucht; ein Fehler nach
// allen Versuchen macht den Lauf rot statt still "Nothing to post today.".
async function scrapeRows(date: string): Promise<ClubMatch[]> {
  const day = parseDeDate(date);
  const matches = await withRetry(
    () =>
      scrapeClubSchedule(
        { get, load: cheerio.load },
        { from: day, to: day, pauseMs: PAGE_PAUSE_MS },
      ),
    RETRIES,
    RETRY_BASE_MS,
    (error) => !(error instanceof CaptchaError),
  );
  console.log(`Vereins-Spielplan ${date}: ${matches.length} Spiele`);

  const rows: ClubMatch[] = [];
  const seen = new Set<string>();
  for (const match of matches) {
    if (match.isCup) continue;
    // spielfrei/Freilose und versehentlich mitgelesene Fremdzeilen
    if (!match.home || !match.guest) continue;
    if (!isOurs(match.home) && !isOurs(match.guest)) continue;
    // Gruppe + Mannschafts-IDs: eindeutig auch dort, wo Mannschaft I und die
    // Jugend beide "DJK Sparta Noris Nürnberg" heißen.
    if (seen.has(match.key)) continue;
    seen.add(match.key);
    rows.push(match);
  }
  return rows;
}

// Erwachsene: Liga als Kicker; Jugend: Altersklasse.
function labelFor(match: ClubMatch): string {
  return match.ageClass ?? match.league;
}

export async function getYesterdayResults(
  date = yesterdayDe(),
): Promise<ResultData[]> {
  const rows = await scrapeRows(date);
  const results: ResultData[] = [];

  for (const row of rows) {
    if (!/^\d+:\d+$/.test(row.score)) {
      // Leer heißt "noch nicht gespielt" — der Normalfall, der stumm bleibt.
      // Steht dagegen etwas Unerwartetes in der Spalte (kampflos, Wertung,
      // Zusatzmarker), fiele das Spiel lautlos weg: deshalb loggen.
      if (row.score) {
        console.warn(
          `${row.date} ${row.home} – ${row.guest}: Ergebnis "${row.score}" ` +
            `nicht auswertbar, kein Post`,
        );
      }
      continue;
    }

    const [homeScore, guestScore] = row.score.split(":").map(Number);
    const weAreHome = isOurs(row.home);
    const venue = venueOf(row.home, row.guest);
    const ours = weAreHome ? homeScore : guestScore;
    const theirs = weAreHome ? guestScore : homeScore;

    results.push({
      sport: "Tischtennis",
      venue,
      league: row.league,
      home: displayName(row.home),
      guest: displayName(row.guest),
      score: row.score,
      label: venue === "Vereinsduell" ? "Vereinsduell" : label(ours, theirs),
      dateLine: date,
    });
  }

  return results;
}

// Spielankündigungen zwei Tage vorher (Zeilen ohne eingetragenes Ergebnis).
export async function getUpcomingAnnouncements(
  date = deInDays(2),
): Promise<MatchDayData[]> {
  const rows = await scrapeRows(date);
  const announcements: MatchDayData[] = [];

  for (const row of rows) {
    if (/^\d+:\d+$/.test(row.score)) continue; // schon gespielt

    const venue = venueOf(row.home, row.guest);
    const shortDate = row.date.replace(/(\d{2}\.\d{2})\.\d{4}/, "$1."); // "Sa., 20.09."

    announcements.push({
      sport: "Tischtennis",
      kicker: `${venue} · ${labelFor(row)}`,
      home: displayName(row.home),
      guest: displayName(row.guest),
      details: [
        ["Datum", shortDate],
        ["Beginn", row.time ? `${row.time} Uhr` : "–"],
      ],
      cta: isOurs(row.home)
        ? "Kommt vorbei & feuert uns an!"
        : "Drückt uns die Daumen!",
    });
  }

  return announcements;
}

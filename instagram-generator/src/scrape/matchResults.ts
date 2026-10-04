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
import { deInDays, lastWeekendDe, yesterdayDe } from "../dates.ts";
import { withRetry } from "../retry.ts";
import { isOurs, venueOf } from "./club.ts";
import { displayName } from "./names.ts";
import type {
  MatchDayData,
  Outcome,
  ResultData,
  WeekendData,
  WeekendMatch,
} from "../types.ts";

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

// Ligaspiele des Vereins von `from` bis `to` ("DD.MM.YYYY", inklusiv). Pokalspiele werden
// (noch) nicht gepostet. Schlägt der Abruf fehl — auch wenn die Seite keine
// Spielplan-Tabelle enthält (Rate-Limit-Interstitial) —, wird das gesamte
// Paar aus Mannschaftsübersicht + Spielplan erneut versucht; ein Fehler nach
// allen Versuchen macht den Lauf rot statt still "Nothing to post today.".
async function scrapeRows(from: string, to = from): Promise<ClubMatch[]> {
  const matches = await withRetry(
    () =>
      scrapeClubSchedule(
        { get, load: cheerio.load },
        {
          from: parseDeDate(from),
          to: parseDeDate(to),
          pauseMs: PAGE_PAUSE_MS,
        },
      ),
    RETRIES,
    RETRY_BASE_MS,
    (error) => !(error instanceof CaptchaError),
  );
  const range = from === to ? from : `${from}–${to}`;
  console.log(`Vereins-Spielplan ${range}: ${matches.length} Spiele`);

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

// "02.10.2026" + "04.10.2026" → "02.–04. Oktober", über den Monatswechsel
// "30.09.–02. Oktober".
function rangeLabel(from: string, to: string): string {
  const [fromDay, fromMonth] = from.split(".");
  const [toDay, toMonth] = to.split(".");
  const month = new Intl.DateTimeFormat("de-DE", { month: "long" }).format(
    parseDeDate(to),
  );
  const start =
    fromMonth === toMonth ? `${fromDay}.` : `${fromDay}.${fromMonth}.`;
  return `${start}–${toDay}. ${month}`;
}

// Jugend: "Jugend 19 · Bezirksklasse D" (Altersklasse vorn, ohne Gruppen-Nr.).
function weekendLeague(match: ClubMatch): string {
  if (!match.ageClass) return match.league;
  const league = match.league
    .replace(match.ageClass, "")
    .replace(/\s+Gruppe\s+\d+$/, "")
    .trim();
  return league ? `${match.ageClass} · ${league}` : match.ageClass;
}

function outcomeOf(ours: number, theirs: number): Outcome {
  if (ours > theirs) return "win";
  if (ours < theirs) return "loss";
  return "draw";
}

// Alle Ligaspiele des letzten Wochenendes (Fr–So) für den Feed-Post.
export async function getWeekendResults(
  { from, to } = lastWeekendDe(),
): Promise<WeekendData> {
  // Chronologisch: Datum, dann Uhrzeit ("20261002" + "17:30")
  const sortKey = (m: ClubMatch) =>
    m.dateDe.split(".").reverse().join("") + m.time;
  const rows = (await scrapeRows(from, to)).sort((a, b) =>
    sortKey(a).localeCompare(sortKey(b)),
  );
  const matches: WeekendMatch[] = [];

  for (const row of rows) {
    if (!/^\d+:\d+$/.test(row.score)) {
      // Anders als beim Tages-Post ist das Wochenende vorbei: auch ein leeres
      // Ergebnis heißt hier "fehlt", nicht "kommt noch".
      console.warn(
        `${row.date} ${row.home} – ${row.guest}: Ergebnis "${row.score}" ` +
          `fehlt oder nicht auswertbar, nicht im Wochenend-Post`,
      );
      continue;
    }

    const [homeScore, guestScore] = row.score.split(":").map(Number);
    const homeIsUs = isOurs(row.home);
    const guestIsUs = isOurs(row.guest);
    const outcome: Outcome =
      homeIsUs && guestIsUs
        ? "derby"
        : homeIsUs
          ? outcomeOf(homeScore, guestScore)
          : outcomeOf(guestScore, homeScore);

    matches.push({
      day: row.date.slice(0, 2), // "Fr., 02.10.2026" → "Fr"
      date: row.dateDe.slice(0, 6), // "02.10."
      league: weekendLeague(row),
      home: displayName(row.home).replace("\n", " "),
      guest: displayName(row.guest).replace("\n", " "),
      homeScore,
      guestScore,
      homeIsUs,
      guestIsUs,
      outcome,
    });
  }

  return { sport: "Tischtennis", range: rangeLabel(from, to), matches };
}

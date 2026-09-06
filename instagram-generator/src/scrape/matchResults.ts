// Tischtennis-Spiele von den mytischtennis.de-Team-Seiten.
// Die Spielplan-Tabelle der Team-Seite enthält bereits alles:
// td(0)=Datum "Sa., 20.09.2025", td(1)=Uhrzeit, td(3)=Heim, td(4)=Gast, td(5)=Ergebnis "6:4".
// Zeilen mit Ergebnis → Ergebnis-Post; künftige ohne Ergebnis → Spielankündigung.
import axios from "axios";
import * as cheerio from "cheerio";
import { TEAM_PAGES, type TeamPage } from "../config.ts";
import { headers } from "../../../shared/http.ts";
import { deInDays, yesterdayDe } from "../dates.ts";
import { withRetry } from "../retry.ts";
import { displayName } from "./names.ts";
import type { MatchDayData, ResultData } from "../types.ts";

const CLUB = "Sparta";

// mytischtennis rate-limitet (HTTP 429) bei Abrufen in schneller Folge; der
// beobachtete Cooldown liegt bei 15–20 s. Daher träges Backoff (5/10/20/40 s)
// und eine Pause zwischen den Team-Seiten, damit die Abrufe kein Burst sind.
const RETRIES = 5;
const RETRY_BASE_MS = 5000;
const PAGE_PAUSE_MS = 2000;

const DATE_PATTERN = /\d{2}\.\d{2}\.\d{4}/;

interface MatchRow {
  date: string; // "Sa., 20.09.2025"
  time: string; // "14:00" (ggf. mit Zusatz wie "v" für verlegt)
  home: string;
  guest: string;
  score: string; // "6:4" oder leer/Platzhalter, solange nicht gespielt
  league: string; // "Landesliga Ostnordost"
  label: string; // Kicker-Label: Altersklasse bei Jugend, sonst Liga
}

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Alle Spielplan-Zeilen einer Team-Seite (ohne die Bilanz-Tabellen darunter).
async function fetchSchedule(
  url: string,
): Promise<Omit<MatchRow, "league" | "label">[]> {
  const { data } = await axios.get<string>(url, { headers });
  const $ = cheerio.load(data);

  const rows: Omit<MatchRow, "league" | "label">[] = [];
  $("tbody tr").each((_, element) => {
    const tds = $(element).find("td");
    const date = tds.eq(0).text().trim();
    if (!DATE_PATTERN.test(date)) return; // Einzel-/Doppel-/Gesamt-Bilanz

    rows.push({
      date,
      time: tds.eq(1).text().trim(),
      home: tds.eq(3).text().trim(),
      guest: tds.eq(4).text().trim(),
      score: tds.eq(5).text().trim(),
    });
  });

  // Keine einzige Spielplan-Zeile heißt Rate-Limit-Interstitial oder veralteter
  // Link — werfen, damit withRetry es erneut versucht, statt still nichts zu posten.
  if (rows.length === 0) {
    throw new Error("keine Spielplan-Zeilen gefunden");
  }

  return rows;
}

// Spielplan-Zeilen aller Team-Seiten für ein Datum (dedupliziert — Vereinsduelle
// tauchen auf zwei Team-Seiten derselben Liga auf).
async function scrapeRows(filterDate: string): Promise<MatchRow[]> {
  const rows: MatchRow[] = [];
  const seen = new Set<string>();

  for (const [index, team] of TEAM_PAGES.entries()) {
    if (index > 0) await sleep(PAGE_PAUSE_MS);
    const teamLabel = labelFor(team);

    try {
      const schedule = await withRetry(
        () => fetchSchedule(team.url),
        RETRIES,
        RETRY_BASE_MS,
      );
      console.log(`${teamLabel}: ${schedule.length} Spielplan-Zeilen`);

      for (const row of schedule) {
        if (!row.date.includes(filterDate)) continue;
        // spielfrei/Freilose und versehentlich mitgelesene Fremdzeilen
        if (!row.home || !row.guest) continue;
        if (!row.home.includes(CLUB) && !row.guest.includes(CLUB)) continue;

        // Mannschaft I und die Jugend heißen beide "DJK Sparta Noris Nürnberg",
        // deshalb steckt das Label im Key — sonst könnten sich zwei Spiele
        // verschiedener Mannschaften gegenseitig verschlucken.
        const key = `${teamLabel}|${row.date}|${row.home}|${row.guest}`;
        if (seen.has(key)) continue;
        seen.add(key);

        rows.push({ ...row, league: team.league, label: teamLabel });
      }
    } catch (error) {
      console.error(`Error scraping team page ${team.url}:`, error);
    }
  }

  return rows;
}

// Erwachsene: Liga als Kicker; Jugend: Altersklasse.
function labelFor(team: TeamPage): string {
  return team.ageClass ?? team.league;
}

export async function getYesterdayResults(
  date = yesterdayDe(),
): Promise<ResultData[]> {
  const rows = await scrapeRows(date);
  const results: ResultData[] = [];

  for (const row of rows) {
    if (!/^\d+:\d+$/.test(row.score)) continue; // noch kein Ergebnis eingetragen

    const [homeScore, guestScore] = row.score.split(":").map(Number);
    const weAreHome = row.home.includes(CLUB);
    const weAreGuest = row.guest.includes(CLUB);
    const ours = weAreHome ? homeScore : guestScore;
    const theirs = weAreHome ? guestScore : homeScore;

    results.push({
      sport: "Tischtennis",
      venue:
        weAreHome && weAreGuest
          ? "Vereinsduell"
          : weAreHome
            ? "Heimspiel"
            : "Auswärtsspiel",
      league: row.league,
      home: displayName(row.home),
      guest: displayName(row.guest),
      score: row.score,
      label: weAreHome && weAreGuest ? "Vereinsduell" : label(ours, theirs),
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

    const weAreHome = row.home.includes(CLUB);
    const weAreGuest = row.guest.includes(CLUB);
    const kind =
      weAreHome && weAreGuest
        ? "Vereinsduell"
        : weAreHome
          ? "Heimspiel"
          : "Auswärtsspiel";
    const time = row.time.match(/\d{1,2}:\d{2}/)?.[0];
    const shortDate = row.date.replace(/(\d{2}\.\d{2})\.\d{4}/, "$1."); // "Sa., 20.09."

    announcements.push({
      sport: "Tischtennis",
      kicker: `${kind} · ${row.label}`,
      home: displayName(row.home),
      guest: displayName(row.guest),
      details: [
        ["Datum", shortDate],
        ["Beginn", time ? `${time} Uhr` : "–"],
      ],
      cta: weAreHome
        ? "Kommt vorbei & feuert uns an!"
        : "Drückt uns die Daumen!",
    });
  }

  return announcements;
}

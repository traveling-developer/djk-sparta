// Tischtennis-Spiele von den mytischtennis.de-Team-Seiten.
// Die Spielplan-Tabelle der Team-Seite enthält bereits alles:
// td(0)=Datum "Sa., 20.09.2025", td(1)=Uhrzeit, td(3)=Heim, td(4)=Gast, td(5)=Ergebnis "6:4".
// Zeilen mit Ergebnis → Ergebnis-Post; künftige ohne Ergebnis → Spielankündigung.
import axios from "axios";
import * as cheerio from "cheerio";
import { TEAM_PAGES, type TeamPage } from "../config.ts";
import { headers, REQUEST_TIMEOUT_MS } from "../../../shared/http.ts";
import { deInDays, todayDe, yesterdayDe } from "../dates.ts";
import { withRetry } from "../retry.ts";
import { isOurs, venueOf } from "./club.ts";
import { displayName } from "./names.ts";
import type { MatchDayData, ResultData } from "../types.ts";

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
  const { data } = await axios.get<string>(url, {
    headers,
    timeout: REQUEST_TIMEOUT_MS,
  });
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

// "Sa., 20.09.2026" → "20260920" (vergleichbar); "" wenn kein Datum drin.
function sortKey(date: string): string {
  const match = date.match(DATE_PATTERN)?.[0];
  return match ? match.split(".").reverse().join("") : "";
}

// Enthält eine Team-Seite nur noch Vergangenheit, ist der saisonale Link
// veraltet — bei der Jugend wechseln die Gruppen-/Mannschafts-IDs schon zur
// Rückrunde (ca. Januar). Ohne diese Warnung verschwände die Mannschaft
// lautlos aus den Posts: die Seite antwortet ja weiter mit Spielplan-Zeilen,
// der 0-Zeilen-Guard in `fetchSchedule` greift also nie.
function warnIfStale(
  teamLabel: string,
  schedule: Omit<MatchRow, "league" | "label">[],
): void {
  const latest = schedule.reduce((a, b) =>
    sortKey(a.date) >= sortKey(b.date) ? a : b,
  );
  if (sortKey(latest.date) >= sortKey(todayDe())) return;

  console.warn(
    `${teamLabel}: letztes Spiel am ${latest.date} — Link vermutlich veraltet ` +
      `(Saison-/Rückrunden-IDs in shared/tableTennis/teams.ts prüfen)`,
  );
}

// Spielplan-Zeilen aller Team-Seiten für ein Datum (dedupliziert — Vereinsduelle
// tauchen auf zwei Team-Seiten derselben Liga auf).
async function scrapeRows(filterDate: string): Promise<MatchRow[]> {
  const rows: MatchRow[] = [];
  const seen = new Set<string>();
  let failed = 0;

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
      warnIfStale(teamLabel, schedule);

      for (const row of schedule) {
        if (!row.date.includes(filterDate)) continue;
        // spielfrei/Freilose und versehentlich mitgelesene Fremdzeilen
        if (!row.home || !row.guest) continue;
        if (!isOurs(row.home) && !isOurs(row.guest)) continue;

        // Mannschaft I und die Jugend heißen beide "DJK Sparta Noris Nürnberg",
        // deshalb steckt das Label im Key — sonst könnten sich zwei Spiele
        // verschiedener Mannschaften gegenseitig verschlucken.
        const key = `${teamLabel}|${row.date}|${row.home}|${row.guest}`;
        if (seen.has(key)) continue;
        seen.add(key);

        rows.push({ ...row, league: team.league, label: teamLabel });
      }
    } catch (error) {
      failed++;
      console.error(`Error scraping team page ${team.url}:`, error);
    }
  }

  // Einzelne Ausfälle werden übersprungen (die übrigen Mannschaften sollen
  // trotzdem posten) — fällt aber *jede* Seite aus, ist das kein spielfreier
  // Tag, sondern ein Fehler: werfen, damit der Lauf rot wird statt still
  // "Nothing to post today." zu melden.
  if (failed > 0 && failed === TEAM_PAGES.length) {
    throw new Error(
      `Keine einzige der ${failed} Tischtennis-Team-Seiten abrufbar ` +
        `(mytischtennis nicht erreichbar oder Rate-Limit).`,
    );
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
    const time = row.time.match(/\d{1,2}:\d{2}/)?.[0];
    const shortDate = row.date.replace(/(\d{2}\.\d{2})\.\d{4}/, "$1."); // "Sa., 20.09."

    announcements.push({
      sport: "Tischtennis",
      kicker: `${venue} · ${row.label}`,
      home: displayName(row.home),
      guest: displayName(row.guest),
      details: [
        ["Datum", shortDate],
        ["Beginn", time ? `${time} Uhr` : "–"],
      ],
      cta: isOurs(row.home)
        ? "Kommt vorbei & feuert uns an!"
        : "Drückt uns die Daumen!",
    });
  }

  return announcements;
}

// Tischtennis-Spiele von den mytischtennis.de-Team-Seiten.
// Die Spielplan-Tabelle der Team-Seite enthält bereits alles:
// td(0)=Datum "Sa., 20.09.2025", td(1)=Uhrzeit, td(3)=Heim, td(4)=Gast, td(5)=Ergebnis "6:4".
// Gestrige Zeilen mit Ergebnis → Ergebnis-Post; heutige ohne Ergebnis → Spielankündigung.
import axios from "axios";
import * as cheerio from "cheerio";
import { TEAM_PAGES } from "../config.ts";
import { yesterdayDe, todayDe } from "../dates.ts";
import { withRetry } from "../retry.ts";
import type { MatchDayData, ResultData } from "../types.ts";

const CLUB = "Sparta";

interface MatchRow {
  date: string; // "Sa., 20.09.2025"
  time: string; // "14:00" (ggf. mit Zusatz wie "v" für verlegt)
  home: string;
  guest: string;
  score: string; // "6:4" oder leer/Platzhalter, solange nicht gespielt
  league: string;
}

// "DJK Sparta Noris Nürnberg II" → "Sparta\nNoris II" (Zeilenumbruch im Template)
export function displayName(club: string): string {
  const match = club.match(/Sparta Noris(?: Nürnberg)?\s*([IVX]*)$/);
  if (match) {
    return `Sparta\nNoris${match[1] ? " " + match[1] : ""}`;
  }
  return club;
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

// Alle Spielplan-Zeilen der Team-Seiten für ein Datum (dedupliziert —
// Vereinsduelle tauchen auf zwei Team-Seiten auf).
async function scrapeRows(filterDate: string): Promise<MatchRow[]> {
  const rows: MatchRow[] = [];
  const seen = new Set<string>();

  for (const team of TEAM_PAGES) {
    try {
      const { data } = await withRetry(() => axios.get<string>(team.url));
      const $ = cheerio.load(data);

      $("tbody tr").each((_, element) => {
        const tds = $(element).find("td");
        const date = tds.eq(0).text().trim();
        if (!date.includes(filterDate)) return;

        const home = tds.eq(3).text().trim();
        const guest = tds.eq(4).text().trim();
        const key = `${date}|${home}|${guest}`;
        if (seen.has(key)) return;
        seen.add(key);

        rows.push({
          date,
          time: tds.eq(1).text().trim(),
          home,
          guest,
          score: tds.eq(5).text().trim(),
          league: team.league,
        });
      });
    } catch (error) {
      console.error(`Error scraping team page ${team.url}:`, error);
    }
  }

  return rows;
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
      league: row.league,
      home: displayName(row.home),
      guest: displayName(row.guest),
      score: row.score,
      label: weAreHome && weAreGuest ? "Vereinsduell" : label(ours, theirs),
      dateLine: `${weAreHome ? "Heimspiel" : "Auswärtsspiel"} · ${date}`,
    });
  }

  return results;
}

// Spielankündigungen für heute (Zeilen ohne eingetragenes Ergebnis).
export async function getTodayAnnouncements(
  date = todayDe(),
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
      kicker: `${kind} · ${row.league}`,
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

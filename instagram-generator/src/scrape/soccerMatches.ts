import axios from "axios";
import * as cheerio from "cheerio";
import { scrapeBfvMatches, type BfvMatch } from "../../../shared/soccer/bfv.ts";
import { SOCCER_CLUB_URL } from "../../../shared/soccer/constants.ts";
import { headers } from "../../../shared/http.ts";
import { berlinYmd, formatBerlin } from "../../../shared/soccer/format.ts";
import { withRetry } from "../retry.ts";
import type { MatchDayData } from "../types.ts";

const CLUB = "Sparta";
const cfg = { headers };

const get = async (url: string): Promise<string> =>
  (await withRetry(() => axios.get<string>(url, cfg))).data;

function ourName(club: string): string {
  const match = club.match(/Sparta Noris(?:\s+N(?:ü|ue)rnberg)?\s*(.*)$/i);
  const suffix = match?.[1]?.trim();
  return suffix ? `Sparta\nNoris ${suffix}` : "Sparta\nNoris";
}

function twoLines(club: string): string {
  const clean = club.replace(/\s+/g, " ").trim();
  if (clean.length <= 12 || !clean.includes(" ")) return clean;

  const mid = Math.floor(clean.length / 2);
  let best = clean.indexOf(" ");
  for (let i = clean.indexOf(" "); i !== -1; i = clean.indexOf(" ", i + 1)) {
    if (Math.abs(i - mid) < Math.abs(best - mid)) best = i;
  }
  return `${clean.slice(0, best)}\n${clean.slice(best + 1)}`;
}

function displayName(club: string): string {
  return club.includes(CLUB) ? ourName(club) : twoLines(club);
}

// "YYYY-MM-DD" des Tages in `days` Tagen in Europe/Berlin.
function berlinYmdInDays(days: number): string {
  return berlinYmd(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
}

// Spielankündigungen zwei Tage vorher (Spiele, deren Anstoß übermorgen in
// Europe/Berlin ist) — Fußball wird zwei Tage vor dem Spiel gepostet.
export async function getUpcomingSoccerAnnouncements(
  targetDate = berlinYmdInDays(2),
): Promise<MatchDayData[]> {
  const matches = await scrapeBfvMatches(
    { get, load: cheerio.load },
    { clubUrl: SOCCER_CLUB_URL },
  );

  const seen = new Set<string>();
  const announcements: MatchDayData[] = [];

  for (const match of matches) {
    if (berlinYmd(match.start) !== targetDate) continue;

    // Vereinsduelle tauchen auf zwei Team-Spielplänen auf → dedupe
    const key = `${match.home}|${match.guest}|${match.start.getTime()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const weAreHome = match.home.includes(CLUB);
    const weAreGuest = match.guest.includes(CLUB);
    const kind =
      weAreHome && weAreGuest
        ? "Vereinsduell"
        : weAreHome
          ? "Heimspiel"
          : "Auswärtsspiel";

    // Erwachsene: Liga als Kicker; Junioren: Altersklasse.
    const label = labelFor(match);
    const { date: shortDate, time } = formatBerlin(match.start);

    announcements.push({
      sport: "Fußball",
      kicker: label ? `${kind} · ${label}` : kind,
      home: displayName(match.home),
      guest: displayName(match.guest),
      details: [
        ["Datum", shortDate],
        ["Beginn", `${time} Uhr`],
      ],
      cta: weAreHome
        ? "Kommt vorbei & feuert uns an!"
        : "Drückt uns die Daumen!",
    });
  }

  return announcements;
}

function labelFor(match: BfvMatch): string {
  return match.isJunior ? match.ageClass : match.league;
}

import axios from "axios";
import * as cheerio from "cheerio";
import { scrapeBfvResults } from "../../../shared/soccer/bfv.ts";
import { SOCCER_CLUB_URL } from "../../../shared/soccer/constants.ts";
import { headers } from "../../../shared/http.ts";
import { withRetry } from "../retry.ts";
import { decodeScore } from "./bfvFontDecode.ts";
import { displayName } from "./soccerMatches.ts";
import type { ResultData } from "../types.ts";

const CLUB = "Sparta";
const cfg = { headers };

const get = async (url: string): Promise<string> =>
  (await withRetry(() => axios.get<string>(url, cfg))).data;

// "DD.MM.YYYY" von gestern in Europe/Berlin (Format wie auf der BFV-Seite).
function berlinYesterdayDe(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return `${p.day}.${p.month}.${p.year}`;
}

function soccerLabel(ours: number, theirs: number): string {
  if (ours === theirs) return "Unentschieden";
  const diff = Math.abs(ours - theirs);
  if (ours > theirs) {
    if (diff >= 4) return "Kantersieg";
    if (diff === 1) return "Knapper Sieg";
    return "Sieg";
  }
  if (diff >= 4) return "Deutliche Niederlage";
  if (diff === 1) return "Knappe Niederlage";
  return "Niederlage";
}

export async function getYesterdaySoccerResults(
  date = berlinYesterdayDe(),
): Promise<ResultData[]> {
  const raw = await scrapeBfvResults(
    { get, load: cheerio.load },
    { clubUrl: SOCCER_CLUB_URL },
  );

  const results: ResultData[] = [];
  const seen = new Set<string>(); // Vereinsduelle stehen auf zwei Spielplänen

  for (const r of raw) {
    if (r.date !== date) continue;

    const key = `${r.home}|${r.guest}|${r.date}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const homeGoals = await decodeScore(r.homeScore.raw, r.homeScore.fontUrl);
    const guestGoals = await decodeScore(
      r.guestScore.raw,
      r.guestScore.fontUrl,
    );
    if (homeGoals == null || guestGoals == null) {
      console.error(`Skip undecodable score: ${r.home} vs ${r.guest}`);
      continue;
    }

    const weAreHome = r.home.includes(CLUB);
    const weAreGuest = r.guest.includes(CLUB);
    const ours = Number(weAreHome ? homeGoals : guestGoals);
    const theirs = Number(weAreHome ? guestGoals : homeGoals);

    const venue =
      weAreHome && weAreGuest
        ? "Vereinsduell"
        : weAreHome
          ? "Heimspiel"
          : "Auswärtsspiel";

    results.push({
      sport: "Fußball",
      venue,
      league: r.league,
      home: displayName(r.home),
      guest: displayName(r.guest),
      score: `${homeGoals}:${guestGoals}`,
      label:
        weAreHome && weAreGuest ? "Vereinsduell" : soccerLabel(ours, theirs),
      dateLine: r.date,
    });
  }

  return results;
}

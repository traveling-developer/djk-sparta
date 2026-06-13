import axios, { type AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";

interface Match {
  date: string;
  time: string;
  homeTeam: string;
  guestTeam: string;
  start: Date;
}

const CLUB_URL =
  "https://www.bfv.de/vereine/djk-sparta-noris-nuernberg/00ES8GNKEO00001DVV0AG08LVUPGND5I";

const config: AxiosRequestConfig = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/112.0.0.0 Safari/537.36",
    Accept: "text/html",
  },
};

export async function getMatches(): Promise<Match[]> {
  try {
    const detailLinks = await getAdultTeamLinks();

    const icsUrls = (
      await Promise.all(detailLinks.map((link) => getIcsUrl(link)))
    ).filter((url): url is string => Boolean(url));

    const matchLists = await Promise.all(
      icsUrls.map((url) => getMatchesFromIcs(url)),
    );

    const now = new Date();

    return matchLists
      .flat()
      .filter((match) => match.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  } catch (error) {
    console.error("Error downloading soccer matches:", error);
    return [];
  }
}

async function getAdultTeamLinks(): Promise<string[]> {
  const { data } = await axios.get(CLUB_URL, config);
  const $ = cheerio.load(data);

  const links: string[] = [];

  for (const element of $(".bfv-composition-entry")) {
    const category = $(element)
      .find(".bfv-composition-entry__category")
      .text()
      .trim();

    if (category.includes("Junioren")) {
      continue;
    }

    const link = $(element).find("a").attr("href");

    if (link) {
      links.push(link);
    }
  }
  return links;
}

async function getIcsUrl(detailLink: string): Promise<string | undefined> {
  try {
    const { data } = await axios.get(detailLink, config);
    const $ = cheerio.load(data);

    for (const el of $("a")) {
      const href = $(el).attr("href") ?? "";
      if (href.includes("/rest/icsexport/Spielplan")) {
        return href;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error reading team detail page:", detailLink, error);
    return undefined;
  }
}

async function getMatchesFromIcs(icsUrl: string): Promise<Match[]> {
  try {
    const { data } = await axios.get<string>(icsUrl, config);
    return parseIcs(data);
  } catch (error) {
    console.error("Error downloading ICS:", icsUrl, error);
    return [];
  }
}

function parseIcs(ics: string): Match[] {
  const lines = unfoldIcsLines(ics);

  const matches: Match[] = [];
  let summary: string | undefined;
  let dtStart: string | undefined;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      summary = undefined;
      dtStart = undefined;
    } else if (line.startsWith("SUMMARY:")) {
      summary = unescapeIcs(line.slice("SUMMARY:".length));
    } else if (line.startsWith("DTSTART")) {
      dtStart = line.slice(line.indexOf(":") + 1);
    } else if (line === "END:VEVENT") {
      const match = buildMatch(summary, dtStart);
      if (match) {
        matches.push(match);
      }
    }
  }
  return matches;
}

function buildMatch(
  summary: string | undefined,
  dtStart: string | undefined,
): Match | undefined {
  if (!summary || !dtStart) return undefined;

  const start = parseIcsDate(dtStart);
  if (!start || Number.isNaN(start.getTime())) return undefined;

  const matchup = summary.split(",")[0]?.trim();
  if (!matchup) return undefined;

  const teams = splitTeams(matchup);
  if (!teams) return undefined;

  const { date, time } = formatBerlin(start);
  return { date, time, homeTeam: teams.home, guestTeam: teams.away, start };
}

function splitTeams(
  matchup: string,
): { home: string; away: string } | undefined {
  const SPARTA = "DJK Sparta";
  const idx = matchup.indexOf(SPARTA);

  const clean = (s: string) => s.replace(/\s+/g, " ").trim();

  if (idx > 0) {
    return {
      home: clean(matchup.slice(0, idx).replace(/-\s*$/, "")),
      away: clean(matchup.slice(idx)),
    };
  }

  const sep = matchup.indexOf("-");
  if (sep === -1) return undefined;
  return {
    home: clean(matchup.slice(0, sep)),
    away: clean(matchup.slice(sep + 1)),
  };
}

function unfoldIcsLines(ics: string): string[] {
  const rawLines = ics.split(/\r?\n/);
  const lines: string[] = [];
  for (const raw of rawLines) {
    if ((raw.startsWith(" ") || raw.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += raw.slice(1);
    } else {
      lines.push(raw);
    }
  }
  return lines;
}

function unescapeIcs(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseIcsDate(value: string): Date | undefined {
  const dateOnly = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnly) {
    const [, y, mo, d] = dateOnly;
    return new Date(`${y}-${mo}-${d}T00:00:00`);
  }

  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) return undefined;
  const [, y, mo, d, h, mi, s, z] = m;
  if (z) {
    return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  }
  return new Date(+y, +mo - 1, +d, +h, +mi, +s);
}

export function formatBerlin(date: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  const weekday = (p.weekday ?? "").replace(/\.$/, "");

  return {
    date: `${weekday}. ${p.day}.${p.month}.${p.year}`,
    time: `${p.hour}:${p.minute}`,
  };
}

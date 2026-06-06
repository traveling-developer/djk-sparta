// Gemeinsamer BFV-Fußball-Scraper für website und instagram-generator.
//
// Wichtig: zur Laufzeit dependency-frei. cheerio wird NUR als `import type`
// genutzt (wird beim TS-Stripping/Bundling vollständig entfernt); die echten
// `axios.get` und `cheerio.load` werden vom jeweiligen Paket injiziert. So
// braucht diese Datei kein eigenes node_modules und funktioniert sowohl unter
// Nodes nativem TS (instagram-generator) als auch unter Vite (website).
import type { CheerioAPI } from "cheerio";

// Ein rohes, neutrales Spiel — Filterung/Formatierung macht der Consumer.
export interface BfvMatch {
  home: string; // bereinigter Heim-Vereinsname
  guest: string; // bereinigter Gast-Vereinsname
  start: Date;
  league: string; // Detailseite "Liga" (leer bei Junioren)
  ageClass: string; // Detailseite "Altersklasse" (leer bei Erwachsenen)
  isJunior: boolean;
}

// Vom Consumer injizierte Abhängigkeiten (eigene Header-/Retry-Policy).
export interface ScrapeDeps {
  get: (url: string) => Promise<string>; // liefert den Response-Body
  load: (html: string) => CheerioAPI; // cheerio.load des Consumers
}

export interface ScrapeOptions {
  clubUrl: string;
  includeJuniors?: boolean; // default: true
}

interface TeamLink {
  link: string;
  isJunior: boolean;
}

interface TeamSource {
  icsUrl: string;
  league: string;
  ageClass: string;
  isJunior: boolean;
}

// Liest den Wert eines BFV-"Spielinfo"-Eintrags (z.B. "Liga", "Altersklasse",
// "tabellenplatz", "torverhältnis") — von website/teams.ts mitgenutzt.
export function readGameInfo($: CheerioAPI, title: string): string {
  return $(".bfv-game-info-entry")
    .filter(
      (_, e) =>
        $(e).find(".bfv-game-info-entry__title").text().trim() === title,
    )
    .first()
    .find(".bfv-game-info-entry__text")
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

function getTeamLinks($: CheerioAPI): TeamLink[] {
  const links: TeamLink[] = [];
  for (const element of $(".bfv-composition-entry")) {
    const category = $(element)
      .find(".bfv-composition-entry__category")
      .text()
      .trim();

    const link = $(element).find("a").attr("href");
    // "Junior" deckt Junioren wie Juniorinnen ab.
    if (link) links.push({ link, isJunior: /Junior/i.test(category) });
  }
  return links;
}

async function getTeamSource(
  deps: ScrapeDeps,
  team: TeamLink,
): Promise<TeamSource | undefined> {
  try {
    const $ = deps.load(await deps.get(team.link));

    let icsUrl: string | undefined;
    for (const el of $("a")) {
      const href = $(el).attr("href") ?? "";
      if (href.includes("/rest/icsexport/Spielplan")) {
        icsUrl = href;
        break;
      }
    }
    if (!icsUrl) return undefined;

    return {
      icsUrl,
      league: readGameInfo($, "Liga"),
      ageClass: readGameInfo($, "Altersklasse"),
      isJunior: team.isJunior,
    };
  } catch (error) {
    console.error("Error reading team detail page:", team.link, error);
    return undefined;
  }
}

async function getMatchesFromIcs(
  deps: ScrapeDeps,
  source: TeamSource,
): Promise<BfvMatch[]> {
  try {
    return parseIcs(await deps.get(source.icsUrl), source);
  } catch (error) {
    console.error("Error downloading ICS:", source.icsUrl, error);
    return [];
  }
}

function parseIcs(ics: string, source: TeamSource): BfvMatch[] {
  const lines = unfoldIcsLines(ics);

  const matches: BfvMatch[] = [];
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
      const match = buildMatch(summary, dtStart, source);
      if (match) matches.push(match);
    }
  }
  return matches;
}

function buildMatch(
  summary: string | undefined,
  dtStart: string | undefined,
  source: TeamSource,
): BfvMatch | undefined {
  if (!summary || !dtStart) return undefined;

  const start = parseIcsDate(dtStart);
  if (!start || Number.isNaN(start.getTime())) return undefined;

  const matchup = summary.split(",")[0]?.trim();
  if (!matchup) return undefined;

  const teams = splitTeams(matchup);
  if (!teams) return undefined;

  // Spielfreie Tage stehen als "SPIELFREI" anstelle eines Gegners → kein echtes Spiel.
  if (/spielfrei/i.test(teams.home) || /spielfrei/i.test(teams.away)) {
    return undefined;
  }

  return {
    home: teams.home,
    guest: teams.away,
    start,
    league: source.league,
    ageClass: source.ageClass,
    isJunior: source.isJunior,
  };
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
  if (z) return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  return new Date(+y, +mo - 1, +d, +h, +mi, +s);
}

// Scrapt alle BFV-Spiele des Vereins: Vereinsseite → Team-Links →
// Detailseiten (ICS-URL + Liga/Altersklasse) → ICS parsen. Liefert rohe,
// neutrale Spiele; "SPIELFREI"-Zeilen sind bereits herausgefiltert.
export async function scrapeBfvMatches(
  deps: ScrapeDeps,
  opts: ScrapeOptions,
): Promise<BfvMatch[]> {
  try {
    const $ = deps.load(await deps.get(opts.clubUrl));

    let teamLinks = getTeamLinks($);
    if (opts.includeJuniors === false) {
      teamLinks = teamLinks.filter((t) => !t.isJunior);
    }

    const sources = (
      await Promise.all(teamLinks.map((team) => getTeamSource(deps, team)))
    ).filter((s): s is TeamSource => Boolean(s));

    const matchLists = await Promise.all(
      sources.map((source) => getMatchesFromIcs(deps, source)),
    );

    return matchLists.flat();
  } catch (error) {
    console.error("Error downloading soccer matches:", error);
    return [];
  }
}

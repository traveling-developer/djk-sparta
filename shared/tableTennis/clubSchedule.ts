// Tischtennis-Spiele aller Vereinsmannschaften vom click-TT-Vereins-Spielplan.
//
// Ein Request liefert sämtliche Mannschaften (Erwachsene, Jugend, Pokal) für
// einen frei wählbaren Zeitraum — statt einer Team-Seite pro Mannschaft. Die
// Liga steht dort nur als Kürzel ("VOL E"); vollen Namen und Altersklasse
// liefert die Mannschaftsübersicht, zugeordnet über die Gruppen-ID.
//
// Spalten des Spielplans: td(0)=Datum "Sa., 03.10.2026", td(1)=Uhrzeit (ggf.
// mit Markierung wie "t"), td(2)=Halle, td(3)=Liga-Kürzel, td(4)=Heim,
// td(5)=Gast, td(6)=Ergebnis "6:4" (gespielt, mit Spielbericht-Link), "..."
// (läuft gerade) oder leer.
//
// Wie shared/soccer/bfv.ts zur Laufzeit dependency-frei: `get` und
// `cheerio.load` injiziert der Consumer (eigene Header-/Retry-Policy).
import type { CheerioAPI } from "cheerio";
import { clubScheduleUrl, clubTeamsUrl, seasonFor } from "./teams.ts";

const BASE_URL = "https://www.mytischtennis.de";
const DATE_PATTERN = /\d{2}\.\d{2}\.\d{4}/;

export interface ClubScheduleDeps {
  get: (url: string) => Promise<string>; // liefert den Response-Body
  load: (html: string) => CheerioAPI; // cheerio.load des Consumers
}

export interface ClubMatch {
  date: string; // "Sa., 03.10.2026"
  dateDe: string; // "03.10.2026"
  time: string; // "14:30" (leer, falls keine Uhrzeit)
  timeNote: string; // Markierung hinter der Uhrzeit, z.B. "t" — Bedeutung noch ungeklärt
  league: string; // "Verbandsoberliga Nord" — voller Name, ersatzweise das Kürzel
  leagueShort: string; // "VOL E"
  ageClass?: string; // nur bei Jugend, z.B. "Jugend 19"
  isCup: boolean; // Pokalspiel
  groupId: string;
  home: string;
  guest: string;
  homeTeamId: string;
  guestTeamId: string;
  score: string; // "6:4", "..." oder leer
  scoreNote: string; // Markierung hinter dem Ergebnis (kampflos o.ä.), meist leer
  reportUrl?: string; // Spielbericht (absolut), erst wenn gespielt
  key: string; // Gruppe|Heim-ID|Gast-ID — ohne Datum, übersteht Verlegungen
}

interface GroupInfo {
  league: string;
  ageClass?: string;
  isCup: boolean;
}

// "03.10.2026" → Date (lokale Mitternacht), passend zu `clubScheduleUrl`.
export function parseDeDate(dateDe: string): Date {
  const [day, month, year] = dateDe.split(".").map(Number);
  return new Date(year, month - 1, day);
}

// "03.10.2026" bzw. Date → "20261003" (vergleichbar).
function sortKey(date: string | Date): string {
  if (typeof date === "string") return date.split(".").reverse().join("");
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

// "Erwachsene Verbandsoberliga Nord (Bayerischer TTV)" → "Verbandsoberliga Nord",
// "Jugend 19 Bezirksklasse D Gruppe 5 (…) Vorrunde" → "Jugend 19 Bezirksklasse D Gruppe 5".
function cleanLeague(name: string): string {
  return name
    .replace(/^Erwachsene\s+/, "")
    .replace(/\s*\(.*?\)/g, "")
    .replace(/\s+(Vorrunde|Rückrunde)$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

// "Jugend 19 (3er)" → "Jugend 19"; Erwachsene/Damen/Herren → keine Altersklasse.
function ageClassOf(teamName: string): string | undefined {
  const name = teamName
    .replace(/\s*\(.*?\)/g, "")
    .replace(/\s+[IVX]+$/, "")
    .trim();
  return /^(Erwachsene|Herren|Damen)/.test(name) ? undefined : name;
}

function idsFrom(href: string | undefined) {
  const match = href?.match(/gruppe\/(\d+)\/mannschaft\/(\d+)/);
  return match ? { groupId: match[1], teamId: match[2] } : undefined;
}

// Mannschaftsübersicht: Gruppen-ID → voller Liganame, Altersklasse, Pokal.
async function fetchGroups(
  deps: ClubScheduleDeps,
  season: string,
): Promise<Map<string, GroupInfo>> {
  const $ = deps.load(await deps.get(clubTeamsUrl(season)));
  const groups = new Map<string, GroupInfo>();

  $("tbody tr").each((_, element) => {
    const tds = $(element).find("td");
    const link = tds.eq(1).find("a").attr("href") ?? "";
    const groupId = link.match(/gruppe\/(\d+)/)?.[1];
    if (!groupId) return;

    groups.set(groupId, {
      league: cleanLeague(tds.eq(1).text().trim()),
      ageClass: ageClassOf(tds.eq(0).text().trim()),
      isCup: link.includes("/pokalspiele/"),
    });
  });

  // Ohne Mannschaften ist das keine leere Saison, sondern ein Interstitial
  // oder eine geänderte Seite — sonst fehlten still alle Liganamen.
  if (groups.size === 0) {
    throw new Error("Mannschaftsübersicht ohne Mannschaften");
  }
  return groups;
}

// Zelltext ohne die Markierung, die click-TT als <span> dahinter setzt
// ("20:15" + "t" → "20:15").
function withoutNote(text: string, note: string): string {
  const full = text.trim();
  return note && full.endsWith(note)
    ? full.slice(0, -note.length).trim()
    : full;
}

/**
 * Alle Spiele des Vereins von `from` bis `to` (beide inklusiv). Zwei Requests:
 * Mannschaftsübersicht und Spielplan, dazwischen `pauseMs` Pause.
 */
export async function scrapeClubSchedule(
  deps: ClubScheduleDeps,
  opts: { from: Date; to: Date; pauseMs?: number },
): Promise<ClubMatch[]> {
  const groups = await fetchGroups(deps, seasonFor(opts.from));
  if (opts.pauseMs) {
    await new Promise((resolve) => setTimeout(resolve, opts.pauseMs));
  }

  const $ = deps.load(await deps.get(clubScheduleUrl(opts.from, opts.to)));

  // Ein leerer Zeitraum liefert die Tabelle mit Kopfzeile, aber ohne Zeilen.
  // Fehlt schon der Kopf, ist das ein Interstitial (Rate-Limit o.ä.) oder eine
  // geänderte Seite — werfen, damit es nicht wie ein spielfreier Tag aussieht.
  if (!$("thead").text().includes("Heimmannschaft")) {
    throw new Error("keine Spielplan-Tabelle gefunden");
  }

  const from = sortKey(opts.from);
  const to = sortKey(opts.to);
  const matches: ClubMatch[] = [];

  $("tbody tr").each((_, element) => {
    const tds = $(element).find("td");
    const date = tds.eq(0).text().trim();
    const dateDe = date.match(DATE_PATTERN)?.[0];
    if (!dateDe) return;

    // Ignoriert click-TT den Datumsfilter, kämen Spiele anderer Tage — und
    // der gesuchte Tag fehlte womöglich still. Lieber laut abbrechen.
    const day = sortKey(dateDe);
    if (day < from || day > to) {
      throw new Error(
        `Spiel am ${dateDe} außerhalb des angefragten Zeitraums — Datumsfilter ignoriert?`,
      );
    }

    const homeCell = tds.eq(4);
    const guestCell = tds.eq(5);
    const scoreCell = tds.eq(6);
    const home = idsFrom(homeCell.find('a[href*="/mannschaft/"]').attr("href"));
    const guest = idsFrom(
      guestCell.find('a[href*="/mannschaft/"]').attr("href"),
    );
    const groupId = home?.groupId ?? guest?.groupId ?? "";
    const group = groups.get(groupId);
    const leagueShort = tds.eq(3).text().trim();
    const report = scoreCell.find('a[href*="/spielbericht/"]').attr("href");

    if (groupId && !group) {
      console.warn(
        `Gruppe ${groupId} (${leagueShort}) fehlt in der Mannschaftsübersicht — Liga bleibt als Kürzel`,
      );
    }

    const timeNote = tds.eq(1).find("span").text().trim();
    const scoreNote = scoreCell.find("span").text().trim();
    matches.push({
      date,
      dateDe,
      time:
        withoutNote(tds.eq(1).text(), timeNote).match(/\d{1,2}:\d{2}/)?.[0] ??
        "",
      timeNote,
      league: group?.league ?? leagueShort,
      leagueShort,
      ageClass: group?.ageClass,
      isCup: group?.isCup ?? /Pok/.test(leagueShort),
      groupId,
      home: homeCell.text().trim(),
      guest: guestCell.text().trim(),
      homeTeamId: home?.teamId ?? "",
      guestTeamId: guest?.teamId ?? "",
      score: withoutNote(scoreCell.text(), scoreNote),
      scoreNote,
      reportUrl: report ? BASE_URL + report : undefined,
      key: `${groupId}|${home?.teamId ?? ""}|${guest?.teamId ?? ""}`,
    });
  });

  return matches;
}

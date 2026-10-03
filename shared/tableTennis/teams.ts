// Tischtennis-URLs (mytischtennis.de) — einzige Quelle der Wahrheit,
// gemeinsam genutzt von website, news-generator und instagram-generator.
//
// Die Saison ergibt sich aus dem Datum (Wechsel am 1. Juli), die Vereins-ID
// (207077) ist stabil — Vereins-Spielplan und Mannschaftsübersicht brauchen
// zum Saisonwechsel also keine Pflege. Spiele aller Mannschaften liefert
// `scrapeClubSchedule` aus ./clubSchedule.ts.

/** Saison eines Datums im click-TT-Format, z.B. "26--27" (Wechsel am 1. Juli). */
export function seasonFor(date: Date): string {
  const startYear =
    date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
  const yy = (year: number) => String(year % 100).padStart(2, "0");
  return `${yy(startYear)}--${yy(startYear + 1)}`;
}

export const SEASON = seasonFor(new Date());

const CLUB_ID = "207077";
const CLUB_SLUG = "DJK_Sparta_Noris_N%C3%BCrnberg";
const clubBase = (season: string) =>
  `https://www.mytischtennis.de/click-tt/ByTTV/${season}/verein/${CLUB_ID}/${CLUB_SLUG}`;

/** Spielplan aller Vereinsmannschaften (Website). */
export const CLUB_SCHEDULE_URL = `${clubBase(SEASON)}/spielplan`;

/**
 * Spielplan mit Zeitraum-Filter. Ohne Parameter zeigt click-TT nur heute + 7
 * Tage an — in spielfreien Wochen also gar nichts. `date_start`/`date_end`
 * erwarten ISO-Daten (YYYY-MM-DD), beide Grenzen sind inklusiv. Die Saison
 * richtet sich nach `dateStart`.
 */
export function clubScheduleUrl(dateStart: Date, dateEnd: Date) {
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${clubBase(seasonFor(dateStart))}/spielplan?date_start=${iso(dateStart)}&date_end=${iso(dateEnd)}`;
}

/** Mannschaftsübersicht inkl. Liga und Tabellenplatz einer Saison. */
export function clubTeamsUrl(season = SEASON) {
  return `${clubBase(season)}/mannschaften`;
}

/** Mannschaftsübersicht der laufenden Saison (Website). */
export const CLUB_TEAMS_URL = clubTeamsUrl();

// Tischtennis-Mannschaften (mytischtennis.de) — einzige Quelle der Wahrheit,
// gemeinsam genutzt von website, news-generator und instagram-generator.
//
// JEDE SAISON AKTUALISIEREN: `SEASON` setzen und in `TEAM_PAGES` die Gruppen-
// und Mannschafts-IDs jeder Mannschaft aus den neuen click-TT-Links über-
// nehmen (die IDs wechseln jährlich, die Saison selbst kommt aus `SEASON`).
// Die Vereins-ID (207077) ist dagegen stabil.

export const SEASON = "26--27";

const CLUB_ID = "207077";
const CLUB_SLUG = "DJK_Sparta_Noris_N%C3%BCrnberg";
const CLUB_BASE = `https://www.mytischtennis.de/click-tt/ByTTV/${SEASON}/verein/${CLUB_ID}/${CLUB_SLUG}`;

/** Spielplan aller Vereinsmannschaften (Website). */
export const CLUB_SCHEDULE_URL = `${CLUB_BASE}/spielplan`;

/**
 * Spielplan mit Zeitraum-Filter. Ohne Parameter zeigt click-TT nur heute + 7
 * Tage an — in spielfreien Wochen also gar nichts. `date_start`/`date_end`
 * erwarten ISO-Daten (YYYY-MM-DD), beide Grenzen sind inklusiv.
 */
export function clubScheduleUrl(dateStart: Date, dateEnd: Date) {
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${CLUB_SCHEDULE_URL}?date_start=${iso(dateStart)}&date_end=${iso(dateEnd)}`;
}

/** Mannschaftsübersicht inkl. Tabellenplatz (Website). */
export const CLUB_TEAMS_URL = `${CLUB_BASE}/mannschaften`;

export interface TeamPage {
  /** Spielerbilanzen-Seite der Mannschaft; enthält auch den Spielplan. */
  url: string;
  league: string;
  /** Nur bei Jugendmannschaften gesetzt (z.B. "Jugend 19"). */
  ageClass?: string;
}

export const TEAM_PAGES: TeamPage[] = [
  {
    url: `https://www.mytischtennis.de/click-tt/ByTTV/${SEASON}/ligen/Erwachsene_Verbandsoberliga_Nord_(Bayerischer_TTV)/gruppe/524155/mannschaft/3118876/DJK_Sparta_Noris_N%C3%BCrnberg/spielerbilanzen/gesamt`,
    league: "Verbandsoberliga Nord",
  },
  {
    url: `https://www.mytischtennis.de/click-tt/ByTTV/${SEASON}/ligen/Erwachsene_Landesliga_Ostnordost_(Bayerischer_TTV)/gruppe/524198/mannschaft/3114661/DJK_Sparta_Noris_N%C3%BCrnberg_II/spielerbilanzen/gesamt`,
    league: "Landesliga Ostnordost",
  },
  {
    url: `https://www.mytischtennis.de/click-tt/ByTTV/${SEASON}/ligen/Erwachsene_Bezirksoberliga_(Bayerischer_TTV_-_Mittelfranken-Nord)/gruppe/523853/mannschaft/3116072/DJK_Sparta_Noris_N%C3%BCrnberg_III/spielerbilanzen/gesamt`,
    league: "Bezirksoberliga",
  },
  {
    url: `https://www.mytischtennis.de/click-tt/ByTTV/${SEASON}/ligen/Erwachsene_Bezirksklasse_A_Gruppe_3_S%C3%BCd_(Bayerischer_TTV_-_Mittelfranken-Nord)/gruppe/524000/mannschaft/3114897/DJK_Sparta_Noris_N%C3%BCrnberg_IV/spielerbilanzen/gesamt`,
    league: "Bezirksklasse A Gruppe 3 Süd",
  },
  {
    // Jugend läuft in click-TT unter eigener Vor-/Rückrunden-Staffel (JVR_…/…_Vorrunde, /vr).
    url: `https://www.mytischtennis.de/click-tt/ByTTV/JVR_${SEASON}/jugend-punktspiele-vr/Jugend_19_Bezirksklasse_D_Gruppe_5_(Bayerischer_TTV_-_Mittelfranken-Nord)_Vorrunde/gruppe/524420/mannschaft/3123919/DJK_Sparta_Noris_N%C3%BCrnberg/spielerbilanzen/vr`,
    league: "Jugend 19 Bezirksklasse D Gruppe 5",
    ageClass: "Jugend 19",
  },
];

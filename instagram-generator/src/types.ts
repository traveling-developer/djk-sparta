export type Fmt = "post45" | "story";

// Daten für das Spielankündigungs-Template (igMatchDay)
export interface MatchDayData {
  sport: string; // "Tischtennis" | "Fußball" — steht weiß im roten Balken
  kicker: string; // "Heimspiel · Landesliga Ostnordost"
  home: string; // "Sparta\nNoris II" — \n bricht die Zeile im Template
  guest: string;
  details: [string, string][]; // z.B. [["Datum", "Sa., 20.09."], ["Beginn", "14:00 Uhr"]]
  cta?: string; // roter Call-to-Action-Block unter den Details
}

// Daten für das Ergebnis-Template (IGResult)
export interface ResultData {
  sport: string; // "Tischtennis" — Label in der Diagonale
  league: string; // "Landesliga Ostnordost"
  home: string; // "Sparta\nNoris I" — \n bricht die Zeile im Template
  guest: string;
  score: string; // "5:5"
  label: string; // "Sieg" | "Niederlage" | "Unentschieden" | freier Text
  dateLine: string; // "Heimspiel · 11.04.2026"
}

// Daten für das News-Teaser-Template (IGReport)
export interface ReportData {
  badge: string; // "Spielbericht"
  headline: string[]; // bis zu 3 Zeilen, letzte Zeile in Sparta-Rot
  teaser: string;
  imageUrl?: string; // Sanity-Bild als Hintergrund, sonst Platzhalter
}

// Daten für das Tabellen-Template (IGTable)
export interface TableRow {
  rank: number;
  club: string;
  points: string; // mytischtennis-Format "29:7"
  isUs?: boolean;
}

export interface TableData {
  league: string;
  matchday?: string;
  rows: TableRow[];
}

// Daten für die "Neue Website online"-Ankündigung (IGAnnWebsite).
// Alle Felder optional — das Template ist eine Marken-Ankündigung mit Defaults.
export interface WebsiteData {
  badge?: string; // Pill oben rechts, z.B. "Neu"
  kicker?: string; // "Frisch gelauncht"
  headline?: string[]; // bis zu 3 Zeilen, letzte Zeile rot + kursiv
  url?: string; // Adresszeile im Browser-Mockup, z.B. "djkspartanoris.de"
  hero?: string[]; // Hero-Text im Browser-Fenster, letzte Zeile rot
  body?: string; // Fließtext unter dem Browser-Mockup
}

// Daten für die "Nachwuchs gesucht"-Ankündigung (IGAnnYouth).
// Alle Felder optional — Marken-Ankündigung mit Defaults.
export interface YouthSession {
  day: string; // "Di"
  time: string; // "17:00 Uhr"
  group: string; // "U13–U15"
}
export interface YouthData {
  sport?: string; // Pill oben rechts, z.B. "Tischtennis"
  kicker?: string; // "Nachwuchs gesucht · ab 8 Jahren"
  headline?: string[]; // bis zu 3 Zeilen, letzte Zeile rot + kursiv
  body?: string; // Fließtext
  sessions?: YouthSession[]; // Trainingstag-Karten (z.B. Di / Do)
}

// Zielplatzierung auf Instagram: Feed-Post (4:5, Default) oder Story (9:16).
// Steuert sowohl das Render-Format (Fmt) als auch Zernios contentType.
export type Placement = "post" | "story";

export type PostJob = (
  | { kind: "matchday"; data: MatchDayData }
  | { kind: "result"; data: ResultData }
  | { kind: "report"; data: ReportData }
  | { kind: "table"; data: TableData }
  | { kind: "website"; data: WebsiteData }
  | { kind: "youth"; data: YouthData }
) & { placement?: Placement };

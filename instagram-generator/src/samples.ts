// Beispieldaten (aus den Original-Templates) für `--samples`:
// rendert alle Templates ohne Scraping/Sanity — zum visuellen Testen.
import type { PostJob } from "./types.ts";

export const sampleJobs: PostJob[] = [
  {
    kind: "matchday",
    data: {
      sport: "Tischtennis",
      kicker: "Heimspiel · Landesliga Ostnordost",
      home: "Sparta\nNoris II",
      guest: "ASV\nBurglengenfeld",
      details: [
        ["Datum", "Sa., 11.04."],
        ["Beginn", "14:00 Uhr"],
      ],
      cta: "Kommt vorbei & feuert uns an!",
    },
  },
  {
    kind: "matchday",
    placement: "story",
    data: {
      sport: "Fußball",
      kicker: "Auswärtsspiel · BK-Gr 7 N/F",
      home: " Tuspo Nürnberg Altstadt Kicker (9er) ",
      guest: " DJK Sparta Noris Bonifaz (9er)",
      details: [
        ["Datum", "So. 14.06."],
        ["Beginn", "15:00 Uhr"],
      ],
      cta: "Kommt vorbei & feuert uns an!",
    },
  },
  {
    kind: "matchday",
    placement: "story",
    data: {
      sport: "Fußball",
      kicker: "Heimspiel · D-Junioren",
      home: "Sparta\nNoris",
      guest: "TSV\nKornburg",
      details: [
        ["Datum", "Sa. 13.06."],
        ["Beginn", "11:00 Uhr"],
      ],
      cta: "Kommt vorbei & feuert uns an!",
    },
  },
  {
    kind: "result",
    data: {
      sport: "Tischtennis",
      league: "Landesliga Ostnordost",
      home: "Sparta\nNoris I",
      guest: "ASV\nBurglengenfeld",
      score: "5:5",
      label: "Hart umkämpftes Remis",
      dateLine: "Heimspiel · 11.04.2026",
    },
  },
  {
    kind: "report",
    data: {
      badge: "Spielbericht",
      headline: ["Geschlossene", "Leistung sichert", "den Punkt."],
      teaser:
        "Trotz frühem Rückstand kämpfte sich unsere Erste zurück und rettete im Heimspiel ein verdientes 5:5 über die Zeit.",
    },
  },
  {
    kind: "table",
    data: {
      league: "Landesliga Ostnordost",
      matchday: "Spieltag 19",
      rows: [
        { rank: 1, club: "TSV Altenberg", points: "45:3" },
        { rank: 2, club: "SV Eibach", points: "42:6" },
        { rank: 3, club: "FC Burgfarrnbach", points: "40:8" },
        { rank: 4, club: "Sparta Noris", points: "37:11", isUs: true },
        { rank: 5, club: "ASV Zirndorf", points: "35:13" },
        { rank: 6, club: "TSV Katzwang", points: "31:17" },
        { rank: 7, club: "SpVgg Mögeldorf", points: "27:21" },
      ],
    },
  },
  {
    kind: "website",
    data: {
      badge: "Neu",
      kicker: "Frisch gelauncht",
      headline: ["Neue", "Website", "ist online."],
      url: "djkspartanoris.de",
      hero: ["Wir sind", "Sparta."],
    },
  },
  {
    kind: "youth",
    data: {
      sport: "Tischtennis",
      kicker: "Nachwuchs gesucht · ab 8 Jahren",
      headline: ["Schläger", "schwingen", "statt scrollen."],
      body: "Komm in unsere Jugend! Erste zwei Trainings gratis, Schläger leihen wir dir. Spaß, Technik und ein starkes Team warten.",
      sessions: [
        { day: "Di", time: "17:00 Uhr", group: "U13–U15" },
        { day: "Do", time: "17:00 Uhr", group: "U16–U18" },
      ],
    },
  },
];

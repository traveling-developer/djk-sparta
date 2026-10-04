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
    placement: "story",
    data: {
      sport: "Tischtennis",
      venue: "Heimspiel",
      league: "Landesliga Ostnordost",
      home: "Sparta\nNoris I",
      guest: "Post SV\nNürnberg",
      score: "5:5",
      label: "Hart umkämpftes Remis",
      dateLine: "11.04.2026",
    },
  },
  {
    kind: "result",
    placement: "story",
    data: {
      sport: "Fußball",
      venue: "Auswärtsspiel",
      league: "BK-Gr 7 N/F",
      home: "Sparta\nNoris Bonifaz",
      guest: "Tuspo Nürnberg\nAltstadt",
      score: "3:1",
      label: "Verdienter Auswärtssieg",
      dateLine: "14.06.2026",
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
    placement: "story",
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
  {
    // Echte Daten vom Spielwochenende 02.–04.10.2026
    kind: "weekend",
    data: {
      sport: "Tischtennis",
      range: "02.–04. Oktober",
      matches: [
        {
          day: "Fr",
          date: "02.10.",
          league: "Jugend 19 · Bezirksklasse D",
          home: "Sparta Noris",
          guest: "SGV Nürnberg-Fürth 1883 II",
          homeScore: 9,
          guestScore: 1,
          homeIsUs: true,
          guestIsUs: false,
          outcome: "win",
        },
        {
          day: "Fr",
          date: "02.10.",
          league: "Bezirksoberliga",
          home: "Laufer SV",
          guest: "Sparta Noris III",
          homeScore: 7,
          guestScore: 3,
          homeIsUs: false,
          guestIsUs: true,
          outcome: "loss",
        },
        {
          day: "Sa",
          date: "03.10.",
          league: "Landesliga Ostnordost",
          home: "Sparta Noris II",
          guest: "ASV Burglengenfeld",
          homeScore: 4,
          guestScore: 6,
          homeIsUs: true,
          guestIsUs: false,
          outcome: "loss",
        },
        {
          day: "Sa",
          date: "03.10.",
          league: "Verbandsoberliga Nord",
          home: "TTSC Kümmersbruck",
          guest: "Sparta Noris",
          homeScore: 3,
          guestScore: 7,
          homeIsUs: false,
          guestIsUs: true,
          outcome: "win",
        },
      ],
    },
  },
];

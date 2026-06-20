// Tabellenstände der Ligen unserer Teams von mytischtennis.de.
// Tabellen-URL = Team-URL mit "/mannschaft/.../spielerbilanzen/gesamt" → "/tabelle/gesamt".
// Spalten der Tabellenseite: td(0)=Platz, td(1)=Verein, td(2)=Spiele, td(8)=Punkte "29:7".
import axios from "axios";
import * as cheerio from "cheerio";
import { TEAM_PAGES } from "../config.ts";
import { withRetry } from "../retry.ts";
import type { TableData, TableRow } from "../types.ts";

const CLUB = "Sparta";
const MAX_ROWS = 7; // wie im Design

function tableUrl(teamUrl: string): string {
  return teamUrl.replace(/\/mannschaft\/.*$/, "/tabelle/gesamt");
}

// "DJK Sparta Noris Nürnberg II" → "Sparta Noris II" (einzeilig für die Tabelle)
function shortClub(club: string): string {
  return club
    .replace(/\s+/g, " ")
    .replace(/^DJK Sparta Noris Nürnberg/, "Sparta Noris")
    .trim();
}

export async function getLeagueTables(): Promise<TableData[]> {
  const tables: TableData[] = [];
  const seenGroups = new Set<string>(); // Teams II + III spielen in derselben Gruppe

  for (const team of TEAM_PAGES) {
    const group = team.url.match(/gruppe\/(\d+)/)?.[1] ?? team.url;
    if (seenGroups.has(group)) continue;
    seenGroups.add(group);

    try {
      const { data } = await withRetry(() =>
        axios.get<string>(tableUrl(team.url)),
      );
      const $ = cheerio.load(data);

      const allRows: (TableRow & { played: string })[] = [];
      // Erste Tabelle der Seite ist die Liga-Tabelle (die zweite der Spielplan)
      $("table")
        .first()
        .find("tbody tr")
        .each((_, element) => {
          const tds = $(element).find("td");
          const rank = parseInt(tds.eq(0).text().trim(), 10);
          const club = tds.eq(1).text().trim();
          const points = tds.eq(8).text().trim();
          if (!rank || !club || !points) return;
          allRows.push({
            rank,
            club: shortClub(club),
            points,
            isUs: club.includes(CLUB),
            played: tds.eq(2).text().trim(),
          });
        });

      if (allRows.length === 0) {
        console.error(`No table rows parsed from ${tableUrl(team.url)}`);
        continue;
      }

      // Top 7, aber unsere Zeile(n) immer dabei
      const rows = allRows.filter((row, i) => i < MAX_ROWS || row.isUs);

      const us = allRows.find((row) => row.isUs);
      tables.push({
        league: team.league,
        matchday: us?.played ? `Nach ${us.played} Spielen` : undefined,
        rows: rows.map(({ played: _played, ...row }) => row),
      });
    } catch (error) {
      console.error(`Error scraping league table for ${team.url}:`, error);
    }
  }

  return tables;
}

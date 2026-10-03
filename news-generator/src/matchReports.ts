import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { pdfsFolderPath } from "./constants";
import { MatchReport } from "./types";
import {
  parseDeDate,
  scrapeClubSchedule,
} from "../../shared/tableTennis/clubSchedule";
import { headers, REQUEST_TIMEOUT_MS } from "../../shared/http";
import { summary } from "./summary";

const cfg = { headers, timeout: REQUEST_TIMEOUT_MS };

const get = async (url: string): Promise<string> =>
  (await axios.get<string>(url, cfg)).data;

export async function downloadMatchReports(): Promise<MatchReport[]> {
  // "DD.MM.YYYY" von gestern in Europe/Berlin (GitHub Actions läuft UTC)
  const yesterday = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(Date.now() - 24 * 60 * 60 * 1000));
  summary.setDay(yesterday);

  // Alle Mannschaften inkl. Jugend in einem Request — Vereins-Spielplan,
  // Parser in shared/tableTennis/clubSchedule.ts. Schlägt der Abruf fehl,
  // wird der Lauf rot statt still nichts zu schreiben.
  const day = parseDeDate(yesterday);
  const matches = await scrapeClubSchedule(
    { get, load: cheerio.load },
    { from: day, to: day, pauseMs: 2000 },
  );

  const matchReports: MatchReport[] = [];

  // Pokalspiele bekommen (noch) keinen Bericht; ohne Spielbericht-Link ist
  // das Spiel noch nicht eingetragen.
  for (const match of matches) {
    const entry = {
      match: `${match.home} - ${match.guest}`,
      league: match.ageClass
        ? `${match.league} (${match.ageClass})`
        : match.league,
    };

    if (match.isCup) {
      summary.add({ ...entry, status: "übersprungen", detail: "Pokalspiel" });
      continue;
    }
    if (!match.reportUrl) {
      summary.add({
        ...entry,
        status: "übersprungen",
        detail: "noch kein Spielbericht eingetragen",
      });
      continue;
    }

    try {
      matchReports.push(await downloadMatchReport(match.reportUrl));
    } catch (error) {
      // bereits in downloadMatchReport geloggt — übrige Spiele trotzdem
      summary.add({
        ...entry,
        status: "fehler",
        detail: `PDF-Download: ${errorMessage(error)}`,
      });
    }
  }

  return matchReports;
}

async function downloadMatchReport(
  matchDetailsPage: string,
): Promise<MatchReport> {
  try {
    const data = await get(matchDetailsPage);

    const $ = cheerio.load(data);

    const pdfLink = $('a:contains("PDF-Ansicht")').attr("href") || "";

    const pdfFileResponse = await axios.get(pdfLink, {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: "arraybuffer",
    });

    const league = $(".text-h4.py-4").eq(0).text().trim();
    const match = $(
      ".col-span-3.md\\:text-h3.text-h4.flex.items-center.justify-center.break-all",
    )
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" - ");
    const date = $(".text-h4.py-4").eq(1).text().trim();

    if (!fs.existsSync(pdfsFolderPath)) {
      fs.mkdirSync(pdfsFolderPath);
    }

    const fileData = Buffer.from(pdfFileResponse.data);
    const fileName = (match + " - " + date).replaceAll("/", "_");
    const filePath = pdfsFolderPath + fileName + ".pdf";

    fs.writeFileSync(filePath, fileData);

    return new MatchReport(league, match, date, filePath);
  } catch (error) {
    console.error(
      "Error downloading match report from " + matchDetailsPage + ":",
      error,
    );
    throw error;
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

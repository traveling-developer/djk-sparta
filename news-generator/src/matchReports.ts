import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { pdfsFolderPath } from "./constants";
import { MatchReport } from "./types";

const firstTeam =
  "https://www.mytischtennis.de/click-tt/ByTTV/25--26/ligen/Erwachsene_Verbandsoberliga_Nord_(Bayerischer_TTV)/gruppe/492343/mannschaft/2948996/Erwachsene_(4er)/spielerbilanzen/gesamt";
const secondTeam =
  "https://www.mytischtennis.de/click-tt/ByTTV/25--26/ligen/Erwachsene_Landesliga_Ostnordost_(Bayerischer_TTV)/gruppe/492047/mannschaft/2949395/Erwachsene_II_(4er)/spielerbilanzen/gesamt";
const thirdTeam =
  "https://www.mytischtennis.de/click-tt/ByTTV/25--26/ligen/Erwachsene_Landesliga_Ostnordost_(Bayerischer_TTV)/gruppe/492047/mannschaft/2949705/Erwachsene_III_(4er)/spielerbilanzen/gesamt";
const fourthTeam =
  "https://www.mytischtennis.de/click-tt/ByTTV/25--26/ligen/Erwachsene_Bezirksliga_Gruppe_2__S%C3%BCd--Ost_(Bayerischer_TTV_-_Mittelfranken-Nord)/gruppe/492063/mannschaft/2946875/Erwachsene_IV_(4er)/spielerbilanzen/gesamt";

export async function downloadMatchReports(): Promise<MatchReport[]> {
  const yesterday = new Date(
    new Date().setDate(new Date().getDate() - 1)
  ).toLocaleDateString("de", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const matchReports: MatchReport[] = [];

  for (const element of [firstTeam, secondTeam, thirdTeam, fourthTeam]) {
    matchReports.push(...(await downloadReportForTeam(yesterday, element)));
  }

  return matchReports;
}

async function downloadReportForTeam(yesterday: string, teamUrl: string) {
  const matchReports: MatchReport[] = [];
  try {
    const { data } = await axios.get(teamUrl);

    const $ = cheerio.load(data);

    for (const element of $("tbody tr")) {
      const currentDate = $(element).find("td").eq(0).text().trim();

      if (!currentDate.includes(yesterday)) {
        continue;
      }

      const matchDetailsPage =
        $(element).find("td").eq(5).find("a").attr("href") || "";

      if (matchDetailsPage == "") {
        continue;
      }

      const matchReport = await downloadMatchReport(matchDetailsPage);
      matchReports.push(matchReport);
    }
  } catch (error) {
    console.error("Error navigating to match details page:", error);
  }

  return matchReports;
}

async function downloadMatchReport(
  matchDetailsPage: string
): Promise<MatchReport> {
  try {
    const { data } = await axios.get(
      "https://www.mytischtennis.de" + matchDetailsPage
    );

    const $ = cheerio.load(data);

    const pdfLink = $('a:contains("PDF-Ansicht")').attr("href") || "";

    const pdfFileResponse = await axios.get(pdfLink, {
      responseType: "arraybuffer",
    });

    const league = $(".text-h4.py-4").eq(0).text().trim();
    const match = $(
      ".col-span-3.md\\:text-h3.text-h4.flex.items-center.justify-center.break-all"
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
      error
    );
    throw error;
  }
}

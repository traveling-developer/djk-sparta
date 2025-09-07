import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { pdfsFolderPath } from "./constants";
import { MatchReport } from "./types";

const currentSchedule =
  "https://www.mytischtennis.de/clicktt/ByTTV/24-25/verein/207077/DJK-Sparta-Noris-Nuernberg/spielplan/";

export async function downloadMatchReports(): Promise<MatchReport[]> {
  //TODO fix, so that all matches on this date will be downloaded
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const matchReports: MatchReport[] = [];

  try {
    const { data } = await axios.get(currentSchedule);

    const $ = cheerio.load(data);

    for (const element of $(".table tbody tr")) {
      const date = $(element).find("td").eq(0).text().trim();

      if (!date.includes(today)) {
        continue;
      }

      const matchDetailsPage =
        $(element).find("td").eq(8).find("a").attr("href") || "";

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
      "https://www.mytischtennis.de/" + matchDetailsPage
    );
    const $ = cheerio.load(data);

    const pdfLink = $('a:contains("PDF-Version")').attr("href") || "";

    const pdfFileResponse = await axios.get(pdfLink, {
      responseType: "arraybuffer",
    });

    const league = $(".well").find("h4").text().trim();
    const match = $(".well").find("h5").text().trim();
    const date = $(".well").find("h6").text().trim();

    if (!fs.existsSync(pdfsFolderPath)) {
      fs.mkdirSync(pdfsFolderPath);
    }

    const fileData = Buffer.from(pdfFileResponse.data);
    const fileName = (match + " - " + date).replaceAll(":", "-");
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

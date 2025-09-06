import axios from "axios";
import * as cheerio from "cheerio";

interface Match {
  date: string;
  time: string;
  homeTeam: string;
  guestTeam: string;
  result: string;
}

const url =
  "https://www.mytischtennis.de/clicktt/ByTTV/25-26/verein/207077/DJK-Sparta-Noris-Nuernberg/spielplan/";

export async function getMatches() {
  try {
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const allMatches: Match[] = [];

    $(".table tbody tr").each((index, element) => {
      let date = $(element).find("td").eq(0).text().trim();
      const time = $(element).find("td").eq(1).text().trim();
      const homeTeam = $(element).find("td").eq(4).text().trim();
      const guestTeam = $(element).find("td").eq(5).text().trim();
      const result = $(element).find("td").eq(8).text().trim();

      if (date === "") {
        date = allMatches[allMatches.length - 1].date;
      }

      allMatches.push({ date, time, homeTeam, guestTeam, result });
    });

    return allMatches.filter((match) => {
      return convertToDate(match.date, match.time) > new Date();
    });
  } catch (error) {
    console.error("Error downloading matches:", error);
    return [];
  }
}

export function convertToDate(date: string, time: string) {
  const sanitizedInput = date.replace(/^[A-Za-z.]+\s/, "");

  const [day, month, year] = sanitizedInput.split(".");
  const formattedDate = `20${year}-${month}-${day}T${time}:00`;

  return new Date(formattedDate);
}

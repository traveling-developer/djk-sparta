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
  "https://www.mytischtennis.de/click-tt/ByTTV/25--26/verein/207077/DJK_Sparta_Noris_N%C3%BCrnberg/spielplan";

export async function getMatches() {
  try {
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const allMatches: Match[] = [];

    $("tbody tr").each((index, element) => {
      const rawDate = $(element).find("td").eq(0).text().trim();
      const rawTime = $(element).find("td").eq(1).text().trim();
      const homeTeam = $(element).find("td").eq(4).text().trim();
      const guestTeam = $(element).find("td").eq(5).text().trim();
      const result = $(element).find("td").eq(6).text().trim();
      const { date, time } = formatDateTimeToGerman(rawDate, rawTime);
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

export function formatDateTimeToGerman(date: string, time: string) {
  const sanitizedDate = date.replace(/^[A-Za-z.,]+\s+/, "");
  const [day, month, year] = sanitizedDate.split(".");

  let hours: string, minutes: string;

  const amPmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (amPmMatch) {
    const [, h, m, period] = amPmMatch;
    const hour24 =
      (parseInt(h) % 12) + (period.toUpperCase() === "PM" ? 12 : 0);
    hours = hour24.toString();
    minutes = m;
  } else {
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      throw new Error(`Invalid time format: ${time}`);
    }
    [, hours, minutes] = timeMatch;
  }

  const dateObj = new Date(2000 + +year, +month - 1, +day, +hours, +minutes);

  const weekday = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][dateObj.getDay()];
  const pad = (n: number) => n.toString().padStart(2, "0");

  return {
    date: `${weekday}. ${pad(dateObj.getDate())}.${pad(dateObj.getMonth() + 1)}.${dateObj.getFullYear().toString().slice(-2)}`,
    time: `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`,
  };
}

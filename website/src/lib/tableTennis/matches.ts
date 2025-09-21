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
      let date = $(element).find("td").eq(0).text().trim();
      let time = $(element).find("td").eq(1).text().trim();
      const homeTeam = $(element).find("td").eq(4).text().trim();
      const guestTeam = $(element).find("td").eq(5).text().trim();
      const result = $(element).find("td").eq(6).text().trim();

      if (date === "") {
        date = allMatches[allMatches.length - 1].date;
      }

      date = formatDateToGerman(date);
      time = formatTimeToGerman(time);
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

export function formatDateToGerman(date: string) {
  const sanitizedInput = date.replace(/^[A-Za-z]+,\s+/, "");
  const [month, day, year] = sanitizedInput.split("/");

  const dateObj = new Date(
    `20${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
  );
  const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const weekday = weekdays[dateObj.getDay()];

  return `${weekday}. ${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

export function formatTimeToGerman(time: string) {
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${time}`);
  }

  let [, hours, minutes, period] = timeMatch;
  let hour24 = parseInt(hours);

  if (period.toUpperCase() === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period.toUpperCase() === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, "0")}:${minutes}`;
}

import axios from "axios";
import * as cheerio from "cheerio";
import { CLUB_TEAMS_URL } from "../../../../shared/tableTennis/teams";

interface Team {
  name: string;
  league: string;
  rank: string;
  points: string;
  link: string;
}

export async function getTeams(): Promise<Team[]> {
  try {
    const { data } = await axios.get(CLUB_TEAMS_URL);
    const $ = cheerio.load(data);

    const teams: Team[] = [];

    $("tbody tr").each((index, element) => {
      let name = $(element)
        .find("td")
        .eq(0)
        .text()
        .trim()
        .replace(/\s?\(.*?\)/, "");
      name = name.replace("Erwachsene", "Herren");

      if (name == "Herren") {
        name = "Herren I";
      }

      const leagueElement = $(element).find("td").eq(1);
      const league = leagueElement
        .text()
        .trim()
        .replace("Erwachsene", "")
        .replace("(Bayerischer TTV)", "")
        .replace(/\s?\(Bayerischer TTV - Mittelfranken-Nord\)/, "");

      const linkHref = leagueElement.find("a").attr("href");
      const link = linkHref ? "https://www.mytischtennis.de" + linkHref : "";

      const rank = $(element).find("td").eq(3).text().trim();
      const points = $(element).find("td").eq(4).text().trim();

      if (league.includes("Pokal") || league.includes("Relegation")) {
        return;
      }

      teams.push({ name: name, league, rank, points, link });
    });

    return teams;
  } catch (error) {
    console.error("Error downloading teams:", error);
    return [];
  }
}

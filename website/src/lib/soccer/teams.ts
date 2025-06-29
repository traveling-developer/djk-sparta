import axios, { type AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";

interface Team {
  name: string;
  league: string;
  rank: string;
  goalDifference: string;
  link: string;
}

const url =
  "https://www.bfv.de/vereine/djk-sparta-noris-nuernberg/00ES8GNKEO00001DVV0AG08LVUPGND5I";
const config: AxiosRequestConfig = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/112.0.0.0 Safari/537.36",
    Accept: "text/html",
  },
};

export async function getTeams(juniors: boolean): Promise<Team[]> {
  try {
    const { data } = await axios.get(url, config);

    const $ = cheerio.load(data);

    const teams: Team[] = [];

    const entries = $(".bfv-composition-entry");
    for (const element of entries) {
      let name = $(element)
        .find(".bfv-composition-entry__category")
        .text()
        .trim();
      const linkToDetailsPage = $(element).find("a").attr("href") || "";
      const infosFromSubPage = await getInfosFromSubPage(linkToDetailsPage);

      if (juniors == true) {
        if (!name.includes("Junioren")) {
          continue;
        } else if (
          infosFromSubPage.rank == "0" &&
          infosFromSubPage.goalDifference == "0:0"
        ) {
          continue;
        } else {
          if (name == "E-Junioren") {
            const newLocal = $(element)
              .find(".bfv-composition-entry__team-name")
              .text()
              .trim();
            if (newLocal.includes("2")) {
              name = "E2-Junioren";
            } else {
              name = "E1-Junioren";
            }
          }
        }
      } else {
        if (name.includes("Junioren")) {
          continue;
        }
      }

      teams.push({
        name,
        league: infosFromSubPage.league!,
        rank: infosFromSubPage.rank!,
        goalDifference: infosFromSubPage.goalDifference!,
        link: infosFromSubPage.leagueLink!,
      });
    }

    return teams;
  } catch (error) {
    console.error("Error downloading teams:", error);
    return [];
  }
}

async function getInfosFromSubPage(link: string) {
  try {
    const { data } = await axios.get(link, config);
    const $ = cheerio.load(data);

    let league;
    let leagueLink;
    let rank;
    let goalDifference;

    for (const element of $(".bfv-game-info-entry")) {
      if (
        $(element).find(".bfv-game-info-entry__title").text().trim() === "Liga"
      ) {
        league = $(element).find("a").text().trim();
        leagueLink = $(element).find("a").attr("href") || "";
      }
      if (
        $(element).find(".bfv-game-info-entry__title").text().trim() ===
        "tabellenplatz"
      ) {
        rank = $(element).find(".bfv-game-info-entry__text ").text().trim();
      }
      if (
        $(element).find(".bfv-game-info-entry__title").text().trim() ===
        "torverhältnis"
      ) {
        goalDifference = $(element)
          .find(".bfv-game-info-entry__text ")
          .text()
          .trim();
      }
    }
    return { league, rank, goalDifference, leagueLink };
  } catch (error) {
    console.error("Error downloading teams:", error);
    return {};
  }
}

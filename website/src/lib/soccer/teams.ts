import axios, { type AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";

interface Team {
  name: string;
  league: string;
  rank: string;
  goalDifference: string;
  link: string;
  played?: number;
  w?: number;
  d?: number;
  l?: number;
  pts?: number | string;
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

      if (infosFromSubPage.league?.startsWith("HKM_")) {
        continue;
      }

      if (juniors == true) {
        if (!name.includes("Junioren")) {
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
          if (name == "F-Junioren") {
            const newLocal = $(element)
              .find(".bfv-composition-entry__team-name")
              .text()
              .trim();
            if (newLocal.includes("2")) {
              name = "F2-Junioren";
            } else {
              name = "F1-Junioren";
            }
            infosFromSubPage.rank = "n.a.";
            infosFromSubPage.goalDifference = "n.a.";
            infosFromSubPage.spartaStats = { pts: "n.a." };
          }
        }
      } else {
        if (name.includes("Junioren")) {
          continue;
        }
      }

      teams.push({
        name,
        league: infosFromSubPage.league ?? "",
        rank: infosFromSubPage.rank ?? "",
        goalDifference: infosFromSubPage.goalDifference ?? "",
        link: infosFromSubPage.leagueLink ?? "",
        played: infosFromSubPage.spartaStats?.played,
        w: infosFromSubPage.spartaStats?.w,
        d: infosFromSubPage.spartaStats?.d,
        l: infosFromSubPage.spartaStats?.l,
        pts: infosFromSubPage.spartaStats?.pts,
      });
    }

    return teams;
  } catch (error) {
    console.error("Error downloading teams:", error);
    return [];
  }
}

interface SubPageInfo {
  league?: string;
  leagueLink?: string;
  rank?: string;
  goalDifference?: string;
  spartaStats?: {
    played?: number;
    w?: number;
    d?: number;
    l?: number;
    pts?: number | string;
  };
}

async function getInfosFromSubPage(link: string): Promise<SubPageInfo> {
  try {
    const { data } = await axios.get(link, config);
    const $ = cheerio.load(data);

    let league: string | undefined;
    let leagueLink: string | undefined;
    let rank: string | undefined;
    let goalDifference: string | undefined;

    for (const element of $(".bfv-game-info-entry")) {
      const title = $(element)
        .find(".bfv-game-info-entry__title")
        .text()
        .trim();
      if (title === "Liga") {
        league = $(element).find("a").text().trim();
        leagueLink = $(element).find("a").attr("href") || link;
      }
      if (title === "tabellenplatz") {
        rank = $(element).find(".bfv-game-info-entry__text ").text().trim();
      }
      if (title === "torverhältnis") {
        goalDifference = $(element)
          .find(".bfv-game-info-entry__text ")
          .text()
          .trim();
      }
    }

    let spartaStats: SubPageInfo["spartaStats"];
    for (const row of $(".bfv-table-entry--data")) {
      const $row = $(row);
      const teamCell = $row.find(".bfv-table-entry__cell--team");
      const teamName = (teamCell.find("a").text() || teamCell.text()).trim();
      if (!/sparta/i.test(teamName)) continue;

      spartaStats = {
        played: parseInt(
          $row.find(".bfv-table-entry__cell--matches").text().trim(),
          10,
        ),
        w: parseInt(
          $row.find(".bfv-table-entry__cell--wins").text().trim(),
          10,
        ),
        d: parseInt(
          $row.find(".bfv-table-entry__cell--draws").text().trim(),
          10,
        ),
        l: parseInt(
          $row.find(".bfv-table-entry__cell--loses").text().trim(),
          10,
        ),
        pts: parseInt(
          $row.find(".bfv-table-entry__cell--score").text().trim(),
          10,
        ),
      };
      break;
    }

    return { league, rank, goalDifference, leagueLink, spartaStats };
  } catch (error) {
    console.error("Error downloading teams:", error);
    return {};
  }
}

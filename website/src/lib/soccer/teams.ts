import axios, { type AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import { SOCCER_CLUB_URL } from "../../../../shared/soccer/constants";
import { headers } from "../../../../shared/http";
import { readGameInfo } from "../../../../shared/soccer/bfv";

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

const url = SOCCER_CLUB_URL;
const config: AxiosRequestConfig = { headers };

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
          // TEMPORARY: We currently have no A-Junioren — filter them out.
          if (name.includes("A-Junioren")) {
            continue;
          }
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

    for (const element of $(".bfv-game-info-entry")) {
      const title = $(element)
        .find(".bfv-game-info-entry__title")
        .text()
        .trim();
      if (title === "Liga") {
        league = $(element).find("a").text().trim();
        leagueLink = $(element).find("a").attr("href") || link;
        break;
      }
    }

    const rank = readGameInfo($, "tabellenplatz");
    const goalDifference = readGameInfo($, "torverhältnis");

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

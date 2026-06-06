import axios, { type AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import { scrapeBfvMatches } from "../../../../shared/soccer/bfv";
import { SOCCER_CLUB_URL } from "../../../../shared/soccer/constants";
import { headers } from "../../../../shared/http";
import { formatBerlin } from "../../../../shared/soccer/format";

interface Match {
  date: string;
  time: string;
  homeTeam: string;
  guestTeam: string;
  start: Date;
}

const config: AxiosRequestConfig = { headers };

const get = async (url: string): Promise<string> =>
  (await axios.get<string>(url, config)).data;

export async function getMatches(): Promise<Match[]> {
  const matches = await scrapeBfvMatches(
    { get, load: cheerio.load },
    { clubUrl: SOCCER_CLUB_URL, includeJuniors: false },
  );

  const now = new Date();

  return matches
    .filter((match) => match.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((match) => {
      const { date, time } = formatBerlin(match.start, { year: true });
      return {
        date,
        time,
        homeTeam: match.home,
        guestTeam: match.guest,
        start: match.start,
      };
    });
}

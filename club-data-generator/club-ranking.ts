import axios from 'axios';
import * as cheerio from 'cheerio';

const url = 'https://www.mytischtennis.de/clicktt/ByTTV/24-25/verein/207077/DJK-Sparta-Noris-Nuernberg/mannschaftsmeldungendetails/H/vr/';

export interface Player {
  rank: string;
  firstName: string;
  lastName: string;
  qttr: string;
}

export async function getClubRanking() {
  try {
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const players: Player[] = [];

    $('table tbody tr').each((index, element) => {
      const rank = $(element).find('td').eq(0).text().trim();
      const qttr = $(element).find('td').eq(1).text().trim();
      const name = $(element).find('td').eq(2).text().trim();

      if (rank.length == 0) {
        return;
      }

      const nameParts = name.split(',');
      const lastName = nameParts[0].trim();
      const firstName = nameParts[1].trim();

      players.push({ rank, firstName, lastName, qttr });
    });

    return players;
  } catch (error) {
    console.error('Error downloading club ranking', error);
  }
}

import axios from 'axios';
import * as cheerio from 'cheerio';

interface Team {
    teamName: string;
    league: string;
    rank: string;
    points: string;
}

const url = 'https://www.mytischtennis.de/clicktt/ByTTV/24-25/verein/207077/DJK-Sparta-Noris-Nuernberg/mannschaften/';

export async function getTeams() {
    try {
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const teams: Team[] = [];

        $('.table tbody tr').each((index, element) => {
            const teamName = $(element).find('td').eq(0).text().trim();
            const league = $(element).find('td').eq(1).text().trim();
            const rank = $(element).find('td').eq(3).text().trim();
            const points = $(element).find('td').eq(4).text().trim();

            if (league.includes('Pokal')) {
                return;
            }

            teams.push({ teamName, league, rank, points });
        });

        return teams;
    } catch (error) {
        console.error('Error downloading teams:', error);
    }
}


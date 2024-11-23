import axios from 'axios';
import * as cheerio from 'cheerio';

interface Team {
    name: string;
    league: string;
    rank: string;
    points: string;
    link: string;
}

const url = 'https://www.mytischtennis.de/clicktt/ByTTV/24-25/verein/207077/DJK-Sparta-Noris-Nuernberg/mannschaften/';

export async function getTeams(): Promise<Team[]> {
    try {
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const teams: Team[] = [];

        $('.table tbody tr').each((index, element) => {
            let name = $(element).find('td').eq(0).text().trim().replace(/\s?\(.*?\)/, '');
            if (name == 'Herren') {
                name = 'Herren I';
            }
            const leagueElement = $(element).find('td').eq(1);
            const league = leagueElement.text().trim().replace(/\s?\(Bayerischer TTV\)/, '').replace(/\s?\(Bayerischer TTV - Mittelfranken-Nord\)/, '');
            const link = 'https://www.mytischtennis.de/' + leagueElement.children().first().attr('href')!;
            const rank = $(element).find('td').eq(3).text().trim();
            const points = $(element).find('td').eq(4).text().trim();

            if (league.includes('Pokal')) {
                return;
            }

            teams.push({ name: name, league, rank, points, link });
        });

        return teams;
    } catch (error) {
        console.error('Error downloading teams:', error);
        return [];
    }
}
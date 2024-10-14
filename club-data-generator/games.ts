import axios from 'axios';
import * as cheerio from 'cheerio';

interface Match {
    date: string;
    time: string;
    homeTeam: string;
    guestTeam: string;
    result: string;
}

const url = 'https://www.mytischtennis.de/clicktt/ByTTV/24-25/verein/207077/DJK-Sparta-Noris-Nuernberg/spielplan/';

export async function getMatches() {
    try {
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const matches: Match[] = [];

        $('.table tbody tr').each((index, element) => {
            const date = $(element).find('td').eq(0).text().trim();
            const time = $(element).find('td').eq(1).text().trim();
            const homeTeam = $(element).find('td').eq(4).text().trim();
            const guestTeam = $(element).find('td').eq(5).text().trim();
            const result = $(element).find('td').eq(8).text().trim();

            matches.push({ date, time, homeTeam, guestTeam, result });
        });

        return matches;
    } catch (error) {
        console.error('Error downloading matchs:', error);
    }
}


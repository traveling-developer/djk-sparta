import axios from 'axios';
import * as cheerio from 'cheerio';

interface Team {
    name: string;
    league: string;
    rank: string;
    goalDifference: string;
    link: string;
}

const url = 'https://www.bfv.de/vereine/djk-sparta-noris-nuernberg/00ES8GNKEO00001DVV0AG08LVUPGND5I';

export async function getTeams(): Promise<Team[]> {
    try {
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const teams: Team[] = [];

        const entries = $('.bfv-composition-entry');
        for (const element of entries) {
            const name = $(element).find('.bfv-composition-entry__category').text().trim();
            const linkToDetailsPage = $(element).find('a').attr('href') || '';
            const infosFromSubPage = await getInfosFromSubPage(linkToDetailsPage);

            teams.push({ name, league: infosFromSubPage.league!, rank: infosFromSubPage.rank!, goalDifference: infosFromSubPage.goalDifference!, link: infosFromSubPage.leagueLink! });
        }

        return teams;
    } catch (error) {
        console.error('Error downloading teams:', error);
        return [];
    }
}

async function getInfosFromSubPage(link: string) {
    try {
        const { data } = await axios.get(link);
        const $ = cheerio.load(data);

        let league;
        let leagueLink;
        let rank;
        let goalDifference;

        for (const element of $('.bfv-game-info-entry')) {
            if ($(element).find('.bfv-game-info-entry__title').text().trim() === 'Liga') {
                league = $(element).find('a').text().trim();
                leagueLink = $(element).find('a').attr('href') || '';
            }
            if ($(element).find('.bfv-game-info-entry__title').text().trim() === 'tabellenplatz') {
                rank = $(element).find('.bfv-game-info-entry__text ').text().trim();
            }
            if ($(element).find('.bfv-game-info-entry__title').text().trim() === 'torverhältnis') {
                goalDifference = $(element).find('.bfv-game-info-entry__text ').text().trim();
            }

        }
        return { league, rank, goalDifference, leagueLink };
    } catch (error) {
        console.error('Error downloading teams:', error);
        return {};
    }
}


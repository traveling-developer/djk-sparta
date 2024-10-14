import { getClubRanking } from "./club-ranking";
import { getMatches } from "./games";
import { getTeams } from "./teams";

async function main() {
    try {
        let clubRanking = await getClubRanking();

        let teams = await getTeams();

        let matches = await getMatches();

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

main();

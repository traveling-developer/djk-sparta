interface Match {
    date: string;
    time: string;
    homeTeam: string;
    guestTeam: string;
}

export function getMatches(): Match[] {
    const matches = [
        {
            date: "Fr. 21.03.25",
            time: "19:00",
            homeTeam: "DJK Eibach",
            guestTeam: "Sparta AH"
        },
        {
            date: "Fr. 28.03.25",
            time: "19:00",
            homeTeam: "Sparta AH",
            guestTeam: "SC Worzeldorf"
        },
        {
            date: "Sa. 05.04.25",
            time: "16:00",
            homeTeam: "SV Wacker",
            guestTeam: "Sparta AH"
        },
        {
            date: "Mi. 07.05.25",
            time: "19:00",
            homeTeam: "TSV Kleinschwarzenlohe",
            guestTeam: "Sparta AH"
        },
        {
            date: "Fr. 16.05.25",
            time: "19:00",
            homeTeam: "Sparta AH",
            guestTeam: "TSV Happurg"
        },
        {
            date: "Fr. 23.05.25",
            time: "19:00",
            homeTeam: "Sparta AH",
            guestTeam: "TSV Wolkersdorf"
        },
        {
            date: "Mi. 04.06.25",
            time: "19:30",
            homeTeam: "SC Worzeldorf",
            guestTeam: "Sparta AH"
        },
        {
            date: "Mi. 25.06.25",
            time: "19:00",
            homeTeam: "Sparta AH",
            guestTeam: "Boca Seniors"
        },
        {
            date: "Fr. 04.07.25",
            time: "19:00",
            homeTeam: "Sparta AH",
            guestTeam: "TSV Langenzenn"
        },
        {
            date: "Mi. 09.07.25",
            time: "19:00",
            homeTeam: "SG Schwanstetten",
            guestTeam: "Sparta AH"
        }
    ];

    return matches.filter((match) => {
        return convertToDate(match.date, match.time) > new Date();
    });
}

export function convertToDate(date: string, time: string) {
    const sanitizedInput = date.replace(/^[A-Za-z.]+\s/, "");

    const [day, month, year] = sanitizedInput.split(".");
    const formattedDate = `20${year}-${month}-${day}T${time}:00`;

    return new Date(formattedDate);
}
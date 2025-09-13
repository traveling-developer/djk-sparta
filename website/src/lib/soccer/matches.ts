interface Match {
  date: string;
  time: string;
  homeTeam: string;
  guestTeam: string;
}

export function getMatches(): Match[] {
  const matches = [
    {
      date: "Do. 26.09.25",
      time: "19:00",
      homeTeam: "SC Germania Nbg. III",
      guestTeam: "DJK Sparta Noris",
    },

    {
      date: "Sa. 14.09.25",
      time: "13:00",
      homeTeam: "Tuspo Heroldsberg II",
      guestTeam: "DJK Sparta Noris",
    },
    {
      date: "Sa. 21.09.25",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "SV Laufamholz II",
    },

    {
      date: "Do. 03.10.25",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "ASN Pfeil-Phönix II (B9)",
    },
    {
      date: "Sa. 05.10.25",
      time: "13:00",
      homeTeam: "TV Glaishammer II (B9)",
      guestTeam: "DJK Sparta Noris",
    },
    {
      date: "Sa. 12.10.25",
      time: "13:00",
      homeTeam: "ASV Buchenbühl II (B9)",
      guestTeam: "DJK Sparta Noris",
    },
    {
      date: "Sa. 19.10.25",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "SpVgg Mögeldorf 2000 IV",
    },
    {
      date: "Sa. 26.10.25",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "SC Germania Nbg. III",
    },
    {
      date: "Sa. 02.11.25",
      time: "13:00",
      homeTeam: "FC Bayern Kickers U23 III",
      guestTeam: "DJK Sparta Noris",
    },
    {
      date: "Sa. 09.11.25",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "DJK BFC Nürnberg II",
    },
    {
      date: "Sa. 16.11.25",
      time: "13:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "TSV Maccabi Nürnberg II",
    },
    {
      date: "Sa. 15.03.26",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "SV Wacker Nürnberg II",
    },
    {
      date: "Sa. 22.03.26",
      time: "12:00",
      homeTeam: "SpVgg Zabo Eintracht II",
      guestTeam: "DJK Sparta Noris",
    },
    {
      date: "Sa. 29.03.26",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "Tuspo Heroldsberg II",
    },
    {
      date: "Sa. 12.04.26",
      time: "13:00",
      homeTeam: "SV Laufamholz II",
      guestTeam: "DJK Sparta Noris",
    },
    {
      date: "Sa. 26.04.26",
      time: "12:45",
      homeTeam: "ASN Pfeil-Phönix II (B9)",
      guestTeam: "DJK Sparta Noris",
    },
    {
      date: "Sa. 03.05.26",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "TV Glaishammer II (B9)",
    },
    {
      date: "Sa. 10.05.26",
      time: "12:00",
      homeTeam: "DJK Sparta Noris",
      guestTeam: "ASV Buchenbühl II (B9)",
    },
    {
      date: "Sa. 17.05.26",
      time: "15:00",
      homeTeam: "SpVgg Mögeldorf 2000 IV",
      guestTeam: "DJK Sparta Noris",
    },
    {
      date: "Sa. 28.09.25",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "ASV Fürth IV Armenia",
    },
    {
      date: "Do. 03.10.25",
      time: "09:30",
      homeTeam: "FC Blau-Schwarz 88",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 05.10.25",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "SC Germania Nbg. IIa (9er)",
    },
    {
      date: "Sa. 12.10.25",
      time: "09:30",
      homeTeam: "ASV Zirndorf PM Wildner (9er)",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 19.10.25",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "Zabo United",
    },
    {
      date: "Sa. 26.10.25",
      time: "10:00",
      homeTeam: "Pegnitzkicker Nbg. Stadtverwaltung (9er)",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 02.11.25",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "ATV 1873 Frankonia Nbg. Dritte",
    },
    {
      date: "Do. 07.11.25",
      time: "19:00",
      homeTeam: "Kriemhild-Funker (9er)",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 16.11.25",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "FSV Stadeln 1b Westphal",
    },
    {
      date: "Sa. 23.11.25",
      time: "10:00",
      homeTeam: "FC Stein II (9er)",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 30.11.25",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "Tuspo Nürnberg Altstadt Kicker (9er)",
    },
    {
      date: "Sa. 07.12.25",
      time: "09:00",
      homeTeam: "SpVgg Nürnberg AH/PM",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Do. 13.03.26",
      time: "19:00",
      homeTeam: "ASV Fürth IV Armenia",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 22.03.26",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "FC Blau-Schwarz 88",
    },
    {
      date: "Sa. 29.03.26",
      time: "09:00",
      homeTeam: "SC Germania Nbg. IIa (9er)",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 12.04.26",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "ASV Zirndorf PM Wildner (9er)",
    },
    {
      date: "Do. 17.04.26",
      time: "19:00",
      homeTeam: "Zabo United",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 26.04.26",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "Pegnitzkicker Nbg. Stadtverwaltung (9er)",
    },
    {
      date: "Sa. 03.05.26",
      time: "09:30",
      homeTeam: "ATV 1873 Frankonia Nbg. Dritte",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 10.05.26",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "Kriemhild-Funker (9er)",
    },
    {
      date: "Sa. 17.05.26",
      time: "09:30",
      homeTeam: "FSV Stadeln 1b Westphal",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 07.06.26",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "FC Stein II (9er)",
    },
    {
      date: "Sa. 14.06.26",
      time: "08:45",
      homeTeam: "Tuspo Nürnberg Altstadt Kicker (9er)",
      guestTeam: "DJK Sparta Noris Bonifaz",
    },
    {
      date: "Sa. 21.06.26",
      time: "09:00",
      homeTeam: "DJK Sparta Noris Bonifaz",
      guestTeam: "SpVgg Nürnberg AH/PM",
    },
  ];

  return matches
    .filter((match) => {
      return convertToDate(match.date, match.time) > new Date();
    })
    .sort((a, b) => {
      return (
        convertToDate(a.date, a.time).getTime() -
        convertToDate(b.date, b.time).getTime()
      );
    });
}

export function convertToDate(date: string, time: string) {
  const sanitizedInput = date.replace(/^[A-Za-z.]+\s/, "");

  const [day, month, year] = sanitizedInput.split(".");
  const formattedDate = `20${year}-${month}-${day}T${time}:00`;

  return new Date(formattedDate);
}

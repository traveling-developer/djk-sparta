import { publishReport } from "./sanityClient";
import { generateReport } from "./genai";
import { downloadMatchReports, errorMessage } from "./matchReports";
import { summary } from "./summary";

async function main() {
  let matchReports = await downloadMatchReports();

  // Ein fehlgeschlagener Bericht bricht die übrigen nicht ab; der Lauf wird
  // am Ende trotzdem rot.
  for (const report of matchReports) {
    const entry = { match: report.match, league: report.league };
    let stage = "Text generieren";
    try {
      await generateReport(report);
      stage = "in Sanity veröffentlichen";
      const id = await publishReport(report);
      summary.add({
        ...entry,
        status: "veröffentlicht",
        detail: `„${report.title}“ (${id})`,
      });
    } catch (error) {
      console.error(`Fehler bei ${report.match} (${stage}):`, error);
      summary.add({
        ...entry,
        status: "fehler",
        detail: `${stage}: ${errorMessage(error)}`,
      });
    }
  }
}

main()
  .catch((error) => {
    console.error("Abbruch:", error);
    summary.add({
      match: "—",
      league: "—",
      status: "fehler",
      detail: `Abbruch: ${errorMessage(error)}`,
    });
  })
  .finally(() => {
    summary.print();
    if (summary.hasErrors()) process.exitCode = 1;
  });

import { publishReport } from "./sanityClient";
import { generateReport } from "./genai";
import { downloadMatchReports } from "./matchReports";

async function main() {
  let matchReports = await downloadMatchReports();

  for (const report of matchReports) {
    await generateReport(report);
    await publishReport(report);
  }
}

main();

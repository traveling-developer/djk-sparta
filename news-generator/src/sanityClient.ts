import { randomUUID } from "crypto";
import { createClient } from "@sanity/client";
import type { MatchReport } from "./types";

export const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
  apiVersion: "2024-10-01",
});
export default client;

export async function publishReport(report: MatchReport) {
  const exampleNewsObject = {
    _id: randomUUID().toString(),
    _type: "news",
    title: report.title,
    content: report.content,
    category: "table-tennis",
    releaseDate: new Date().toISOString().split("T")[0],
  };

  await client.createIfNotExists(exampleNewsObject);
}

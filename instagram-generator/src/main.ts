import fs from "node:fs";
import { chromium } from "playwright";
import {
  DRY_RUN,
  SAMPLES,
  DRAFT,
  SCHEDULE_LEAD_SECONDS,
  SCHEDULE_STAGGER_SECONDS,
} from "./config.ts";
import { todayIso } from "./dates.ts";
import {
  getYesterdayResults,
  getTodayAnnouncements,
} from "./scrape/matchResults.ts";
import { getUpcomingSoccerAnnouncements } from "./scrape/soccerMatches.ts";
import { getLeagueTables } from "./scrape/leagueTable.ts";
import { getFreshNews, newsToReport } from "./sanityRead.ts";
import { renderJob } from "./render/renderer.ts";
import { captionFor } from "./captions.ts";
import { uploadImage, createPost } from "./zernio.ts";
import { sampleJobs } from "./samples.ts";
import type { PostJob } from "./types.ts";

async function collectJobs(): Promise<PostJob[]> {
  if (SAMPLES) return sampleJobs;

  const jobs: PostJob[] = [];

  for (const matchDay of await getUpcomingSoccerAnnouncements()) {
    jobs.push({ kind: "matchday", data: matchDay, placement: "story" });
  }

  // for (const matchDay of await getTodayAnnouncements()) {
  //   jobs.push({ kind: "matchday", data: matchDay });
  // }

  // for (const result of await getYesterdayResults()) {
  //   jobs.push({ kind: "result", data: result });
  // }

  // for (const news of await getFreshNews(todayIso())) {
  //   jobs.push({ kind: "report", data: newsToReport(news) });
  // }

  // // Tabelle nur posten, wenn es gestern auch Ergebnisse gab
  // if (jobs.some((job) => job.kind === "result")) {
  //   for (const table of await getLeagueTables()) {
  //     jobs.push({ kind: "table", data: table });
  //   }
  // }

  return jobs;
}

async function main() {
  const jobs = await collectJobs();

  if (jobs.length === 0) {
    console.log("Nothing to post today.");
    return;
  }

  // Nur lokal rendern (kein Zernio): explizites --dry-run, oder --samples ohne
  // --draft. Mit --draft werden auch Sample-Bilder zu Zernio hochgeladen.
  const localOnly = DRY_RUN || (SAMPLES && !DRAFT);

  // Veröffentlichungen staffeln: erster Post nach LEAD Sekunden, dann je
  // STAGGER Sekunden Abstand. Bei --draft irrelevant (Entwürfe posten nicht).
  const scheduleBase = Date.now() + SCHEDULE_LEAD_SECONDS * 1000;

  const browser = await chromium.launch();
  try {
    for (const [i, job] of jobs.entries()) {
      const png = await renderJob(job, browser);
      const caption = captionFor(job);

      if (localOnly) {
        fs.mkdirSync("./out", { recursive: true });
        const file = `./out/${job.kind}-${i}.png`;
        fs.writeFileSync(file, png);
        console.log(`[dry-run] ${file} (${(png.length / 1024).toFixed(0)} KB)`);
        console.log(`[dry-run] caption:\n${caption}\n`);
        continue;
      }

      const scheduledFor = DRAFT
        ? undefined
        : new Date(
            scheduleBase + i * SCHEDULE_STAGGER_SECONDS * 1000,
          ).toISOString();

      const imageUrl = await uploadImage(
        png,
        `${job.kind}-${Date.now()}-${i}.png`,
      );
      const postId = await createPost(imageUrl, caption, {
        story: job.placement === "story",
        draft: DRAFT,
        scheduledFor,
      });
      const verb = DRAFT ? "Drafted" : "Scheduled";
      const tag = job.placement === "story" ? " (story)" : "";
      const when = scheduledFor ? ` @ ${scheduledFor}` : "";
      console.log(`${verb} ${job.kind}${tag}${when} → ${postId}`);
    }
  } finally {
    await browser.close();
  }
}

main();

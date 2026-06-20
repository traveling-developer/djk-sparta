// Rendert einen PostJob als PNG: HTML-Template → Playwright-Screenshot.
import type { Browser } from "playwright";
import { htmlShell } from "./htmlShell.ts";
import { igMatchDay } from "../templates/igMatchDay.ts";
import { igResult } from "../templates/igResult.ts";
import { igReport } from "../templates/igReport.ts";
import { igTable } from "../templates/igTable.ts";
import { igAnnWebsite } from "../templates/igAnnWebsite.ts";
import { igAnnYouth } from "../templates/igAnnYouth.ts";
import { FMT } from "../templates/shared.ts";
import type { Fmt, PostJob } from "../types.ts";

function jobToMarkup(job: PostJob, fmt: Fmt): string {
  switch (job.kind) {
    case "matchday":
      return igMatchDay(job.data, fmt);
    case "result":
      return igResult(job.data, fmt);
    case "report":
      return igReport(job.data, fmt);
    case "table":
      return igTable(job.data, fmt);
    case "website":
      return igAnnWebsite(job.data, fmt);
    case "youth":
      return igAnnYouth(job.data, fmt);
  }
}

export async function renderJob(
  job: PostJob,
  browser: Browser,
): Promise<Buffer> {
  // Story → 9:16 (1080×1920), sonst Feed-Post 4:5 (1080×1350).
  const fmt: Fmt = job.placement === "story" ? "story" : "post45";
  const { w, h } = FMT[fmt];
  const html = htmlShell(jobToMarkup(job, fmt));

  const page = await browser.newPage({
    viewport: { width: w + 120, height: h + 150 },
    deviceScaleFactor: 2, // 2× für scharfe Schrift
  });
  try {
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const frame = page.locator("#root > *").first();
    return await frame.screenshot({ type: "png" });
  } finally {
    await page.close();
  }
}

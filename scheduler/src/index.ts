// Startet die GitHub-Actions-Workflows pünktlich per workflow_dispatch.
// GitHubs eigener `schedule` verspätet sich bei Last um bis zu 30 min oder fällt
// ganz aus; Cloudflare Cron Triggers laufen zuverlässig zur Minute. Die Arbeit
// selbst (Playwright, Retry mit neuer Runner-IP) bleibt in GitHub Actions.

import { REQUEST_TIMEOUT_MS } from "../../shared/http.ts";

interface Env {
  // Fine-grained PAT, nur Repo djk-sparta, Berechtigung "Actions: Read and write"
  GITHUB_TOKEN: string;
  // "1" = Request nur loggen statt abschicken (lokal: .dev.vars)
  DRY_RUN?: string;
}

const REPO = "traveling-developer/djk-sparta";
const REF = "main";

// Cron (UTC) → Workflow + Inputs. Muss zu triggers.crons in wrangler.jsonc passen.
const JOBS: Record<
  string,
  { workflow: string; inputs?: Record<string, string> }
> = {
  "30 14 * * *": {
    workflow: "instagram-generator.yml",
    inputs: { only: "results" }, // Ergebnisse von gestern
  },
  "30 16 * * *": {
    workflow: "instagram-generator.yml",
    inputs: { only: "announcements" }, // Spielankündigungen in zwei Tagen
  },
  "0 8 * * 1": {
    workflow: "instagram-generator.yml",
    inputs: { only: "weekend" }, // Mo 10:00 MESZ / 09:00 MEZ: Wochenend-Rückblick TT
  },
  "0 2 * * *": { workflow: "news-generator.yml" }, // Spielberichte von gestern
};

export default {
  async scheduled(controller, env) {
    const job = JOBS[controller.cron];
    // Unbekannter Cron → Fehler, damit es in den Worker-Logs auffällt
    if (!job) throw new Error(`Kein Job für Cron "${controller.cron}"`);

    const url = `https://api.github.com/repos/${REPO}/actions/workflows/${job.workflow}/dispatches`;
    const body = JSON.stringify({ ref: REF, inputs: job.inputs ?? {} });

    if (env.DRY_RUN === "1") {
      console.log(`[dry-run] POST ${url} ${body}`);
      return;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // Ohne User-Agent lehnt die GitHub-API den Request ab
        "User-Agent": "djk-sparta-scheduler",
        "Content-Type": "application/json",
      },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    // Erfolg ist 204 (bzw. 200 mit Run-Details); alles andere als Fehler werfen
    if (!res.ok) {
      throw new Error(
        `Dispatch ${job.workflow} fehlgeschlagen: HTTP ${res.status} ${await res.text()}`,
      );
    }
    console.log(`${job.workflow} gestartet (${body})`);
  },
} satisfies ExportedHandler<Env>;

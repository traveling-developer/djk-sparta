// Dev-Preview-Server: rendert die Templates mit den Beispieldaten live im Browser.
//
//   npm run preview   →  http://localhost:4322
//
// Jeder Request rendert in einem frischen Node-Kindprozess (--render-Modus),
// dadurch wirken Änderungen an styles.ts/Templates sofort beim Neuladen (F5).
import http from "node:http";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { htmlShell } from "./render/htmlShell.ts";
import { sampleJobs } from "./samples.ts";
import { igMatchDay } from "./templates/igMatchDay.ts";
import { igResult } from "./templates/igResult.ts";
import { igReport } from "./templates/igReport.ts";
import { igTable } from "./templates/igTable.ts";
import { igAnnWebsite } from "./templates/igAnnWebsite.ts";
import { igAnnYouth } from "./templates/igAnnYouth.ts";
import { FMT } from "./templates/shared.ts";
import type { Fmt, PostJob } from "./types.ts";

const PORT = 4322;
const KINDS = [
  "matchday",
  "result",
  "report",
  "table",
  "website",
  "youth",
] as const;

function renderMarkup(kind: string, fmt: Fmt): string {
  const job = sampleJobs.find((j: PostJob) => j.kind === kind);
  if (!job) throw new Error(`No sample for kind "${kind}"`);
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

// --- Kindprozess-Modus: HTML auf stdout ---
if (process.argv[2] === "--render") {
  const kind = process.argv[3] ?? "result";
  const fmt = (process.argv[4] ?? "post45") as Fmt;
  // Auf das Leeren von stdout warten, bevor wir beenden — bei einer Pipe
  // (execFile) ist write() asynchron gepuffert, ein sofortiges process.exit()
  // würde große Ausgaben (z.B. das Bild als Data-URI) abschneiden.
  process.stdout.write(htmlShell(renderMarkup(kind, fmt)), () =>
    process.exit(0),
  );
} else {
  startServer();
}

// --- Server-Modus ---
function startServer(): void {
const selfPath = fileURLToPath(import.meta.url);

function indexHtml(): string {
  const cards = KINDS.map((kind) => {
    const links = (Object.keys(FMT) as Fmt[])
      .map((fmt) => `<a href="/${kind}?fmt=${fmt}">${FMT[fmt].label}</a>`)
      .join(" · ");
    return `
      <section>
        <h2>${kind}</h2>
        <p>${links}</p>
        <div class="thumb" style="height: ${1350 * 0.32}px;">
          <iframe src="/${kind}?fmt=post45" scrolling="no"></iframe>
        </div>
      </section>`;
  }).join("");

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>instagram-generator · Preview</title>
<style>
  body { margin: 0; padding: 32px 40px; background: #f0eee9; font-family: system-ui, sans-serif; color: #0C0C0E; }
  h1 { font-size: 22px; } h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
  p { font-size: 13px; } a { color: #D81E28; }
  main { display: flex; gap: 36px; flex-wrap: wrap; }
  .thumb { width: ${1080 * 0.32}px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.18); }
  .thumb iframe { width: 1080px; height: 1350px; border: 0; transform: scale(0.32); transform-origin: top left; pointer-events: none; }
</style>
</head>
<body>
<h1>Instagram-Templates · Beispieldaten</h1>
<p>Template-Code ändern (z.B. <code>src/templates/styles.ts</code>) und neu laden — jeder Request rendert frisch.</p>
<main>${cards}</main>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(indexHtml());
    return;
  }

  const kind = url.pathname.slice(1);
  if (!(KINDS as readonly string[]).includes(kind)) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
    return;
  }
  const fmtParam = url.searchParams.get("fmt") ?? "post45";
  const fmt = fmtParam in FMT ? fmtParam : "post45";

  // Frischer Prozess pro Request → Template-Änderungen wirken sofort
  execFile(
    process.execPath,
    [selfPath, "--render", kind, fmt],
    { maxBuffer: 10 * 1024 * 1024 },
    (error, stdout, stderr) => {
      if (error) {
        res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
        res.end(stderr || String(error));
        return;
      }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(stdout);
    },
  );
});

server.listen(PORT, () => {
  console.log(`Preview läuft: http://localhost:${PORT}`);
});
}

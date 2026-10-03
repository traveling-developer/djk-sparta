import fs from "fs";

// Sammelt, was der Lauf getan hat, und gibt es am Ende aus — auf der Konsole
// und (in GitHub Actions) als Job-Summary unter $GITHUB_STEP_SUMMARY.

type Status = "veröffentlicht" | "übersprungen" | "fehler";

interface Entry {
  match: string;
  league: string;
  status: Status;
  detail: string;
}

const ICON: Record<Status, string> = {
  veröffentlicht: "✅",
  übersprungen: "⏭️",
  fehler: "❌",
};

const entries: Entry[] = [];
let day = "";

export const summary = {
  setDay(value: string) {
    day = value;
  },
  add(entry: Entry) {
    entries.push(entry);
  },
  hasErrors(): boolean {
    return entries.some((e) => e.status === "fehler");
  },
  print() {
    const count = (s: Status) => entries.filter((e) => e.status === s).length;
    const totals =
      `${count("veröffentlicht")} veröffentlicht, ` +
      `${count("übersprungen")} übersprungen, ${count("fehler")} Fehler`;
    const heading = `Spielberichte vom ${day || "?"}`;

    const lines = [
      "",
      `===== ${heading} =====`,
      entries.length === 0
        ? "Keine Spiele gefunden."
        : `${entries.length} Spiel(e): ${totals}`,
      ...entries.map(
        (e) =>
          `${ICON[e.status]} ${e.match} (${e.league}) — ${e.status}: ${e.detail}`,
      ),
    ];
    console.log(lines.join("\n"));

    const stepSummary = process.env.GITHUB_STEP_SUMMARY;
    if (!stepSummary) return;

    const cell = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");
    const markdown = [
      `## ${heading}`,
      "",
      entries.length === 0 ? "Keine Spiele gefunden." : totals,
      "",
      ...(entries.length === 0
        ? []
        : [
            "| | Spiel | Liga | Ergebnis |",
            "| :-- | :-- | :-- | :-- |",
            ...entries.map(
              (e) =>
                `| ${ICON[e.status]} | ${cell(e.match)} | ${cell(e.league)} | ${cell(e.detail)} |`,
            ),
          ]),
      "",
    ];
    fs.appendFileSync(stepSummary, markdown.join("\n"));
  },
};

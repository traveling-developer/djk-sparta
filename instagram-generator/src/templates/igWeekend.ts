// WOCHENENDE — alle Ergebnisse eines Spielwochenendes (Fr–So) auf einem Post.
// Anzeigetafel-Optik: pro Spiel Heim/Gast untereinander mit Einzelscore,
// links Tag, rechts S/U/N-Kachel aus Sparta-Sicht. Bei vielen Spielen verdichtet
// der Renderer alles über --k, bis es in den Rahmen passt (ein Bild statt Karussell).
import {
  FMT,
  igFrame,
  igDiagonal,
  igHeader,
  igFooter,
  igKicker,
  igBadge,
} from "./shared.ts";
import { esc } from "./html.ts";
import type { Fmt, Outcome, WeekendData, WeekendMatch } from "../types.ts";

const OUTCOME_LETTER: Record<Outcome, string> = {
  win: "S",
  draw: "U",
  loss: "N",
  derby: "–",
};

function teamLine(name: string, score: number, isUs: boolean, won: boolean) {
  const classes = ["wk-line"];
  if (isUs) classes.push("us");
  if (won) classes.push("won");
  return `
    <div class="${classes.join(" ")}">
      <span class="wk-name">${esc(name)}</span>
      <span class="wk-score">${score}</span>
    </div>`;
}

function matchRow(m: WeekendMatch): string {
  return `
    <div class="wk-row ${m.outcome}">
      <div class="wk-day">
        <div class="wk-day-name">${esc(m.day)}</div>
        <div class="wk-day-date">${esc(m.date)}</div>
      </div>
      <div class="wk-body">
        <div class="wk-league">${esc(m.league)}</div>
        ${teamLine(m.home, m.homeScore, m.homeIsUs, m.homeScore > m.guestScore)}
        ${teamLine(m.guest, m.guestScore, m.guestIsUs, m.guestScore > m.homeScore)}
      </div>
      <div class="wk-outcome">${OUTCOME_LETTER[m.outcome]}</div>
    </div>`;
}

function tally(matches: WeekendMatch[]): string {
  const count = (o: Outcome) => matches.filter((m) => m.outcome === o).length;
  const cells: [number, string][] = [
    [count("win"), count("win") === 1 ? "Sieg" : "Siege"],
    [count("draw"), "Remis"],
    [count("loss"), count("loss") === 1 ? "Niederlage" : "Niederlagen"],
  ];
  return `
    <div class="wk-tally">
      ${cells
        .map(
          ([n, label]) => `
        <div class="wk-tally-cell">
          <span class="wk-tally-num">${n}</span>
          <span class="wk-tally-label">${label}</span>
        </div>`,
        )
        .join("")}
    </div>`;
}

export function igWeekend(data: WeekendData, fmt: Fmt = "post45"): string {
  const f = FMT[fmt];
  return igFrame(
    fmt,
    {},
    `
    ${igDiagonal({ top: Math.round(f.h * 0.155), h: 64, label: esc(data.sport) })}
    ${igHeader(igBadge("Ergebnisse"))}

    <div class="ig-main wk-main">
      ${igKicker(esc(`Spielwochenende · ${data.range}`), "wk-kicker")}
      <div class="wk-title">Das war das <span class="accent">Wochenende.</span></div>
      <div class="wk-list">${data.matches.map(matchRow).join("")}</div>
      ${tally(data.matches)}
    </div>

    ${igFooter()}`,
  );
}

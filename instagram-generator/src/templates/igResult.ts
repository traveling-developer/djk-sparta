// ERGEBNIS — Endergebnis (sportartübergreifend: Tischtennis, Fußball …).
// Port von tmp/insta/ig-templates-a.jsx (IGResult), parametrisiert über ResultData.
import {
  FMT,
  igFrame,
  igDiagonal,
  igHeader,
  igFooter,
  igKicker,
  igBadge,
} from "./shared.ts";
import { esc, escMultiLine } from "./html.ts";
import type { Fmt, ResultData } from "../types.ts";

// Letztes Wort des Labels kursiv (wie im Original: "Hart umkämpftes *Remis*")
function labelWithAccent(label: string): string {
  const words = label.split(" ");
  const last = words.pop() ?? "";
  const head = words.length > 0 ? esc(words.join(" ")) + " " : "";
  return `${head}<span style="font-style: italic;">${esc(last)}</span>`;
}

export function igResult(data: ResultData, fmt: Fmt = "post45"): string {
  const f = FMT[fmt];
  const kicker = data.league;
  // Story: Inhalt rückt nach oben, die Diagonale sitzt in der freien Zone
  // zwischen Header und Kicker (Position & Größe identisch zu Match Day).
  const diagonalTop = fmt === "story" ? 0.21 : 0.24;
  return igFrame(
    fmt,
    { bg: "var(--red)" },
    `
    ${igDiagonal({ top: Math.round(f.h * diagonalTop), h: 80, label: esc(data.sport), bg: "var(--ink)" })}
    ${igHeader(igBadge("Endergebnis", "var(--ink)"))}

    <div class="ig-main result-main">
      ${igKicker(esc(kicker), "result-kicker")}

      <div class="result-row">
        <div class="result-team">${escMultiLine(data.home)}</div>
        <div class="result-score-box">
          <div class="result-score">${esc(data.score)}</div>
        </div>
        <div class="result-team guest">${escMultiLine(data.guest)}</div>
      </div>

      <div class="result-bottom">
        <div class="result-label">${labelWithAccent(data.label)}</div>
        <div class="result-date">${esc(data.dateLine)}</div>
      </div>
    </div>

    ${igFooter("#fff")}`,
  );
}

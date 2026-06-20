// MATCH DAY — Spielankündigung.
// Port von tmp/insta/ig-templates-a.jsx (IGMatchDay), parametrisiert über MatchDayData.
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
import type { Fmt, MatchDayData } from "../types.ts";

export function igMatchDay(data: MatchDayData, fmt: Fmt = "post45"): string {
  const f = FMT[fmt];
  // Story: Inhalt ist größer skaliert (styles.ts) und rückt weiter nach oben —
  // die Diagonale wandert in die freie Zone zwischen Header und Kicker.
  const diagonalTop = fmt === "story" ? 0.21 : 0.24;

  const details = data.details
    .map(
      ([key, value]) => `
        <div class="md-cell">
          <div class="md-cell-key">${esc(key)}</div>
          <div class="md-cell-value">${esc(value)}</div>
        </div>`,
    )
    .join("");

  return igFrame(
    fmt,
    {},
    `
    ${igDiagonal({ top: Math.round(f.h * diagonalTop), h: 80, label: esc(data.sport) })}
    ${igHeader(igBadge("Match Day"))}

    <div class="ig-main md-main">
      ${igKicker(esc(data.kicker), "md-kicker")}

      <div class="md-vs-row">
        <div class="md-team home">
          <div class="md-team-name">${escMultiLine(data.home)}</div>
        </div>
        <div class="md-vs">VS</div>
        <div class="md-team guest">
          <div class="md-team-name">${escMultiLine(data.guest)}</div>
        </div>
      </div>

      <div class="md-details">${details}</div>
      ${data.cta ? `<div class="md-cta">${esc(data.cta)}</div>` : ""}
    </div>

    ${igFooter()}`,
  );
}

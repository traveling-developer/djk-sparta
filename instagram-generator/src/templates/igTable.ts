// TABELLE — Tabellenstand.
// Port von tmp/insta/ig-templates-b.jsx (IGTable), parametrisiert über TableData.
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
import type { Fmt, TableData } from "../types.ts";

export function igTable(data: TableData, fmt: Fmt = "post45"): string {
  const f = FMT[fmt];
  const kicker = data.matchday
    ? `${data.league} · ${data.matchday}`
    : data.league;

  const rows = data.rows
    .map((row) => {
      const classes = ["table-row"];
      if (row.isUs) classes.push("us");
      if (row.rank <= 3) classes.push("top3");
      return `
        <div class="${classes.join(" ")}">
          <span class="rank">${row.rank}</span>
          <span class="club">${esc(row.club)}</span>
          <span class="pts">${esc(row.points)}</span>
        </div>`;
    })
    .join("");

  return igFrame(
    fmt,
    {},
    `
    ${igDiagonal({ top: Math.round(f.h * 0.2), h: 70, opacity: 0.9 })}
    ${igHeader(igBadge("Tabelle"))}

    <div class="ig-main">
      ${igKicker(esc(kicker), "table-kicker")}
      <div class="table-title">So steht's.</div>

      <div>
        <div class="table-head">
          <span>#</span><span>Verein</span><span class="pts">Pkt</span>
        </div>
        ${rows}
      </div>
    </div>

    ${igFooter()}`,
  );
}

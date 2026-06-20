// SPIELBERICHT — Teaser (Foto-Hintergrund + Headline-Overlay).
// Port von tmp/insta/ig-templates-a.jsx (IGReport), parametrisiert über ReportData.
import {
  igFrame,
  igStripes,
  igHeader,
  igFooter,
  igBadge,
  igPlaceholder,
} from "./shared.ts";
import { esc } from "./html.ts";
import type { Fmt, ReportData } from "../types.ts";

export function igReport(data: ReportData, fmt: Fmt = "post45"): string {
  const background = data.imageUrl
    ? `<img src="${esc(data.imageUrl)}" alt="" />`
    : igPlaceholder("spiel-foto");

  const headline = data.headline
    .map((line, i) => {
      const accent = i === data.headline.length - 1 ? ' class="accent"' : "";
      return `${i > 0 ? "<br />" : ""}<span${accent}>${esc(line)}</span>`;
    })
    .join("");

  return igFrame(
    fmt,
    {},
    `
    <div class="report-bg">
      ${background}
      <div class="report-shade"></div>
    </div>
    ${igStripes()}
    ${igHeader()}

    <div class="ig-spacer"></div>

    <div class="report-body">
      ${igBadge(esc(data.badge))}
      <div class="report-headline">${headline}</div>
      <div class="report-teaser">${esc(data.teaser)}</div>
      <div class="report-cta"><span class="accent">Mehr im Link in Bio</span><span>→</span></div>
    </div>

    ${igFooter()}`,
  );
}

// NACHWUCHS GESUCHT — Schnuppertraining-Aufruf (Tischtennis).
// Port von tmp/ig-announcements.jsx (IGAnnYouthTT), parametrisiert über YouthData.
// Erstes helles Template (Papier-Hintergrund) — Logo & Footer werden per
// :has(.youth-main)-Scope in styles.ts auf dunkle Schrift invertiert.
import {
  FMT,
  igFrame,
  igDiagonal,
  igHeader,
  igFooter,
  igBadge,
} from "./shared.ts";
import { esc } from "./html.ts";
import type { Fmt, YouthData } from "../types.ts";

// Mehrzeilige Headline: letzte Zeile als Akzent (rot + kursiv) rendern.
function headlineMarkup(lines: string[]): string {
  return lines
    .map((line, i) => {
      const accent = i === lines.length - 1 ? ' class="accent"' : "";
      return `${i > 0 ? "<br />" : ""}<span${accent}>${esc(line)}</span>`;
    })
    .join("");
}

export function igAnnYouth(data: YouthData, fmt: Fmt = "post45"): string {
  const sport = data.sport ?? "Tischtennis";
  const kicker = data.kicker ?? "Nachwuchs gesucht · ab 8 Jahren";
  const headline = data.headline ?? ["Schläger", "schwingen", "statt scrollen."];
  const body =
    data.body ??
    "Komm in unsere Jugend! Erste zwei Trainings gratis, Schläger leihen wir dir. Spaß, Technik und ein starkes Team warten.";
  const sessions = data.sessions ?? [
    { day: "Di", time: "17:00 Uhr", group: "U13–U15" },
    { day: "Do", time: "17:00 Uhr", group: "U16–U18" },
  ];

  const f = FMT[fmt];
  // Diagonale über dem Titel (Match-Day-Pattern), Kicker steht als Label darin.
  const diagonalTop = fmt === "story" ? 0.21 : 0.2;

  const cards = sessions
    .map(
      (sess) => `
        <div class="youth-card">
          <div class="youth-card-day">${esc(sess.day)}</div>
          <div class="youth-card-time">${esc(sess.time)}</div>
          <div class="youth-card-group">${esc(sess.group)}</div>
        </div>`,
    )
    .join("");

  return igFrame(
    fmt,
    { bg: "var(--paper)", color: "var(--ink)" },
    `
    ${igDiagonal({ top: Math.round(f.h * diagonalTop), h: 70, label: esc(kicker) })}
    ${igHeader(igBadge(esc(sport), "var(--ink)"))}

    <div class="ig-main youth-main">
      <div class="youth-headline">${headlineMarkup(headline)}</div>
      <div class="youth-body">${esc(body)}</div>
      <div class="youth-cards">${cards}</div>
    </div>

    ${igFooter()}`,
  );
}

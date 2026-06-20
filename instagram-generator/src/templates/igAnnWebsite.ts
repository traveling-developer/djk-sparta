// NEUE WEBSITE ONLINE — Ankündigung mit Browser-Chrome-Motiv.
// Port von tmp/ig-announcements.jsx (IGAnnWebsite), parametrisiert über WebsiteData.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  FMT,
  igFrame,
  igDiagonal,
  igHeader,
  igFooter,
  igBadge,
} from "./shared.ts";
import { esc } from "./html.ts";
import type { Fmt, WebsiteData } from "../types.ts";

// Spartaner-Logo einmalig als Data-URI laden — Playwright rendert das Markup
// über setContent (ohne Basis-URL), daher kein Dateipfad/relative URL möglich.
// Schlägt das Lesen fehl, wird "" zurückgegeben und das Bild ausgelassen,
// statt das ganze Template zu sprengen.
let spartanerUri: string | null = null;
function spartanerDataUri(): string {
  if (spartanerUri === null) {
    try {
      const path = fileURLToPath(
        new URL("../assets/spartaner.webp", import.meta.url),
      );
      spartanerUri = `data:image/webp;base64,${fs.readFileSync(path).toString("base64")}`;
    } catch (err) {
      console.warn("spartaner.webp konnte nicht geladen werden:", err);
      spartanerUri = "";
    }
  }
  return spartanerUri;
}

// Mehrzeilige Headline: letzte Zeile als Akzent (rot + kursiv) rendern.
function headlineMarkup(lines: string[]): string {
  return lines
    .map((line, i) => {
      const accent = i === lines.length - 1 ? ' class="accent"' : "";
      return `${i > 0 ? "<br />" : ""}<span${accent}>${esc(line)}</span>`;
    })
    .join("");
}

// Hero-Text im Browser-Mockup: letzte Zeile rot.
function heroMarkup(lines: string[]): string {
  return lines
    .map((line, i) => {
      const accent = i === lines.length - 1 ? ' class="accent"' : "";
      return `${i > 0 ? "<br />" : ""}<span${accent}>${esc(line)}</span>`;
    })
    .join("");
}

export function igAnnWebsite(data: WebsiteData, fmt: Fmt = "post45"): string {
  const badge = data.badge ?? "Neu";
  const kicker = data.kicker ?? "Frisch gelauncht";
  const headline = data.headline ?? ["Neue", "Website", "ist online."];
  const url = data.url ?? "djkspartanoris.de";
  const hero = data.hero ?? ["Wir sind", "Sparta."];
  // Default-Fließtext formatabhängig: Story knapper (ohne "Link in Bio"),
  // Post mit Komma statt Gedankenstrich.
  const defaultBody =
    fmt === "story"
      ? "Neuer Look, alle Abteilungen, News & Termine an einem Ort. Schau vorbei."
      : "Neuer Look, alle Abteilungen, News & Termine an einem Ort. Schau vorbei, Link in Bio.";
  const body = data.body ?? defaultBody;

  const f = FMT[fmt];
  // Diagonale wie bei Match Day: in der freien Zone zwischen Header und Headline.
  const diagonalTop = fmt === "story" ? 0.21 : 0.2;

  const heroImg = spartanerDataUri();
  const heroImgMarkup = heroImg
    ? `<img class="web-hero-img" src="${heroImg}" alt="" />`
    : "";

  return igFrame(
    fmt,
    {},
    `
    ${igDiagonal({ top: Math.round(f.h * diagonalTop), h: 80, label: esc(kicker) })}
    ${igHeader(igBadge(esc(badge)))}

    <div class="ig-main web-main">
      <div class="web-headline">${headlineMarkup(headline)}</div>

      <div class="web-browser">
        <div class="web-chrome">
          <div class="web-dots">
            <span style="background: #FF5F57;"></span>
            <span style="background: #FEBC2E;"></span>
            <span style="background: #28C840;"></span>
          </div>
          <div class="web-url"><span class="web-url-dot">●</span>${esc(url)}</div>
        </div>
        <div class="web-viewport">
          <div class="web-viewport-bar"></div>
          <div class="web-hero">${heroMarkup(hero)}</div>
          ${heroImgMarkup}
        </div>
      </div>

      <div class="web-body">${esc(body)}</div>
    </div>

    ${igFooter()}`,
  );
}

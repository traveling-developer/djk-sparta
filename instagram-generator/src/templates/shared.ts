// Instagram template system — shared frame, header, footer, motifs.
// Port von tmp/insta/ig-shared.jsx als HTML-Template-Strings (Styles in styles.ts).
import type { Fmt } from "../types.ts";

export const FMT: Record<
  Fmt,
  { w: number; h: number; s: number; label: string }
> = {
  story: { w: 1080, h: 1920, s: 1.06, label: "Story · 9:16" },
  post45: { w: 1080, h: 1350, s: 1.0, label: "Post · 4:5" },
};

// Frame — fixed canvas, column flex so header/main/footer distribute.
export function igFrame(
  fmt: Fmt,
  { bg = "var(--ink)", color = "#fff" }: { bg?: string; color?: string },
  inner: string,
): string {
  const f = FMT[fmt];
  return `<div class="ig-frame fmt-${fmt}" style="width: ${f.w}px; height: ${f.h}px; --s: ${f.s}; background: ${bg}; color: ${color};">${inner}</div>`;
}

// Diagonal red bar accent (top-left), optional mit weißem Label im Balken.
// bg überschreibt die Standard-Rotfarbe (z.B. dunkler Akzent auf rotem Grund).
export function igDiagonal({
  top,
  h,
  opacity = 1,
  label = "",
  bg = "",
}: {
  top: number;
  h: number;
  opacity?: number;
  label?: string;
  bg?: string;
}): string {
  const inner = label ? `<span class="ig-diagonal-label">${label}</span>` : "";
  const bgStyle = bg ? ` background: ${bg};` : "";
  return `<div class="ig-diagonal" style="top: ${top}px; height: calc(${h}px * var(--s)); opacity: ${opacity};${bgStyle}">${inner}</div>`;
}

// Big watermark Σ
export function igSigma(color = "rgba(255,255,255,0.06)"): string {
  return `<div class="ig-sigma" style="color: ${color};">Σ</div>`;
}

// Corner stripes (top-right ticks)
export function igStripes(): string {
  const bars = [120, 180, 90, 150]
    .map(
      (w, i) =>
        `<div style="width: ${w}px; opacity: ${0.85 - i * 0.15};"></div>`,
    )
    .join("");
  return `<div class="ig-stripes">${bars}</div>`;
}

// Logo lockup (reines Text-Lockup, ohne Marken-Box)
export function igLogo(): string {
  return `
    <div class="ig-logo">
      <div>
        <div class="ig-logo-title">DJK Sparta Noris</div>
        <div class="ig-logo-sub">Nürnberg · seit 1925</div>
      </div>
    </div>`;
}

// Pill badge
export function igBadge(text: string, bg?: string): string {
  return `<div class="ig-badge"${bg ? ` style="background: ${bg};"` : ""}>${text}</div>`;
}

// Header row: logo + optional right badge
export function igHeader(right = ""): string {
  return `<div class="ig-header">${igLogo()}${right}</div>`;
}

// Footer bar: handle + website, divider line
export function igFooter(accent?: string): string {
  return `
    <div class="ig-footer">
      <div class="ig-footer-handle">
        <div class="ig-footer-accent"${accent ? ` style="background: ${accent};"` : ""}></div>
        <span>@djk_sparta_noris_nbg</span>
      </div>
      <span class="ig-footer-site">djkspartanoris.de</span>
    </div>`;
}

// Kicker (small caps label)
export function igKicker(text: string, className = ""): string {
  return `<div class="ig-kicker${className ? " " + className : ""}">${text}</div>`;
}

// Foto-Platzhalter (dunkel schraffiert)
export function igPlaceholder(label: string): string {
  return `<div class="ig-ph"><span>${label}</span></div>`;
}

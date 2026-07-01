// Dekodiert BFV-font-obfuskierte Score-Ziffern.
//
// BFV rendert Ergebnis-Ziffern als Private-Use-Codepoints (z.B. "") und
// lädt pro Response einen Custom-Font, dessen `cmap` diese Codepoints auf
// Glyphen mit den echten Digit-Namen ("zero".."nine") abbildet. Welcher
// Codepoint welche Ziffer ist, wird pro Response randomisiert — die
// Glyph-NAMEN bleiben aber korrekt. Dekodierung = Glyphname → Ziffer.
//
// `data-font-url` zeigt auf ein CSS mit @font-face; daraus holen wir die
// TTF-Datei und lesen ihre Glyphnamen mit opentype.js.
import axios from "axios";
import opentype from "opentype.js";
import { headers } from "../../../shared/http.ts";
import { withRetry } from "../retry.ts";

const NAME_TO_DIGIT: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

// Font-URL (aus data-font-url) → geparster Font. Pro Lauf gecacht, da alle
// Scores einer Response i.d.R. denselben Font teilen.
const cache = new Map<string, Promise<opentype.Font>>();

function absolute(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

function toArrayBuffer(data: ArrayBuffer | Buffer): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data;
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

async function loadFont(fontCssUrl: string): Promise<opentype.Font> {
  const css = (
    await withRetry(() => axios.get<string>(absolute(fontCssUrl), { headers }))
  ).data;

  // TTF bevorzugen, sonst beliebige Font-URL aus dem @font-face.
  const fontUrl =
    css.match(/url\(['"]?([^'")]+\.ttf[^'")]*)['"]?\)/i)?.[1] ??
    css.match(/url\(['"]?([^'")]+)['"]?\)/i)?.[1];
  if (!fontUrl) throw new Error(`No font url in @font-face: ${fontCssUrl}`);

  const data = (
    await withRetry(() =>
      axios.get<ArrayBuffer>(absolute(fontUrl), {
        headers,
        responseType: "arraybuffer",
      }),
    )
  ).data;

  return opentype.parse(toArrayBuffer(data));
}

function fontFor(fontCssUrl: string): Promise<opentype.Font> {
  let font = cache.get(fontCssUrl);
  if (!font) {
    font = loadFont(fontCssUrl);
    cache.set(fontCssUrl, font);
  }
  return font;
}

// Dekodiert ein obfuskiertes Score-Token zu "0".."99", oder null wenn es sich
// nicht sauber auflösen lässt (dann lieber überspringen als Müll posten).
export async function decodeScore(
  raw: string,
  fontUrl: string,
): Promise<string | null> {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Defensiv: falls BFV mal Klartext liefert.
  if (/^\d{1,2}$/.test(trimmed)) return trimmed;
  if (!fontUrl) return null;

  try {
    const font = await fontFor(fontUrl);
    let out = "";
    for (const ch of trimmed) {
      const digit = NAME_TO_DIGIT[font.charToGlyph(ch).name ?? ""];
      if (digit == null) return null;
      out += digit;
    }
    return /^\d{1,2}$/.test(out) ? out : null;
  } catch (error) {
    console.error("Error decoding score font:", fontUrl, error);
    return null;
  }
}

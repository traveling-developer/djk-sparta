// Abruf von mytischtennis.de inkl. Captcha-Freischaltung — gemeinsam genutzt
// von website, news-generator und instagram-generator.
//
// mytischtennis leitet gesperrte IPs auf /verify um (HTTP 429). Seit Nov. 2026
// trifft das alle GitHub-Runner (AS8075 Microsoft). Dort wartet ein "Private
// Captcha": Kästchen "Zum Bestätigen klicken" → Proof-of-Work im Browser (~10 s)
// → Formular wird abgeschickt. Bei normalen IPs klickt die Seite das Kästchen
// selbst; für Rechenzentrums-IPs übernimmt das hier Chromium.
//
// Die Freischaltung gilt für die IP: Danach liefert auch axios wieder normal.
// Deshalb läuft der Browser nur einmal kurz, alle Abrufe gehen über axios.
//
// Wie der Rest von shared/ zur Laufzeit dependency-frei: axios und chromium
// injiziert der Consumer; playwright ist (wie cheerio) nur Typ-Abhängigkeit.
import type { BrowserType } from "playwright";
import { headers, REQUEST_TIMEOUT_MS } from "../http.ts";
import { MYTISCHTENNIS_URL } from "./teams.ts";

// Proof-of-Work + Weiterleitung dauern auf dem Runner ~10 s.
const CAPTCHA_TIMEOUT_MS = 120_000;

/** Captcha ließ sich nicht lösen — der Workflow-Retry (Exit-Code 2) greift. */
export class CaptchaError extends Error {}

export interface MytischtennisDeps {
  // axios des Consumers (nur `get` wird gebraucht)
  axios: {
    get(
      url: string,
      config: {
        headers: Record<string, string>;
        timeout: number;
        validateStatus: (status: number) => boolean;
        responseType: "text";
      },
    ): Promise<{ status: number; data: unknown; request?: any }>;
  };
  // chromium aus "playwright" des Consumers
  chromium: BrowserType;
}

const isVerify = (url: string) =>
  new URL(url, MYTISCHTENNIS_URL).pathname === "/verify";

// Öffnet `url` in Chromium, klickt das Captcha-Kästchen und wartet, bis die
// Seite nach dem Proof-of-Work /verify verlässt. Wirft CaptchaError.
async function unlock(chromium: MytischtennisDeps["chromium"], url: string) {
  console.log("mytischtennis: Captcha — Freischaltung über Chromium …");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ locale: "de-DE" });
    await page.goto(url, { timeout: REQUEST_TIMEOUT_MS });
    if (!isVerify(page.url())) {
      console.log("mytischtennis: Captcha bereits verschwunden");
      return;
    }
    // Playwright-CSS-Selektoren durchdringen das (offene) Shadow DOM des Widgets.
    await page.locator("private-captcha #pc-checkbox").click();
    await page.waitForURL((u) => !isVerify(u.href), {
      timeout: CAPTCHA_TIMEOUT_MS,
    });
    console.log("mytischtennis: Captcha gelöst");
  } catch (error) {
    throw new CaptchaError(`mytischtennis-Captcha nicht gelöst: ${error}`);
  } finally {
    await browser.close();
  }
}

/**
 * Liefert eine `get(url)`-Funktion für mytischtennis-Seiten (Body als String).
 * Bei Captcha einmal Freischaltung über Chromium, dann erneuter Abruf.
 * HTTP-Fehler (z.B. 429 Rate-Limit) werfen, damit das Backoff des Aufrufers greift.
 */
export function createMytischtennisGet(deps: MytischtennisDeps) {
  const fetchPage = async (url: string) => {
    const res = await deps.axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT_MS,
      validateStatus: () => true,
      responseType: "text",
    });
    const finalUrl: string = res.request?.res?.responseUrl ?? url;
    return { status: res.status, finalUrl, body: String(res.data) };
  };

  return async function get(url: string): Promise<string> {
    let page = await fetchPage(url);
    if (isVerify(page.finalUrl)) {
      await unlock(deps.chromium, url);
      page = await fetchPage(url);
      if (isVerify(page.finalUrl)) {
        throw new CaptchaError(
          "mytischtennis sperrt trotz gelöstem Captcha weiter",
        );
      }
    }
    if (page.status >= 400) {
      throw new Error(`mytischtennis: HTTP ${page.status} für ${url}`);
    }
    return page.body;
  };
}

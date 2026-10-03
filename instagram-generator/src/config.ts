// Tischtennis-Mannschaften: shared/tableTennis/teams.ts ist die einzige Quelle
// der Wahrheit (gemeinsam mit website und news-generator genutzt).
export { TEAM_PAGES } from "../../shared/tableTennis/teams.ts";
export type { TeamPage } from "../../shared/tableTennis/teams.ts";

// Fußball: BFV-Vereinsseite liegt in shared/soccer/constants.ts, die HTTP-Header
// in shared/http.ts (gemeinsam mit website genutzt).

export const DRY_RUN =
  process.argv.includes("--dry-run") || process.env.DRY_RUN === "1";

// Rendert und lädt alles zu Zernio hoch, legt es dort aber nur als Entwurf an
// (isDraft) statt zu veröffentlichen — zum Sichten/Freigeben vor dem Posten.
export const DRAFT =
  process.argv.includes("--draft") || process.env.DRAFT === "1";

// Rendert die Beispieldaten aus samples.ts statt zu scrapen (impliziert Dry-Run)
export const SAMPLES = process.argv.includes("--samples");

// Welche Inhalte dieser Lauf einsammelt: "results" (Ergebnisse von gestern),
// "announcements" (Spielankündigungen in zwei Tagen) oder "all". Jeder
// Tischtennis-Collector ruft alle Team-Seiten ab — beide in einem Lauf
// verdoppeln die mytischtennis-Abrufe und lösen das Captcha aus. Der Workflow
// startet deshalb zwei getrennte Läufe mit Stunden Abstand.
// `--only=results` oder ONLY=results; ohne Angabe "all" (lokal bequem).
export type RunMode = "results" | "announcements" | "all";

export const ONLY: RunMode = (() => {
  const value =
    process.argv.find((arg) => arg.startsWith("--only="))?.slice(7) ||
    process.env.ONLY ||
    "all";
  if (value !== "results" && value !== "announcements" && value !== "all") {
    throw new Error(
      `Ungültiger Wert für --only/ONLY: "${value}" (erlaubt: results, announcements, all)`,
    );
  }
  return value;
})();

// Veröffentlichungen staffeln (Zernio scheduledFor), damit nicht alle Jobs
// gleichzeitig posten: erster Post nach LEAD Sekunden, danach je STAGGER
// Sekunden Abstand. Frei anpassbar (z.B. 300 = 5 Minuten Abstand).
export const SCHEDULE_LEAD_SECONDS = 60;
export const SCHEDULE_STAGGER_SECONDS = 60;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

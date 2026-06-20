// Saison-spezifische Team-Seiten (mytischtennis.de) — jede Saison aktualisieren!
// Muss mit news-generator/src/matchReports.ts in Sync gehalten werden.
export interface TeamPage {
  url: string;
  league: string;
}

export const TEAM_PAGES: TeamPage[] = [
  {
    url: "https://www.mytischtennis.de/click-tt/ByTTV/25--26/ligen/Erwachsene_Verbandsoberliga_Nord_(Bayerischer_TTV)/gruppe/492343/mannschaft/2948996/Erwachsene_(4er)/spielerbilanzen/gesamt",
    league: "Verbandsoberliga Nord",
  },
  {
    url: "https://www.mytischtennis.de/click-tt/ByTTV/25--26/ligen/Erwachsene_Landesliga_Ostnordost_(Bayerischer_TTV)/gruppe/492047/mannschaft/2949395/Erwachsene_II_(4er)/spielerbilanzen/gesamt",
    league: "Landesliga Ostnordost",
  },
  {
    url: "https://www.mytischtennis.de/click-tt/ByTTV/25--26/ligen/Erwachsene_Landesliga_Ostnordost_(Bayerischer_TTV)/gruppe/492047/mannschaft/2949705/Erwachsene_III_(4er)/spielerbilanzen/gesamt",
    league: "Landesliga Ostnordost",
  },
  {
    url: "https://www.mytischtennis.de/click-tt/ByTTV/25--26/ligen/Erwachsene_Bezirksliga_Gruppe_2__S%C3%BCd--Ost_(Bayerischer_TTV_-_Mittelfranken-Nord)/gruppe/492063/mannschaft/2946875/Erwachsene_IV_(4er)/spielerbilanzen/gesamt",
    league: "Bezirksliga Gruppe 2 Süd-Ost",
  },
];

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

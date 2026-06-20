// Deterministische deutsche Captions je Post-Typ.
import type { PostJob } from "./types.ts";

const HASHTAGS = "#DJKSpartaNoris #Tischtennis #Nürnberg #Vereinssport";

// Hashtags je Sportart (matchday/result) — sonst stünde überall #Tischtennis.
function hashtagsFor(sport: string): string {
  const tag =
    sport === "Fußball"
      ? "#Fußball"
      : sport === "Tischtennis"
        ? "#Tischtennis"
        : `#${sport.replace(/\s+/g, "")}`;
  return `#DJKSpartaNoris ${tag} #Nürnberg #Vereinssport`;
}

function oneLine(name: string): string {
  return name.replace(/\n/g, " ");
}

export function captionFor(job: PostJob): string {
  switch (job.kind) {
    case "matchday": {
      const d = job.data;
      const details = d.details.map(([k, v]) => `${k}: ${v}`).join(" · ");
      const cheer = d.cta ? `\n\n${d.cta}` : "";
      return `Match Day!
${oneLine(d.home)} VS ${oneLine(d.guest)}
${d.kicker}
${details}${cheer}

${hashtagsFor(d.sport)}`;
    }
    case "result": {
      const d = job.data;
      return `${oneLine(d.home)} ${d.score} ${oneLine(d.guest)} — ${d.label} in der ${d.league}. (${d.dateLine})

${hashtagsFor(d.sport)}`;
    }
    case "report": {
      const d = job.data;
      return `${d.headline.join(" ")}

${d.teaser}

Den ganzen Bericht gibt's auf djkspartanoris.de — Link in Bio.

${HASHTAGS}`;
    }
    case "table": {
      const d = job.data;
      return `So steht's in der ${d.league}${d.matchday ? ` (${d.matchday.replace(/^Nach/, "nach")})` : ""}.

${HASHTAGS}`;
    }
    case "website": {
      const url = job.data.url ?? "djkspartanoris.de";
      return `Unsere neue Website ist online! 🎉

Neuer Look, alle Abteilungen, News & Termine an einem Ort. Schaut vorbei auf ${url} — Link in Bio.

${HASHTAGS}`;
    }
    case "youth": {
      const d = job.data;
      const times = (d.sessions ?? [])
        .map((s) => `${s.day} ${s.time} (${s.group})`)
        .join(" · ");
      const body =
        d.body ??
        "Komm in unsere Jugend! Erste zwei Trainings gratis, Schläger leihen wir dir.";
      return `Nachwuchs gesucht! 🏓

${body}${times ? `\n\nTraining: ${times}` : ""}

Einfach vorbeikommen — wir freuen uns auf dich!

${HASHTAGS}`;
    }
  }
}

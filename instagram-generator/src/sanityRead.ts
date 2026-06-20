// Liest frisch veröffentlichte News aus Sanity (nur Lesen, kein Token nötig).
import { createClient } from "@sanity/client";
import type { ReportData } from "./types.ts";

export interface NewsDoc {
  title: string | null;
  content: string | null;
  category: string | null;
  imageUrl: string | null;
}

// Lazy, damit --samples/--dry-run ohne Sanity-Env-Vars funktioniert
function client() {
  return createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
    useCdn: false,
    apiVersion: "2024-10-01",
  });
}

export async function getFreshNews(releaseDate: string): Promise<NewsDoc[]> {
  return client().fetch(
    `*[_type == "news" && releaseDate == $date]{
      title, content, category, "imageUrl": image.asset->url
    }`,
    { date: releaseDate },
  );
}

// Titel auf max. 3 Headline-Zeilen umbrechen (Zeilen à ~14 Zeichen wie im Design)
function wrapHeadline(title: string, maxLines = 3, maxChars = 16): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current && (current + " " + word).length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    return [
      ...lines.slice(0, maxLines - 1),
      lines.slice(maxLines - 1).join(" "),
    ];
  }
  return lines;
}

export function newsToReport(news: NewsDoc): ReportData {
  const teaser = (news.content ?? "").replace(/\s+/g, " ").trim();
  return {
    badge: "Spielbericht",
    headline: wrapHeadline(news.title ?? "Neues aus dem Verein"),
    teaser: teaser.length > 160 ? teaser.slice(0, 157).trimEnd() + "…" : teaser,
    imageUrl: news.imageUrl ?? undefined,
  };
}

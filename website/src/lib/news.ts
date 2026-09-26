import { defineQuery } from "groq";
import client from "../lib/sanityClient";
import type {
  LATEST_NEWS_RESULT,
  LATEST_TABLE_TENNIS_NEWS_RESULT,
  NEWS_RESULT,
} from "./sanity.types";
export const LATEST_NEWS =
  defineQuery(`*[_type == "news"] | order(releaseDate desc) [0...6] {
  ...,
  "imageUrl": image.asset->url,
  "excerpt": pt::text(content)
}`);
export const LATEST_TABLE_TENNIS_NEWS =
  defineQuery(`*[_type == "news" && category == "table-tennis"] | order(releaseDate desc) [0...6] {
  ...,
  "imageUrl": image.asset->url,
  "excerpt": pt::text(content)
}`);
export const NEWS = defineQuery(`*[_type == "news"] | order(releaseDate desc) {
  ...,
  "imageUrl": image.asset->url,
  "excerpt": pt::text(content)
}`);

export const latestNews: LATEST_NEWS_RESULT = await client.fetch(LATEST_NEWS);
export const news: NEWS_RESULT = await client.fetch(NEWS);
export const latestTableTennisNews: LATEST_TABLE_TENNIS_NEWS_RESULT =
  await client.fetch(LATEST_TABLE_TENNIS_NEWS);

// Artikel pro Seite in der News-Übersicht (/news, /news/seite/n)
export const NEWS_PAGE_SIZE = 12;
export const newsPageCount = Math.max(
  1,
  Math.ceil(news.length / NEWS_PAGE_SIZE),
);

// Seite 1 liegt unter /news, alle weiteren unter /news/seite/n
export function newsPageUrl(page: number): string {
  return page <= 1 ? "/news" : `/news/seite/${page}`;
}

export const categoryLabel: Record<string, string> = {
  general: "Allgemein",
  soccer: "Fußball",
  "health-sport": "Gesundheitssport",
  indiaca: "Indiaca",
  tennis: "Tennis",
  "table-tennis": "Tischtennis",
};

export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Erste n Wörter als Vorschautext
export function excerptWords(text: string | undefined, n: number): string {
  const words = (text ?? "").split(/\s+/).filter(Boolean);
  return words.length > n ? `${words.slice(0, n).join(" ")}…` : words.join(" ");
}

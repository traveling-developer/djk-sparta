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
  "imageUrl": image.asset->url
}`);

export const latestNews: LATEST_NEWS_RESULT = await client.fetch(LATEST_NEWS);
export const news: NEWS_RESULT = await client.fetch(NEWS);
export const latestTableTennisNews: LATEST_TABLE_TENNIS_NEWS_RESULT =
  await client.fetch(LATEST_TABLE_TENNIS_NEWS);

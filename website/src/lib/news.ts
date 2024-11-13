import { defineQuery } from "groq";
import client from "../lib/sanityClient";
import type { LATEST_NEWSResult, LATEST_TABLE_TENNIS_NEWSResult, NEWSResult } from "./sanity.types";
export const LATEST_NEWS = defineQuery(`*[_type == "news"] | order(publishedDate desc) [0...6]`);
export const LATEST_TABLE_TENNIS_NEWS = defineQuery(`*[_type == "news" && category == "table-tennis"] | order(publishedDate desc) [0...6]`);
export const NEWS = defineQuery(`*[_type == "news"] | order(publishedDate desc)`);

export const latestNews: LATEST_NEWSResult = await client.fetch(LATEST_NEWS);
export const news: NEWSResult = await client.fetch(NEWS);
export const latestTableTennisNews: LATEST_TABLE_TENNIS_NEWSResult = await client.fetch(LATEST_TABLE_TENNIS_NEWS);

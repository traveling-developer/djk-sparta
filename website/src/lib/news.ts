import { defineQuery } from "groq";
import client from "../lib/sanityClient";
import type { LATEST_NEWSResult } from "./sanity.types";
//| order(publishedDate desc) 
//[0...6]
export const LATEST_NEWS = defineQuery(`*[_type == "news"] | order(publishedDate desc) [0...6]`);

export const latestNews: LATEST_NEWSResult = await client.fetch(LATEST_NEWS);
import { defineQuery } from "groq";
import client from "../lib/sanityClient";
import type { SOCCER_TEAMSResult } from "./sanity.types";


export const SOCCER_TEAMS = defineQuery(`*[_type == "soccerTeam"]`);

export const soccerTeams: SOCCER_TEAMSResult = await client.fetch(SOCCER_TEAMS);



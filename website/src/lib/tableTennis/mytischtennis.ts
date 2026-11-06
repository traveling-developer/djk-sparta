// mytischtennis-Abruf zur Build-Zeit inkl. Captcha-Freischaltung über Chromium
// (GitHub-Runner werden gesperrt) — Logik in shared/tableTennis/mytischtennis.ts.
import axios from "axios";
import { chromium } from "playwright";
import { createMytischtennisGet } from "../../../../shared/tableTennis/mytischtennis";

export { CaptchaError } from "../../../../shared/tableTennis/mytischtennis";

export const mttGet = createMytischtennisGet({ axios, chromium });

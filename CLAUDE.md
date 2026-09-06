# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo for the **DJK Sparta Noris Nürnberg e.V.** sports club website (a German multi-department sports club). It is a set of independent npm packages, each with its own `package.json` and `node_modules` — run commands from within the relevant subdirectory, not the repo root.

| Package | Purpose | Stack |
| :-- | :-- | :-- |
| `website/` | The public website | Astro 6, Tailwind CSS 4, daisyUI |
| `sanity/` | Headless CMS (Sanity Studio) — content source for the website | Sanity 4, React 19 |
| `news-generator/` | Scrapes table-tennis match PDFs, generates German match reports via Gemini, publishes them to Sanity as `news` documents | tsx, Gemini (`@google/genai`), cheerio |
| `club-data-generator/` | Scrapes club ranking / teams / matches data from external sites | ts-node, cheerio |
| `instagram-generator/` | Renders branded post images (results, news teasers, league tables) from HTML/CSS templates via headless Playwright and publishes them to Instagram via the Zernio API | Node (native TS, no build step), Playwright, cheerio |
| `shared/` | Code shared across packages — the BFV soccer scraper (`soccer/bfv.ts`), the table-tennis team/season URLs (`tableTennis/teams.ts`) and HTTP headers (`http.ts`), consumed by `website`, `news-generator` and `instagram-generator` | TS, runtime-dependency-free (cheerio is type-only, injected at call sites) |

`tmp/` and `*/dist` are build/scratch output. `README_.md` and `README_sa.md` are leftover template READMEs, not authoritative.

## Commands

**website/** (dev server at `localhost:4321`):
```bash
npm run dev       # local dev server
npm run build     # production build to ./dist/
npm run preview   # preview the build
```

**sanity/**:
```bash
npm run dev       # run Sanity Studio locally
npm run deploy    # deploy the studio
npx sanity schema extract    # write schema.json from schemaTypes/
npx sanity typegen generate  # regenerate website/src/lib/sanity.types.ts (see below)
```

**news-generator/** (requires `.env.local` with `GEMINI_API_KEY`, `SANITY_*`):
```bash
npm run dev       # runs src/main.ts with .env.local loaded via tsx
npm run generate  # same, without env-file flag (expects env already set)
```

**club-data-generator/**:
```bash
npm run build && npm run start   # tsc to dist/, then node dist/index.js
```

**instagram-generator/** (requires `.env.local` with `ZERNIO_*`, `SANITY_STUDIO_*`; first run also `npx playwright install chromium`; runs on plain `node` — Node ≥ 24 strips TS types natively, no tsx/build step):
```bash
npm run dev                          # full run with .env.local (scrape → render → post)
npm run dry-run                      # render real data to ./out/ without posting
npm run draft                        # render + upload to Zernio as drafts (isDraft) — does NOT publish
node src/main.ts --samples           # render sample data (no env vars / network APIs needed)
npm run preview                      # live template preview at localhost:4322 (renders per request)
npm run generate                     # CI entry point (env already set)
```

No test suites or linters are wired up (`club-data-generator`'s `test` script is a stub). Formatting is Prettier; the website uses `prettier-plugin-astro` + `prettier-plugin-tailwindcss` (config in `website/.prettierrc.mjs`).

## Architecture

### Content flow
Sanity Studio (`sanity/`) is the single source of truth for dynamic content (`news` and `soccerTeam` documents). The website fetches it at **build time** via GROQ queries, so content changes require a rebuild to appear.

- Schemas are defined in `sanity/schemaTypes/` and registered in `sanity/schemaTypes/index.ts`.
- The website reads Sanity in `website/src/lib/`: `sanityClient.ts` creates the read client; `news.ts` and `soccer.ts` define GROQ queries with `defineQuery` and export the fetched results as top-level `await client.fetch(...)` bindings (consumed directly by `.astro` pages).

### The cross-package typegen workflow (important)
TypeScript types for Sanity content are **generated**, not hand-written. The pipeline spans two packages:
1. `sanity/schema.json` is produced by `npx sanity schema extract` (run in `sanity/`).
2. `sanity/sanity-typegen.json` points at `../website/src/**/*.{ts,js}` for queries and **writes the output to `../website/src/lib/sanity.types.ts`**.
3. `npx sanity typegen generate` (run in `sanity/`) reads the GROQ queries in the website and regenerates that file.

So: do **not** hand-edit `website/src/lib/sanity.types.ts`. After changing a Sanity schema or a GROQ query, re-run `schema extract` then `typegen generate` from `sanity/`.

### News generator pipeline
`news-generator/src/main.ts` orchestrates: `matchReports.ts` scrapes mytischtennis.de for the **previous day's** matches (all teams from `shared/tableTennis/teams.ts`) and downloads result PDFs → `genai.ts` uploads each PDF to Gemini, fills `matchResultTemplate.json`, then generates a German press report → `sanityClient.ts` publishes it as a `news` document with `category: "table-tennis"`. Designed to run as a daily job (GitHub Actions cron, 02:00 UTC). Gemini calls are wrapped in `withRetry` (exponential backoff). All teams (adults + Jugend) come from `shared/tableTennis/teams.ts` — see "Shared table-tennis teams" below.

### Instagram generator pipeline
`instagram-generator/src/main.ts` runs daily at 16:30 UTC (18:30 Berlin time; well after the news-generator's 02:00 UTC run, so its news exist in Sanity). It collects stateless, non-overlapping content windows. **Currently wired into `collectJobs()`: table-tennis match announcements two days ahead and soccer results from yesterday — nothing else.** The other collectors exist but are unused dead code: yesterday's table-tennis results (`getYesterdayResults`; scraped from the mytischtennis team pages — the schedule table there already contains the score in `td(5)`), today's `releaseDate` news from Sanity (`sanityRead.ts`; note the GitHub workflow passes no `SANITY_*` secrets), the league tables (`leagueTable.ts`; table URL = team URL with `/mannschaft/...` replaced by `/tabelle/gesamt`) and the soccer announcements (`getUpcomingSoccerAnnouncements`, dropped deliberately — not wanted any more). Each item is rendered through the typed HTML/CSS string templates in `src/templates/` (1:1 port of the design in `tmp/insta/`, Sparta branding, Google Fonts Oswald + Inter; shared stylesheet in `styles.ts` scales via the `--s` CSS variable, scraped text goes through `esc()` in `html.ts`) via Playwright `page.setContent` → element screenshot (1080×1350 @2x PNG), then uploaded through Zernio's presign flow and published as an Instagram post (`src/zernio.ts`). `--dry-run` writes PNGs to `./out/` instead of posting; `--samples` additionally skips scraping/Sanity; `--draft` uploads to Zernio but creates each post as an unpublished draft (`isDraft`) instead of publishing. **Table-tennis announcements** (`src/scrape/matchResults.ts`, `getUpcomingAnnouncements`) are posted two days before the match as 9:16 Stories (`placement: "story"`), adults + Jugend, kicker = `ageClass ?? league` from `TEAM_PAGES`; rows with a score, without both team names, or without our club are skipped, and the dedupe key carries the team label because Mannschaft I and the Jugend share the name "DJK Sparta Noris Nürnberg". mytischtennis rate-limits bursts (HTTP 429, ~15–20 s cooldown), so the scraper sends the `shared/http.ts` headers, retries with a 5 s base backoff, pauses ~2 s between team pages, logs the row count per page and throws when a page yields no schedule rows at all (a rate-limit interstitial or a stale seasonal URL must not look like a match-free day). The soccer-fixture adapter `src/scrape/soccerMatches.ts` (shared BFV scraper, see below) is still there but no longer collected. Soccer **results** are posted as 9:16 Stories the day after (`src/scrape/soccerResults.ts`, `kind: "result"`): yesterday's played games (Berlin, stateless like the TT results), adults + juniors, decoded from BFV's obfuscated score fonts (see "Shared soccer scraper" below).

### Shared soccer scraper (BFV)
`shared/soccer/bfv.ts` exports `scrapeBfvMatches(deps, opts)` — the single source of BFV scraping logic (club page → team links → detail pages → ICS parse → `BfvMatch[]`). Edit soccer-scraping logic **here**, not in the consumers, which are thin adapters: `website/src/lib/soccer/matches.ts` (upcoming matches), `website/src/lib/soccer/teams.ts` (standings; uses the exported `readGameInfo`), and `instagram-generator/src/scrape/soccerMatches.ts` (story announcements).

- **Dependency injection** keeps `shared/` runtime-dependency-free: cheerio is imported `import type` only (erased at build), and each consumer injects its own `get` (the website plain axios; the IG generator wraps `withRetry`) and `cheerio.load`. `shared/package.json` + `node_modules` exist **only** for cheerio's types — never imported at runtime.
- **Import-extension gotcha**: the IG generator imports shared modules with explicit `.ts` extensions (native Node TS, `allowImportingTsExtensions`); the website imports them **without** an extension (Vite + astro-strict). Same files, different specifiers.
- The BFV club URL lives in `shared/soccer/constants.ts`, HTTP headers in `shared/http.ts`. The club URL is the stable BFV club ID — no seasonal updates needed (unlike the table-tennis `TEAM_PAGES`).
- **Results & the font obfuscation**: `scrapeBfvResults(deps, opts)` returns recent club results (`BfvResult[]`) from the club-profile "Letzte Spiele" tab only — `/partial/vereinsprofil/spielplan/{clubId}/letzte` (clubId derived from the club URL). This covers all teams, including ones without a current team link (e.g. off-season). Each row's competition is the `bfv-spieltag-eintrag__region` text (→ `league`). Results are **not** in the ICS feed. BFV **font-obfuscates the score digits**: each digit is a Private-Use codepoint (e.g. `&#xE675;`) with a per-response `data-font-url`; the custom font's `cmap` maps that codepoint to a glyph whose **name** is the true digit ("zero".."nine"). Which codepoint means which digit is randomized per response, but glyph names stay correct. So `scrapeBfvResults` returns the raw obfuscated tokens + font URL (keeping `shared/` runtime-dependency-free); the IG consumer decodes them in `instagram-generator/src/scrape/bfvFontDecode.ts` with `opentype.js` (glyph name → digit). Note: the "Letzte Spiele" tab shows only the ~5 most recent club games, so on a heavy match weekend older-but-still-"yesterday" games could fall off the list.

### Shared table-tennis teams
`shared/tableTennis/teams.ts` is the **single source of truth** for every mytischtennis.de URL: `SEASON`, `TEAM_PAGES` (four adult teams + Jugend 19, each with `league` and optional `ageClass`) and the two club-level pages `CLUB_SCHEDULE_URL` / `CLUB_TEAMS_URL`. All URLs interpolate `SEASON`, so a new season means: bump `SEASON`, then replace the `gruppe/…/mannschaft/…` ids and league names in `TEAM_PAGES` (the club id 207077 is stable). Consumers: `instagram-generator/src/config.ts` re-exports `TEAM_PAGES` (used by `scrape/matchResults.ts` and `scrape/leagueTable.ts`), `news-generator/src/matchReports.ts` iterates it (Jugend included), and `website/src/lib/tableTennis/{matches,teams}.ts` use the club URLs. Import extensions follow the same split as `shared/soccer` (IG with `.ts`, website/news-generator without).

### Website specifics
- Static club facts (address, contact, coordinates, member counts) are centralized in `website/src/lib/club.ts` — use it rather than hardcoding.
- `astro.config.mjs` reads `SITE_URL` from `process.env` for the canonical site URL and sitemap; `cdn.sanity.io` is an allowed image domain.
- Departments each have their own page in `src/pages/` (soccer-adults, soccer-juniors, table-tennis, tennis, indiaca, walking-football, health-sport) plus legal pages (legal-notice, data-privacy, transparenz, member).
- Cookie consent uses `vanilla-cookieconsent`.

## Environment

Sanity-related packages read these from `.env.local` (website uses Vite's `import.meta.env`, the generators use `process.env`):
`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_TITLE`, `SANITY_STUDIO_HOSTNAME`, `SANITY_AUTH_TOKEN` (write token, generators only), `GEMINI_API_KEY` (news-generator), `ZERNIO_API_KEY` and `ZERNIO_INSTAGRAM_ACCOUNT_ID` (instagram-generator), `GOOGLE_MAPS_API` and `SITE_URL` (website).

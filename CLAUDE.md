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
| `shared/` | Code shared across packages — the BFV soccer scraper (`soccer/bfv.ts`) and HTTP headers (`http.ts`), consumed by `website` and `instagram-generator` | TS, runtime-dependency-free (cheerio is type-only, injected at call sites) |

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
`news-generator/src/main.ts` orchestrates: `matchReports.ts` scrapes mytischtennis.de for the **previous day's** matches (hardcoded team URLs for the current season) and downloads result PDFs → `genai.ts` uploads each PDF to Gemini, fills `matchResultTemplate.json`, then generates a German press report → `sanityClient.ts` publishes it as a `news` document with `category: "table-tennis"`. Designed to run as a daily job (GitHub Actions cron, 02:00 UTC). Gemini calls are wrapped in `withRetry` (exponential backoff). Team URLs are season-specific and must be updated each season — **in `news-generator/src/matchReports.ts` AND `instagram-generator/src/config.ts`**.

### Instagram generator pipeline
`instagram-generator/src/main.ts` runs daily at 16:30 UTC (18:30 Berlin time; well after the news-generator's 02:00 UTC run, so its news exist in Sanity). It collects stateless, non-overlapping content windows: today's match announcements (schedule rows for today without a score yet), yesterday's table-tennis results (scraped from the mytischtennis team pages — the schedule table there already contains the score in `td(5)`), today's `releaseDate` news from Sanity, and the league tables (only on days with results; table URL = team URL with `/mannschaft/...` replaced by `/tabelle/gesamt`). Each item is rendered through the typed HTML/CSS string templates in `src/templates/` (1:1 port of the design in `tmp/insta/`, Sparta branding, Google Fonts Oswald + Inter; shared stylesheet in `styles.ts` scales via the `--s` CSS variable, scraped text goes through `esc()` in `html.ts`) via Playwright `page.setContent` → element screenshot (1080×1350 @2x PNG), then uploaded through Zernio's presign flow and published as an Instagram post (`src/zernio.ts`). `--dry-run` writes PNGs to `./out/` instead of posting; `--samples` additionally skips scraping/Sanity; `--draft` uploads to Zernio but creates each post as an unpublished draft (`isDraft`) instead of publishing. Soccer fixtures are scraped via the shared BFV scraper (`shared/soccer/bfv.ts`; `src/scrape/soccerMatches.ts` is the IG adapter — see "Shared soccer scraper" below) and announced two days before as 9:16 Stories (`placement: "story"`), using the team's Liga as kicker for adults and the Altersklasse for juniors; "SPIELFREI" bye rows are filtered out.

### Shared soccer scraper (BFV)
`shared/soccer/bfv.ts` exports `scrapeBfvMatches(deps, opts)` — the single source of BFV scraping logic (club page → team links → detail pages → ICS parse → `BfvMatch[]`). Edit soccer-scraping logic **here**, not in the consumers, which are thin adapters: `website/src/lib/soccer/matches.ts` (upcoming matches), `website/src/lib/soccer/teams.ts` (standings; uses the exported `readGameInfo`), and `instagram-generator/src/scrape/soccerMatches.ts` (story announcements).

- **Dependency injection** keeps `shared/` runtime-dependency-free: cheerio is imported `import type` only (erased at build), and each consumer injects its own `get` (the website plain axios; the IG generator wraps `withRetry`) and `cheerio.load`. `shared/package.json` + `node_modules` exist **only** for cheerio's types — never imported at runtime.
- **Import-extension gotcha**: the IG generator imports shared modules with explicit `.ts` extensions (native Node TS, `allowImportingTsExtensions`); the website imports them **without** an extension (Vite + astro-strict). Same files, different specifiers.
- The BFV club URL lives in `shared/soccer/constants.ts`, HTTP headers in `shared/http.ts`. The club URL is the stable BFV club ID — no seasonal updates needed (unlike the table-tennis `TEAM_PAGES`).

### Website specifics
- Static club facts (address, contact, coordinates, member counts) are centralized in `website/src/lib/club.ts` — use it rather than hardcoding.
- `astro.config.mjs` reads `SITE_URL` from `process.env` for the canonical site URL and sitemap; `cdn.sanity.io` is an allowed image domain.
- Departments each have their own page in `src/pages/` (soccer-adults, soccer-juniors, table-tennis, tennis, indiaca, walking-football, health-sport) plus legal pages (legal-notice, data-privacy, transparenz, member).
- Cookie consent uses `vanilla-cookieconsent`.

## Environment

Sanity-related packages read these from `.env.local` (website uses Vite's `import.meta.env`, the generators use `process.env`):
`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_TITLE`, `SANITY_STUDIO_HOSTNAME`, `SANITY_AUTH_TOKEN` (write token, generators only), `GEMINI_API_KEY` (news-generator), `ZERNIO_API_KEY` and `ZERNIO_INSTAGRAM_ACCOUNT_ID` (instagram-generator), `GOOGLE_MAPS_API` and `SITE_URL` (website).

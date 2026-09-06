# CLAUDE.md

Monorepo for the **DJK Sparta Noris Nürnberg e.V.** website (German multi-department sports club). Each package is a standalone npm project with its own `package.json` and `node_modules` — **run commands inside the package dir**, not at the repo root.

| Package                | What it is                                                                                                                   |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `website/`             | The public site — Astro, Tailwind 4 + daisyUI, static build                                                                  |
| `sanity/`              | Sanity Studio — CMS behind the site's `news` and `soccerTeam` documents                                                      |
| `news-generator/`      | mytischtennis result PDFs → Gemini → German match report → Sanity `news` (runs on `tsx`)                                     |
| `instagram-generator/` | HTML/CSS templates → Playwright screenshot → Instagram via the Zernio API (plain `node`; Node ≥ 24 strips TS, no build step) |
| `shared/`              | Cross-package code: BFV soccer scraper, table-tennis URLs, HTTP headers. Runtime-dependency-free                             |

- Comments, log output and all published copy are **German** — keep it that way.
- No tests, no linters. Prettier only (website adds `prettier-plugin-astro` + `-tailwindcss`).
- Ignore `tmp/` (design scratch) and `README_.md` / `README_sa.md` (leftover templates).

## Commands

- `website/` — `npm run dev` (:4321) · `npm run build`
- `sanity/` — `npm run dev` (Studio) · `npm run deploy`
- `news-generator/` — `npm run dev` (loads `.env.local`) · `npm run generate` (env already set)
- `instagram-generator/` — `npm run dry-run` (real data → `./out/`, no posting) · `node src/main.ts --samples` (sample data, no env/network) · `npm run draft` (upload to Zernio as unpublished drafts) · `npm run preview` (template preview on :4322) · `npm run dev` (full run) · first run needs `npx playwright install chromium`

## Deployment (GitHub Actions)

- Push to `dev` → build + **Cloudflare Pages** (project `djk-sparta`), moving `website/public/DEV_CNAME` / `DEV_robots.txt` into place.
- Push to `main` under `website/**` → **GitHub Pages** (prod; deletes those DEV\_ files).
- Prod also rebuilds on `repository_dispatch: sanity-studio-update` (Sanity webhook) and cron 23:55 UTC Wed/Fri/Sat/Sun. The site fetches Sanity **and** scrapes BFV/mytischtennis at **build time**, so nothing on the live site changes without a rebuild.
- Push to `main` under `sanity/**` → deploys the Studio. `news-generator` runs daily 02:00 UTC, `instagram-generator` daily 16:30 UTC.

## Sanity content + typegen

Schemas live in `sanity/schemaTypes/` (registered in `index.ts`): `news`, `soccerTeam`, `blockContent`. The website reads them from `website/src/lib/`: `sanityClient.ts` (read client), `news.ts` / `soccer.ts` (GROQ via `defineQuery`, exported as top-level `await client.fetch(...)` bindings that `.astro` pages consume directly).

Types are **generated across packages** — never hand-edit `website/src/lib/sanity.types.ts`. After changing a schema or a GROQ query, run in `sanity/`: `npx sanity schema extract`, then `npx sanity typegen generate` (`sanity-typegen.json` reads `../website/src/**` and writes that file).

## instagram-generator

`src/main.ts` collects stateless content windows, renders each job to PNG and publishes it through `src/zernio.ts`, staggered by `SCHEDULE_*_SECONDS`.

- Wired into `collectJobs()`, in this order (= publish order): table-tennis results from yesterday, soccer results from yesterday, table-tennis announcements two days ahead. The rest is dead code: `sanityRead.ts` (news teaser — the workflow passes no `SANITY_*` secrets anyway), `leagueTable.ts`, `scrape/soccerMatches.ts` (soccer announcements, dropped on purpose).
- Everything posts as a 9:16 Story (`placement: "story"`; `FMT` in `templates/shared.ts` → 1080×1920 @2x, the 4:5 feed format exists but is unused). Templates are typed HTML/CSS strings in `src/templates/`; `styles.ts` scales via the `--s` variable, and scraped text must pass through `esc()` from `html.ts`.
- Deliberately **no** date CLI flag: to test outside the live window, pass a date to a collector (`getYesterdayResults("20.09.2026")`).
- `src/scrape/club.ts` owns club identity (`isOurs`) and the venue wording (`venueOf` → Heimspiel/Auswärtsspiel/Vereinsduell) for both sports — extend it there, not in a scraper.
- **Table tennis** (`src/scrape/matchResults.ts`): both collectors read the same team-page schedule table (`td(5)` = score; filled means played) and each scrapes all five pages independently (10 requests per run — accepted, the job is not time-critical). mytischtennis rate-limits bursts (HTTP 429, 15–20 s cooldown), hence the `shared/http.ts` headers, `withRetry` 5× with 5 s base and ~2 s between pages. Guards so a broken scrape never looks like a match-free day: a page with zero schedule rows throws, all pages failing throws, a page whose last game is already past warns (stale seasonal link — the only signal for the Jugend link, which expires 27.11.2026), and a non-empty but unparsable score is logged.
- Every axios call passes `REQUEST_TIMEOUT_MS` from `shared/http.ts` (axios has no default timeout; a hanging request would stall the job for hours).

## Shared scrapers

Edit scraping logic in `shared/`, not in the consumers — they are thin adapters (`website/src/lib/soccer/{matches,teams}.ts`, `instagram-generator/src/scrape/{soccerMatches,soccerResults}.ts`).

- **Soccer (BFV)** — `shared/soccer/bfv.ts`: `scrapeBfvMatches` (club page → team links → detail pages → ICS parse) and `scrapeBfvResults` (the club-profile "Letzte Spiele" partial only; it holds just the ~5 most recent club games, so on a heavy weekend an older-but-still-"yesterday" game can fall off). Club URL in `shared/soccer/constants.ts` — a stable club id, no seasonal maintenance.
- **BFV font-obfuscates score digits**: each digit is a Private-Use codepoint with a per-response `data-font-url`; the codepoint mapping is randomized per response, but glyph _names_ stay true ("zero".."nine"). So `scrapeBfvResults` returns the raw tokens + font URL and `instagram-generator/src/scrape/bfvFontDecode.ts` decodes them with `opentype.js`.
- **Table tennis** — `shared/tableTennis/teams.ts` is the single source for every mytischtennis URL: `SEASON`, `TEAM_PAGES` (4 adult teams + Jugend 19, each with `league` and optional `ageClass`) and `CLUB_SCHEDULE_URL` / `CLUB_TEAMS_URL`. A new season means bumping `SEASON` **and** replacing every `gruppe/…/mannschaft/…` id and league name (club id 207077 is stable); the Jugend link is a Vorrunde staffel and turns over mid-season. Consumers: `instagram-generator/src/config.ts` (re-export), `news-generator/src/matchReports.ts`, `website/src/lib/tableTennis/{matches,teams}.ts`.
- `shared/` stays runtime-dependency-free through **dependency injection**: cheerio is `import type` only, each consumer injects its own `get` and `cheerio.load`. `shared/node_modules` exists for those types alone.
- **Import-extension gotcha**: the IG generator imports `shared/` modules with explicit `.ts` extensions (native Node TS), the website and news-generator **without**. Same files, different specifiers.

## Website notes

- Club facts (address, contact, coordinates, member counts) are centralized in `website/src/lib/club.ts` — don't hardcode them.
- Tailwind 4 runs through `@tailwindcss/vite`; theme tokens and the daisyUI theme live in `src/styles/global.css` (`@theme` / `@plugin`). The `tailwind.config.mjs` next to it is a **leftover v3 file that is never loaded** — editing it does nothing.
- `astro.config.mjs` reads `SITE_URL` from `process.env` for the canonical URL and sitemap; `cdn.sanity.io` is the allowed image domain. Cookie consent uses `vanilla-cookieconsent`.

## Env

`.env.local` per package — website via `import.meta.env`, everything else via `process.env`.

- `website/` — `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `GOOGLE_MAPS_API`, `SITE_URL`
- `sanity/` — `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_TITLE`, `SANITY_STUDIO_HOSTNAME`
- `news-generator/` — `GEMINI_API_KEY`, `SANITY_AUTH_TOKEN` (write token), `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`
- `instagram-generator/` — `ZERNIO_API_KEY`, `ZERNIO_INSTAGRAM_ACCOUNT_ID` (nothing else; only the dead Sanity collector would need `SANITY_STUDIO_*`)

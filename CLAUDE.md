# CLAUDE.md

Monorepo for the **DJK Sparta Noris Nürnberg e.V.** website. Every package is a standalone npm project — **run commands inside the package dir**, never at the root.

| Package                | What it is                                                                                 |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| `website/`             | Public site — Astro, Tailwind 4 + daisyUI, static build                                    |
| `sanity/`              | Sanity Studio (`news`, `soccerTeam`)                                                       |
| `news-generator/`      | mytischtennis PDFs → Gemini → German match report → Sanity `news` (`tsx`)                  |
| `instagram-generator/` | HTML templates → Playwright PNG → Instagram Story/Post via Zernio (plain `node`, no build) |
| `shared/`              | Scrapers (BFV soccer, mytischtennis) + HTTP headers, used by all of the above              |

## Commands

- `website/` — `npm run dev` (:4321) · `npm run build`
- `sanity/` — `npm run dev` · `npm run deploy`
- `news-generator/` — `npm run dev` (loads `.env.local`)
- `instagram-generator/` — `node src/main.ts --samples` (no env/network) · `npm run dry-run` (real data → `./out/`, no posting) · `npm run draft` · `npm run preview` (:4322) · all accept `--only=results|announcements|weekend` · first run: `npx playwright install chromium`
- No tests, no linter — verify with `npm run build` (website) or a `dry-run` (IG). Prettier only.

## Rules

- Comments, logs and all published copy are **German**.
- **Never hand-edit `website/src/lib/sanity.types.ts`.** After changing a schema or GROQ query, run in `sanity/`: `npx sanity schema extract && npx sanity typegen generate`.
- Scraping logic lives in `shared/`; consumers are thin adapters. `shared/` stays runtime-dependency-free — cheerio is `import type` only, consumers inject `get` and `cheerio.load`.
- **Import extensions differ:** `instagram-generator` imports `shared/` with `.ts` extensions (native Node TS); `website` and `news-generator` without.
- Every axios call passes `REQUEST_TIMEOUT_MS` from `shared/http.ts`.
- Club facts (address, contact, members) only from `website/src/lib/club.ts`; club identity / venue wording for IG only from `instagram-generator/src/scrape/club.ts`.
- IG templates: scraped text must go through `esc()` (`templates/html.ts`).
- Ignore `tmp/`, `README_.md`, `README_sa.md`. `website/tailwind.config.mjs` is a dead v3 leftover — theme lives in `src/styles/global.css`.

## Gotchas

- The website scrapes BFV/mytischtennis and fetches Sanity **at build time** — the live site only changes on rebuild (Sanity webhook, cron, or push to `main`).
- mytischtennis: rate-limits bursts (HTTP 429) and redirects to a captcha (`/verify`) → exit code 2 → workflow retry job. Scrapers must throw on unexpected page structure so a broken scrape never looks like a match-free day.
- BFV obfuscates score digits via a per-response font; `instagram-generator/src/scrape/bfvFontDecode.ts` decodes them by glyph name.
- IG generator has deliberately **no** date flag — to test another day, pass a date to the collector (e.g. `getYesterdayResults("20.09.2026")`).
- IG cron strings in the workflow must match the `ONLY` mapping (14:30 UTC results, 16:30 UTC announcements, Mon 08:00 UTC weekend). `weekend` is a 4:5 feed post with all TT results Fri–Sun; not part of `all`.

## Deployment & env

- Push `dev` → Cloudflare Pages (preview) · push `main` (`website/**`) → GitHub Pages (prod) · push `main` (`sanity/**`) → Studio deploy.
- `.env.local` per package. IG generator needs only `ZERNIO_API_KEY`, `ZERNIO_INSTAGRAM_ACCOUNT_ID`. Sanity CLI: a robot token in `sanity/.env.local` blocks dataset export/migrations — use your user login.

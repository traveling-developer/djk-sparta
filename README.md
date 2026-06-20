# DJK Sparta Noris Nürnberg

This is the monorepo for the DJK Sparta Noris Nürnberg sports club website and its content tooling.

The final page can be found here: TBD
The current development state is found [here](https://sparta.debaggu.de/table-tennis/).

The repository is a monorepo of independent npm packages — each has its own `package.json` and `node_modules`, so run commands from within the relevant subdirectory:

- **website** — the public website, built with [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/) and [daisyUI](https://daisyui.com/)
- **sanity** — the [Sanity](https://www.sanity.io/) headless CMS (Studio); the content source for the website
- **news-generator** — scrapes table-tennis match PDFs, generates German match reports via Gemini, and publishes them to Sanity
- **club-data-generator** — scrapes club ranking / teams / matches data from external sites
- **instagram-generator** — renders branded Instagram post images (match announcements, results, news teasers, league tables) and publishes them via the [Zernio](https://zernio.com/) API
- **shared** — code shared across packages, e.g. the BFV soccer scraper and HTTP headers used by both `website` and `instagram-generator`

## Developer notes

### Sanity.io

Run these from the `sanity/` directory. `npm run dev` starts the Studio locally, `npm run deploy` deploys it.

The TypeScript types for Sanity content are generated, not hand-written. After changing a schema or a GROQ query, extract the schema first and then regenerate the types:

```bash
npx sanity schema extract     # writes sanity/schema.json
npx sanity typegen generate   # regenerates website/src/lib/sanity.types.ts
```

`typegen generate` reads the GROQ queries in the website and writes the output to `website/src/lib/sanity.types.ts` — do not hand-edit that file.


### Website

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### News generator

Scrapes the previous day's table-tennis matches from [mytischtennis.de](https://www.mytischtennis.de/), generates German match reports from the result PDFs via Gemini, and publishes them to Sanity as `news` documents. Designed to run as a daily GitHub Actions cron (02:00 UTC). Requires `.env.local` with `GEMINI_API_KEY` and the `SANITY_*` variables (including a write token, `SANITY_AUTH_TOKEN`).

| Command            | Action                                                  |
| :----------------- | :------------------------------------------------------ |
| `npm install`      | Installs dependencies                                   |
| `npm run dev`      | Runs `src/main.ts` with `.env.local` loaded via `tsx`   |
| `npm run generate` | CI entry point (expects env already set)                |

Note: the table-tennis team URLs (`src/matchReports.ts`) are season-specific and must be updated each season, together with `instagram-generator/src/config.ts`.

### Club data generator

Scrapes club ranking / teams / matches data from external sites.

| Command                          | Action                                |
| :------------------------------- | :------------------------------------ |
| `npm install`                    | Installs dependencies                 |
| `npm run build && npm run start` | Compiles to `dist/` and runs the output |

### Instagram generator

Collects the day's content (today's table-tennis match announcements, yesterday's table-tennis results scraped from [mytischtennis.de](https://www.mytischtennis.de/), soccer fixtures two days out scraped from [bfv.de](https://www.bfv.de/) (via the shared scraper in `shared/soccer/`), today's news from Sanity, and league tables on result days), renders each item through the typed HTML/CSS templates in `src/templates/` with headless Playwright (1080×1350 PNG for feed posts, 1080×1920 for stories), and publishes the images to Instagram via the Zernio API.

Soccer fixtures are announced two days before the match and posted as 9:16 **Stories** (table-tennis stays a same-day feed post). The kicker shows the team's Liga for adults and the Altersklasse for juniors; "SPIELFREI" bye entries are filtered out.

Runs daily at 16:30 UTC (18:30 Berlin time) via GitHub Actions (`.github/workflows/instagram-generator.yml`), well after the news-generator so its news already exist in Sanity.

Requires Node ≥ 24 (runs TypeScript natively, no build step) and a one-time `npx playwright install chromium`.

| Command                     | Action                                                          |
| :-------------------------- | :-------------------------------------------------------------- |
| `npm install`               | Installs dependencies                                           |
| `npm run dev`               | Full run with `.env.local` (scrape → render → post)             |
| `npm run dry-run`           | Render real data to `./out/` without posting                    |
| `npm run draft`             | Render + upload to Zernio as unpublished drafts (does not post) |
| `node src/main.ts --samples`| Render sample data (no env vars / network needed)               |
| `npm run preview`           | Live template preview at `localhost:4322`                       |
| `npm run generate`          | CI entry point (env already set)                                |

Environment variables (in `.env.local` for local runs, repository secrets in CI): `ZERNIO_API_KEY`, `ZERNIO_INSTAGRAM_ACCOUNT_ID`, `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`.

Note: the table-tennis team URLs (`TEAM_PAGES` in `src/config.ts`) are season-specific and must be updated each season (together with `news-generator/src/matchReports.ts`). The soccer `SOCCER_CLUB_URL` is the stable BFV club ID and does not need seasonal updates.
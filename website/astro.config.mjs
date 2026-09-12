// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

const siteUrl = process.env.SITE_URL;

const EXCLUDED_FROM_SITEMAP = ["/legal-notice/", "/data-privacy/"];

const BUILD_TIME = new Date().toISOString();

const WEIGHTS = {
  "/": { priority: 1.0, changefreq: "weekly", lastmod: BUILD_TIME },

  "/soccer-adults/": {
    priority: 0.9,
    changefreq: "weekly",
    lastmod: BUILD_TIME,
  },
  "/soccer-juniors/": {
    priority: 0.9,
    changefreq: "weekly",
    lastmod: BUILD_TIME,
  },
  "/table-tennis/": {
    priority: 0.9,
    changefreq: "weekly",
    lastmod: BUILD_TIME,
  },
  "/tennis/": { priority: 0.9, changefreq: "weekly" },
  "/health-sport/": { priority: 0.9, changefreq: "weekly" },
  "/indiaca/": { priority: 0.7, changefreq: "monthly" },
  "/walking-football/": { priority: 0.7, changefreq: "monthly" },

  "/member/": { priority: 0.8, changefreq: "monthly" },
  "/contact/": { priority: 0.8, changefreq: "monthly" },
  "/restaurant/": { priority: 0.8, changefreq: "monthly" },

  "/history/": { priority: 0.4, changefreq: "yearly" },
  "/transparenz/": { priority: 0.4, changefreq: "yearly" },
  "/more-info/": { priority: 0.3, changefreq: "yearly" },
};

const NEWS_WEIGHT = { priority: 0.6, changefreq: "monthly" };
const DEFAULT_WEIGHT = { priority: 0.3, changefreq: "yearly" };

// https://astro.build/config
export default defineConfig({
  site: "https://" + siteUrl,
  vite: { plugins: [tailwindcss()] },
  integrations: [
    sitemap({
      filter: (page) => !EXCLUDED_FROM_SITEMAP.includes(new URL(page).pathname),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const weight =
          WEIGHTS[path] ??
          (path.startsWith("/news/") ? NEWS_WEIGHT : DEFAULT_WEIGHT);

        return { ...item, ...weight };
      },
    }),
  ],
  image: {
    domains: ["cdn.sanity.io"],
  },
});

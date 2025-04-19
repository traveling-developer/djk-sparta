// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.SITE_URL

// https://astro.build/config
export default defineConfig({
  site: 'https://' + siteUrl,
  integrations: [tailwind(), sitemap()]
});
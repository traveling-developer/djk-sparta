// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

const siteUrl = process.env.SITE_URL

// https://astro.build/config
export default defineConfig({
  site: 'https://' + siteUrl,
  integrations: [tailwind()]
});
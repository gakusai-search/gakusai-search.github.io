// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gakusai-search.github.io',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/og-preview'),
    }),
  ],
});

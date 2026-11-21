// @ts-check
import { defineConfig } from 'astro/config';

// Para GitHub Pages en https://chamorrosamuel.github.io/PortFolioSamuel/
// compila con: SITE_URL=https://chamorrosamuel.github.io BASE_PATH=/PortFolioSamuel npm run build
// Con dominio propio o Vercel deja BASE_PATH vacío.
export default defineConfig({
  site: process.env.SITE_URL || 'https://chamorrosamuel.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  image: {
    responsiveStyles: false,
  },
});

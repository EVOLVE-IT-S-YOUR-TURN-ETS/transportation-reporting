import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves a project site from a subfolder:
//   https://<org>.github.io/transportation-reporting/
// so every asset path has to be prefixed with that folder name, otherwise
// the page loads but the CSS and JS 404 and you get a blank screen.
//
// In dev (npm run dev) the app is served from the root, so the prefix is
// only applied to production builds.
//
// If you later point a custom domain at this (e.g. report.evolveitsyourturn.org)
// the app sits at the root again — change BASE to '/'.
// Netlify, Vercel and Cloudflare Pages also serve from the root, so BASE
// should be '/' there too.
const BASE = '/transportation-reporting/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [react(), tailwindcss()],
}))
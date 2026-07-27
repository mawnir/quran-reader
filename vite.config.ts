import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate', // auto-installs new versions in the background
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'], // any static files in /public
        manifest: {
          name: 'Quran Reader',
          short_name: 'Quran',
          description: 'Offline Quran reader with tafsir and word-by-word translation',
          theme_color: '#0f172a', // match your app's accent/bg
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'quran-icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'quran-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'quran-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache everything Workbox can find in the build output —
          // this covers your JS bundle (which includes quran_data.json), CSS, fonts
          globPatterns: ['**/*.{js,css,html,woff2,svg,png,ico}'],
          // Bump this if you have very large files (your quran_data.json bundled
          // into a JS chunk can push a chunk over Workbox's 2MB default limit)
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        },
        devOptions: {
          enabled: true, // lets you test the service worker in `vite dev`, not just build
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

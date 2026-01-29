import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['sonoran.svg'],
      manifest: {
        name: 'Sonoran Pomodoro',
        short_name: 'Pomodoro',
        description: 'Customizable Pomodoro clock with a chill Sonoran-desert-inspired design.',
        theme_color: '#070814',
        background_color: '#070814',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          // Note: iOS prefers apple-touch-icon PNG; if missing, it still installs (uses a snapshot).
          { src: '/sonoran.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})

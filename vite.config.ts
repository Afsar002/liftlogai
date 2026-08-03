import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    // Emit every imported asset as a file instead of inlining <4KB files as
    // base64 into the JS bundle. The exercise thumbnails are WebP (~3KB each);
    // inlining ~1,300 of them would balloon the main chunk by several MB.
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        // Split the large shared libraries into stable vendor chunks so the
        // main entry stays small and each library is cached independently.
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|react-hot-toast|react-icons|scheduler)[\\/]/,
            },
            {
              name: "vendor-motion",
              test: /node_modules[\\/](framer-motion|motion|motion-dom)[\\/]/,
            },
            {
              name: "vendor-charts",
              test: /node_modules[\\/](recharts|d3-[a-z-]+|victory-vendor|decimal|internmap)[\\/]/,
            },
            {
              name: "vendor-data",
              test: /node_modules[\\/](dexie|dexie-react-hooks|uuid|dayjs)[\\/]/,
            },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "LiftLog AI",
        short_name: "LiftLog",
        theme_color: "#22C55E",
        background_color: "#0B0B0B",
        display: "standalone",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        // Exercise media is too large to precache. Runtime-cache it on first
        // use so previously-viewed thumbnails and GIFs work offline while the
        // service worker stays well under the browser's cache quota.
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(?:jpg|jpeg|webp|png|svg|avif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "exercise-media",
              expiration: {
                maxEntries: 1500,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/exercises\/gifs\/.*\.gif$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "exercise-gifs",
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    })
  ]
})

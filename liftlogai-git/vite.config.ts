import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
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
      }
    })
  ],
  build: {
    // Vendor splitting: separate heavy third-party libs into their own chunks
    // so the initial route doesn't pay the full cost up front.
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor")) {
              return "charts";
            }
            if (id.includes("framer-motion")) {
              return "motion";
            }
            if (id.includes("react") || id.includes("scheduler")) {
              return "react-vendor";
            }
            if (id.includes("dexie")) {
              return "db";
            }
            if (id.includes("react-icons")) {
              return "icons";
            }
            return "vendor";
          }
        },
      },
    },
  },
});

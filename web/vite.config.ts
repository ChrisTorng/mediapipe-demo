import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const enableFastApiProxy = process.env.VITE_ENABLE_FASTAPI_PROXY === "true";
const fastApiTarget = process.env.VITE_FASTAPI_TARGET ?? "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
  "@": path.resolve(rootDir, "src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: enableFastApiProxy
      ? {
          "/mediapipe": {
            target: fastApiTarget,
            changeOrigin: true,
          },
        }
      : undefined,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});

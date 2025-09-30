var _a;
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
var rootDir = path.dirname(fileURLToPath(import.meta.url));
var enableFastApiProxy = process.env.VITE_ENABLE_FASTAPI_PROXY === "true";
var fastApiTarget = (_a = process.env.VITE_FASTAPI_TARGET) !== null && _a !== void 0 ? _a : "http://localhost:8000";
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

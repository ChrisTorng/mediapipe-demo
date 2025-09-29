import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
var rootDir = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        include: [
            "tests/unit/**/*.test.{ts,tsx}",
            "tests/unit/**/*.spec.{ts,tsx}",
        ],
        coverage: {
            reporter: ["text", "lcov"],
        },
        alias: {
            "@": path.resolve(rootDir, "src"),
        },
    },
});

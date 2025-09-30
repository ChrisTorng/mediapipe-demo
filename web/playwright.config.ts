import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: path.join(rootDir, "tests"),
  testIgnore: ["**/unit/**"],
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/unit/**", "**/mobile-try-on.spec.ts"],
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
      testIgnore: ["**/unit/**"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

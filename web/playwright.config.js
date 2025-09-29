var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
var rootDir = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    testDir: path.join(rootDir, "tests"),
    testIgnore: ["**/unit/**"],
    timeout: 90000,
    expect: {
        timeout: 10000,
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
            use: __assign({}, devices["Desktop Chrome"]),
            testIgnore: ["**/unit/**", "**/mobile-try-on.spec.ts"],
        },
        {
            name: "chromium-mobile",
            use: __assign({}, devices["Pixel 7"]),
            testIgnore: ["**/unit/**"],
        },
    ],
    webServer: {
        command: "npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});

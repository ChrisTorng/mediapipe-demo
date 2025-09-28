import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __XR_METRICS__?: {
      getSnapshot: () => { rollingFps: number; latencyMs: number; updatedAt: string };
    };
  }
}

test.describe("性能煙霧測試", () => {
  test("rolling fps 與 latency 應符合門檻", async ({ context, page }) => {
    await context.grantPermissions(["camera"]);
    await page.goto("/");

    await page.waitForTimeout(5000);

    const metrics = await page.evaluate(() => window.__XR_METRICS__?.getSnapshot());

    expect(metrics).toBeTruthy();
    expect(metrics?.rollingFps ?? 0).toBeGreaterThanOrEqual(30);
    expect(metrics?.latencyMs ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(200);
  });
});

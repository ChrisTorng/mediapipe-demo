import { expect, test } from "@playwright/test";

test.describe("行動裝置主流程", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["camera"]);
  });

  test("授權鏡頭並切換三種示範資產", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "XR 虛擬試戴" })).toBeVisible();
    await expect(page.getByTestId("device-indicator")).toHaveText(/mobile/i);

    await expect(page.getByTestId("camera-status"))
      .toHaveText(/ready/i, { timeout: 15_000 });

    await expect(page.getByTestId("preview-stage")).toBeVisible();

    await page.getByRole("button", { name: "彩妝" }).click();
    await expect(page.getByTestId("active-asset"))
      .toHaveText(/彩妝/i, { timeout: 10_000 });

    await page.getByRole("button", { name: "鞋款" }).click();
    await expect(page.getByTestId("active-asset")).toHaveText(/鞋款/i);

    await page.getByRole("button", { name: "眼鏡" }).click();
    await expect(page.getByTestId("active-asset")).toHaveText(/眼鏡/i);

    await expect(page.getByTestId("fps-indicator")).toContainText("FPS");
    await expect(page.getByTestId("latency-indicator")).toContainText("ms");
  });
});

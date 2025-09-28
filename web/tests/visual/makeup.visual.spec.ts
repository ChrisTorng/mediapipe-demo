import { expect, test } from "@playwright/test";

test.describe("彩妝視覺回歸", () => {
  test("彩妝 shader 套用", async ({ context, page }) => {
    await context.grantPermissions(["camera"]);
    await page.goto("/");

    await page.getByRole("button", { name: "彩妝" }).click();
    await expect(page.getByTestId("active-asset")).toHaveText(/彩妝/i);

    await expect(page).toHaveScreenshot("makeup.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });
});

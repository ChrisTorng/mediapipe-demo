import { expect, test } from "@playwright/test";

test.describe("眼鏡視覺回歸", () => {
  test("主要覆蓋眼鏡資產 overlay", async ({ context, page }) => {
    await context.grantPermissions(["camera"]);
    await page.goto("/");

    await page.getByRole("button", { name: "眼鏡" }).click();
    await expect(page.getByTestId("active-asset")).toHaveText(/眼鏡/i);

    await expect(page).toHaveScreenshot("glasses.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

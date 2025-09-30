import { expect, test } from "@playwright/test";

test.describe("鞋款視覺回歸", () => {
  test("鞋款 overlay 與足部追蹤", async ({ context, page }) => {
    await context.grantPermissions(["camera"]);
    await page.goto("/");

    await page.getByRole("button", { name: "鞋款" }).click();
    await expect(page.getByTestId("active-asset")).toHaveText(/鞋款/i);

    await expect(page).toHaveScreenshot("shoes.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });
});

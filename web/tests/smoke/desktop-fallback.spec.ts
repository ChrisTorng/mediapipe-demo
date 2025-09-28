import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";

const SAMPLE_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAoMBgB2+atoAAAAASUVORK5CYII=";

test.describe("桌機降階流程", () => {
  test("拒絕鏡頭後可使用照片上傳模式", async ({ page }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - 於測試環境覆寫 getUserMedia
      navigator.mediaDevices.getUserMedia = async () => {
        const error = new DOMException("Permission denied", "NotAllowedError");
        throw error;
      };
    });

    await page.goto("/");

    await expect(page.getByTestId("camera-status"))
      .toHaveText(/permissionDenied/i, { timeout: 10_000 });

    const buffer = Buffer.from(SAMPLE_IMAGE_BASE64, "base64");
    await page.getByTestId("photo-upload-input").setInputFiles({
      name: "sample-face.png",
      mimeType: "image/png",
      buffer,
    });

    await expect(page.getByTestId("preview-stage"))
      .toHaveAttribute("data-mode", "photo-fallback");

    await expect(page.getByTestId("uploaded-photo")).toBeVisible();
  });
});

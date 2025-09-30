import { describe, expect, it, vi } from "vitest";

import {
  MediaSessionError,
  createMediaSessionAdapter,
} from "@/mediapipe/media-session-adapter";
import { DemoAsset } from "@/models/demo-asset";

const mockAssets: DemoAsset[] = [
  {
    id: "glasses",
    label: "眼鏡",
    mediaType: "overlay",
    sourceUri: "/mock/glasses.png",
    modelConfig: {
      taskAssetPath: "/mock/face.task",
      wasm: {
        binaryPath: "/mock/vision.wasm",
        workerPath: "/mock/vision.worker.js",
      },
      fpsTarget: 60,
      notes: "notes",
    },
    accessibilityHintId: "hint-glasses",
    requiresCamera: true,
  },
];

describe("switchAsset 契約", () => {
  it("遇到不存在的資產應拋出 422 錯誤", async () => {
    const adapter = createMediaSessionAdapter({
      assets: mockAssets,
      loader: {
        preload: vi.fn(),
        switchTo: vi.fn(),
        getCached: vi.fn(),
        list: vi.fn(() => mockAssets),
      },
    });

    await adapter.initializeSession({ assetId: "glasses", deviceProfile: "desktop" });

    const request = adapter.switchAsset({ assetId: "invalid-asset" as never });

    await expect(request).rejects.toBeInstanceOf(MediaSessionError);
    await expect(request).rejects.toMatchObject({ statusCode: 422 });
  });
});

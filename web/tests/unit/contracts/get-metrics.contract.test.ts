import { describe, expect, it, vi } from "vitest";

import { createMediaSessionAdapter } from "@/mediapipe/media-session-adapter";
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

describe("getMetrics 契約", () => {
  it("應回傳 rollingFps 與 latencyMs 欄位", async () => {
    let currentTime = 0;
    const adapter = createMediaSessionAdapter({
      assets: mockAssets,
      now: () => currentTime,
      loader: {
        preload: vi.fn(),
        switchTo: vi.fn(),
        getCached: vi.fn(),
        list: vi.fn(() => mockAssets),
      },
    });

    await adapter.initializeSession({ assetId: "glasses", deviceProfile: "desktop" });

    adapter.recordFrame(0);
    adapter.recordFrame(16.67);
    adapter.recordFrame(33.34);

    currentTime = 120;
    const result = await adapter.getMetrics();

    expect(result.rollingFps).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(new Date(result.updatedAt).toISOString()).toBe(result.updatedAt);
  });
});

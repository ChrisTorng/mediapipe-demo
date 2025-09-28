import { afterEach, describe, expect, it, vi } from "vitest";

import {
  MediaSessionDependencies,
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
      fpsTarget: 52,
      notes: "face landmarker",
    },
    accessibilityHintId: "hint-glasses",
    requiresCamera: true,
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("initializeSession 契約", () => {
  it("應回傳 ready 狀態與 fpsTarget", async () => {
    const preload = vi.fn().mockResolvedValue(mockAssets[0]);
    const switchTo = vi.fn().mockResolvedValue(mockAssets[0]);
    const dependencies: MediaSessionDependencies = {
      assets: mockAssets,
      loader: {
        preload,
        switchTo,
        getCached: vi.fn(),
        list: vi.fn(() => mockAssets),
      },
      config: { defaultFpsTarget: 48 },
      now: () => 1_000,
    };

    const adapter = createMediaSessionAdapter(dependencies);

    const result = await adapter.initializeSession({
      assetId: "glasses",
      deviceProfile: "mobile",
    });

    expect(preload).toHaveBeenCalledWith("glasses");
    expect(result.status).toBe("ready");
    expect(result.fpsTarget).toBe(52);
    expect(result.notes).toContain("face landmarker");

    const state = adapter.getState();
    expect(state.activeAssetId).toBe("glasses");
    expect(state.deviceProfile).toBe("mobile");
  });
});

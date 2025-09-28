export type DemoAssetId = "glasses" | "makeup" | "shoes";

export type DemoAssetMediaType = "overlay" | "shader" | "foot-overlay";

export interface DemoAssetModelConfig {
  taskAssetPath: string;
  wasm: {
    binaryPath: string;
    workerPath: string;
  };
  fpsTarget: number;
  notes?: string;
}

export interface DemoAsset {
  id: DemoAssetId;
  label: string;
  mediaType: DemoAssetMediaType;
  sourceUri: string;
  modelConfig: DemoAssetModelConfig;
  accessibilityHintId: string;
  requiresCamera: boolean;
}

export const DEMO_ASSETS: DemoAsset[] = [
  {
    id: "glasses",
    label: "眼鏡",
    mediaType: "overlay",
  sourceUri: "/assets/glasses-overlay.svg",
    modelConfig: {
      taskAssetPath:
        "/mediapipe/face_landmarker.task",
      wasm: {
        binaryPath: "/mediapipe/vision_wasm_internal.wasm",
        workerPath: "/mediapipe/vision_wasm_internal.js",
      },
      fpsTarget: 60,
      notes: "使用 FaceLandmarker v2 追蹤五官並套用眼鏡 overlay",
    },
    accessibilityHintId: "hint-glasses",
    requiresCamera: true,
  },
  {
    id: "makeup",
    label: "彩妝",
    mediaType: "shader",
  sourceUri: "/assets/makeup-overlay.svg",
    modelConfig: {
      taskAssetPath:
        "/mediapipe/image_segmenter_deeplab_v3.tflite",
      wasm: {
        binaryPath: "/mediapipe/vision_wasm_internal.wasm",
        workerPath: "/mediapipe/vision_wasm_internal.js",
      },
      fpsTarget: 45,
  notes: "結合 FaceLandmarker 與 Image Segmenter 產生彩妝遮罩",
    },
    accessibilityHintId: "hint-makeup",
    requiresCamera: true,
  },
  {
    id: "shoes",
    label: "鞋款",
    mediaType: "foot-overlay",
  sourceUri: "/assets/shoes-overlay.svg",
    modelConfig: {
      taskAssetPath:
        "/mediapipe/pose_landmarker_full.task",
      wasm: {
        binaryPath: "/mediapipe/vision_wasm_internal.wasm",
        workerPath: "/mediapipe/vision_wasm_internal.js",
      },
      fpsTarget: 50,
      notes: "使用 Pose Landmarker 追蹤腳部點位套用 2D Overlay",
    },
    accessibilityHintId: "hint-shoes",
    requiresCamera: true,
  },
];

const assetById = new Map(DEMO_ASSETS.map((asset) => [asset.id, asset]));

export function getDemoAsset(id: DemoAssetId): DemoAsset {
  const asset = assetById.get(id);

  if (!asset) {
    throw new Error(`找不到對應的資產：${id}`);
  }

  return asset;
}

export function listDemoAssets(): DemoAsset[] {
  return [...DEMO_ASSETS];
}

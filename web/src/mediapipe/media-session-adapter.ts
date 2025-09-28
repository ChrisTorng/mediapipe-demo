import { DemoAsset, DemoAssetId, listDemoAssets } from "@/models/demo-asset";
import {
  CameraStatus,
  PreviewMode,
  PreviewState,
  calculateLatencyMs,
  calculateRollingFps,
  createInitialPreviewState,
  pushFpsSample,
} from "@/models/preview-state";

import {
  createDemoAssetLoader,
  DemoAssetLoader,
} from "./demo-asset-loader";

import { createMetricsTracker } from "@/utils/metrics";

export interface InitializeSessionInput {
  assetId: DemoAssetId;
  deviceProfile: PreviewState["deviceProfile"];
}

export interface SwitchAssetInput {
  assetId: DemoAssetId;
}

export interface ToggleModeInput {
  mode: PreviewMode;
  cameraStatus?: CameraStatus;
}

export interface MetricsResponse {
  rollingFps: number;
  latencyMs: number;
  updatedAt: string;
}

export interface InitializeSessionResponse {
  status: "ready";
  fpsTarget: number;
  notes?: string;
}

export interface MediaSessionAdapter {
  initializeSession(input: InitializeSessionInput): Promise<InitializeSessionResponse>;
  switchAsset(input: SwitchAssetInput): Promise<void>;
  toggleMode(input: ToggleModeInput): Promise<void>;
  getMetrics(): Promise<MetricsResponse>;
  recordFrame(timestamp?: number): void;
  getState(): PreviewState;
  subscribe(listener: (state: PreviewState) => void): () => void;
}

export class MediaSessionError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "MediaSessionError";
  }
}

export interface MediaSessionDependencies {
  loader?: DemoAssetLoader;
  assets?: DemoAsset[];
  now?: () => number;
  config?: {
    defaultFpsTarget?: number;
  };
}

const DEFAULT_FPS_TARGET = 45;

function cloneState(state: PreviewState): PreviewState {
  return JSON.parse(JSON.stringify(state)) as PreviewState;
}

export function createMediaSessionAdapter(
  deps: MediaSessionDependencies = {}
): MediaSessionAdapter {
  const assets = deps.assets ?? listDemoAssets();
  const assetMap = new Map<DemoAssetId, DemoAsset>(assets.map((asset) => [asset.id, asset]));
  const loader = deps.loader ?? createDemoAssetLoader({ assets });
  const listeners = new Set<(state: PreviewState) => void>();
  const now = deps.now ?? (() => Date.now());
  const metricsTracker = createMetricsTracker({ now });

  let state: PreviewState = {
    ...createInitialPreviewState(),
    activeAssetId: assets[0]?.id ?? "glasses",
  };
  let fpsTarget = deps.config?.defaultFpsTarget ?? DEFAULT_FPS_TARGET;

  function emit() {
    const current = cloneState(state);
    listeners.forEach((listener) => listener(current));
  }

  function ensureAsset(assetId: DemoAssetId): DemoAsset {
    const asset = assetMap.get(assetId);

    if (!asset) {
      throw new MediaSessionError(`資產 ${assetId} 不存在`, 422);
    }

    return asset;
  }

  async function primeAsset(assetId: DemoAssetId) {
    const asset = ensureAsset(assetId);
    await loader.preload(assetId);
    return asset;
  }

  return {
    async initializeSession(input) {
      const asset = await primeAsset(input.assetId);

      state = {
        ...state,
        activeAssetId: asset.id,
        deviceProfile: input.deviceProfile,
        cameraStatus: "ready",
        mode: "live",
        fpsHistory: [],
        lastFrameTimestamp: null,
      };

      fpsTarget = asset.modelConfig.fpsTarget ?? deps.config?.defaultFpsTarget ?? DEFAULT_FPS_TARGET;
      metricsTracker.reset();

      emit();

      return {
        status: "ready",
        fpsTarget,
        notes: asset.modelConfig.notes,
      };
    },
    async switchAsset(input) {
      const asset = ensureAsset(input.assetId);
      await loader.switchTo(asset.id);

      state = {
        ...state,
        activeAssetId: asset.id,
        fpsHistory: [],
        lastFrameTimestamp: null,
      };

      fpsTarget = asset.modelConfig.fpsTarget ?? fpsTarget;
      metricsTracker.reset();

      emit();
    },
    async toggleMode(input) {
      if (input.mode !== "live" && input.mode !== "photo-fallback") {
        throw new MediaSessionError(`不支援的模式 ${input.mode}`, 400);
      }

      state = {
        ...state,
        mode: input.mode,
        cameraStatus: input.cameraStatus ?? state.cameraStatus,
      };

      emit();
    },
    async getMetrics() {
      return metricsTracker.getSnapshot();
    },
    recordFrame(timestamp) {
      metricsTracker.recordFrame(timestamp);
      const metricsState = metricsTracker.getState();
      state = {
        ...state,
        fpsHistory: metricsState.fpsHistory,
        lastFrameTimestamp: metricsState.lastFrameTimestamp,
      };
      emit();
    },
    getState() {
      return cloneState(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(cloneState(state));

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

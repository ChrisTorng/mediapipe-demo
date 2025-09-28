import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  InitializeSessionInput,
  MetricsResponse,
  MediaSessionAdapter,
  MediaSessionError,
  ToggleModeInput,
  createMediaSessionAdapter,
} from "@/mediapipe/media-session-adapter";
import { listDemoAssets } from "@/models/demo-asset";
import { PreviewState, createInitialPreviewState } from "@/models/preview-state";

declare global {
  interface Window {
    __XR_METRICS__?: {
      getSnapshot: () => MetricsResponse;
    };
  }
}

const METRICS_INTERVAL_MS = 1_000;

function detectDeviceProfile(): InitializeSessionInput["deviceProfile"] {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const width = window.innerWidth;

  if (width <= 768) {
    return "mobile";
  }

  if (width <= 1024) {
    return "tablet";
  }

  return "desktop";
}

function createInitialMetrics(): MetricsResponse {
  const now = new Date().toISOString();

  return {
    rollingFps: 0,
    latencyMs: 0,
    updatedAt: now,
  };
}

export interface UseMediaSessionResult {
  state: PreviewState;
  metrics: MetricsResponse;
  assets: ReturnType<typeof listDemoAssets>;
  error: string | null;
  initialize: (assetId?: InitializeSessionInput["assetId"]) => Promise<void>;
  switchAsset: (assetId: InitializeSessionInput["assetId"]) => Promise<void>;
  toggleMode: (input: ToggleModeInput) => Promise<void>;
  recordFrame: (timestamp?: number) => void;
  refreshMetrics: () => Promise<void>;
}

export function useMediaSession(): UseMediaSessionResult {
  const adapterRef = useRef<MediaSessionAdapter>();
  const [state, setState] = useState<PreviewState>(createInitialPreviewState());
  const [metrics, setMetrics] = useState<MetricsResponse>(createInitialMetrics);
  const [error, setError] = useState<string | null>(null);

  const assets = useMemo(() => listDemoAssets(), []);

  const adapter = useMemo(() => {
    if (!adapterRef.current) {
      adapterRef.current = createMediaSessionAdapter({ assets });
    }
    return adapterRef.current;
  }, [assets]);

  useEffect(() => {
    const unsubscribe = adapter.subscribe((nextState: PreviewState) => {
      setState(nextState);
    });

    return unsubscribe;
  }, [adapter]);

  const refreshMetrics = useCallback(async () => {
    const nextMetrics = await adapter.getMetrics();
    setMetrics(nextMetrics);
  }, [adapter]);

  const initialize = useCallback(
    async (assetId: InitializeSessionInput["assetId"] = assets[0]?.id ?? "glasses") => {
      try {
        setError(null);
        await adapter.initializeSession({
          assetId,
          deviceProfile: detectDeviceProfile(),
        });
        await refreshMetrics();
      } catch (cause) {
        const reason = cause instanceof MediaSessionError ? cause.message : "初始化失敗";
        setError(reason);
        throw cause;
      }
    },
    [adapter, assets, refreshMetrics]
  );

  const switchAsset = useCallback(
    async (assetId: InitializeSessionInput["assetId"]) => {
      try {
        setError(null);
        await adapter.switchAsset({ assetId });
        await refreshMetrics();
      } catch (cause) {
        const reason =
          cause instanceof MediaSessionError ? cause.message : "切換資產失敗";
        setError(reason);
        throw cause;
      }
    },
    [adapter, refreshMetrics]
  );

  const toggleMode = useCallback(
    async (input: ToggleModeInput) => {
      try {
        setError(null);
        await adapter.toggleMode(input);
        await refreshMetrics();
      } catch (cause) {
        const reason = cause instanceof MediaSessionError ? cause.message : "切換模式失敗";
        setError(reason);
        throw cause;
      }
    },
    [adapter, refreshMetrics]
  );

  const recordFrame = useCallback(
    (timestamp?: number) => {
      adapter.recordFrame(timestamp);
    },
    [adapter]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshMetrics();
    }, METRICS_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [refreshMetrics]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.__XR_METRICS__ = {
      getSnapshot: () => ({ ...metrics }),
    };

    return () => {
      delete window.__XR_METRICS__;
    };
  }, [metrics]);

  return {
    state,
    metrics,
    assets,
    error,
    initialize,
    switchAsset,
    toggleMode,
    recordFrame,
    refreshMetrics,
  };
}

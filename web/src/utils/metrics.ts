import { calculateLatencyMs, calculateRollingFps, pushFpsSample } from "@/models/preview-state";

export interface MetricsSnapshot {
  rollingFps: number;
  latencyMs: number;
  updatedAt: string;
}

export interface MetricsTrackerOptions {
  historyLength?: number;
  sampleSize?: number;
  now?: () => number;
  performanceObserver?: PerformanceObserver | null;
}

export interface MetricsTrackerState {
  fpsHistory: number[];
  lastFrameTimestamp: number | null;
}

export interface MetricsTracker {
  recordFrame(timestamp?: number): void;
  reset(): void;
  getSnapshot(): MetricsSnapshot;
  getState(): MetricsTrackerState;
}

export function createMetricsTracker(options: MetricsTrackerOptions = {}): MetricsTracker {
  const resolveNow = () => {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  };

  const now = options.now ?? resolveNow;
  const sampleSize = options.sampleSize ?? 30;
  const maxHistory = options.historyLength ?? 60;

  const state: MetricsTrackerState = {
    fpsHistory: [],
    lastFrameTimestamp: null,
  };

  if (options.performanceObserver) {
    options.performanceObserver.observe({ type: "longtask", buffered: true });
  }

  return {
    recordFrame(timestamp) {
      const currentTimestamp = timestamp ?? now();

      if (state.lastFrameTimestamp !== null) {
        const delta = currentTimestamp - state.lastFrameTimestamp;
        const fps = delta > 0 ? 1000 / delta : 0;
        state.fpsHistory = pushFpsSample(state.fpsHistory, Number(fps.toFixed(2)), {
          maxLength: maxHistory,
        });
      }

      state.lastFrameTimestamp = currentTimestamp;
    },
    reset() {
      state.fpsHistory = [];
      state.lastFrameTimestamp = null;
    },
    getSnapshot() {
      const current = now();

      return {
        rollingFps: calculateRollingFps(state.fpsHistory, { sampleSize }),
        latencyMs: calculateLatencyMs(state.lastFrameTimestamp, current),
        updatedAt: new Date(current).toISOString(),
      };
    },
    getState() {
      return {
        fpsHistory: [...state.fpsHistory],
        lastFrameTimestamp: state.lastFrameTimestamp,
      };
    },
  };
}

export function createPerformanceObserver(
  handler: (entry: PerformanceEntry) => void
): PerformanceObserver | null {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
    return null;
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      handler(entry);
    }
  });

  return observer;
}

export type DeviceProfile = "desktop" | "mobile" | "tablet";
export type CameraStatus = "ready" | "permissionDenied" | "unavailable" | "initializing";
export type LightingHint = "good" | "dim" | "unknown";
export type PreviewMode = "live" | "photo-fallback";

import { DemoAssetId } from "@/models/demo-asset";

export interface PreviewState {
  activeAssetId: DemoAssetId;
  deviceProfile: DeviceProfile;
  cameraStatus: CameraStatus;
  lightingHint: LightingHint;
  mode: PreviewMode;
  fpsHistory: number[];
  lastFrameTimestamp: number | null;
}

export interface FpsBufferOptions {
  maxLength?: number;
  sampleSize?: number;
}

const DEFAULT_HISTORY_LENGTH = 60;
const DEFAULT_SAMPLE_SIZE = 30;

export function createInitialPreviewState(): PreviewState {
  return {
    activeAssetId: "glasses",
    deviceProfile: "desktop",
    cameraStatus: "initializing",
    lightingHint: "unknown",
    mode: "live",
    fpsHistory: [],
    lastFrameTimestamp: null,
  };
}

export function pushFpsSample(
  history: number[],
  fps: number,
  options: FpsBufferOptions = {}
): number[] {
  const maxLength = options.maxLength ?? DEFAULT_HISTORY_LENGTH;
  const nextHistory = [...history, fps];

  if (nextHistory.length > maxLength) {
    nextHistory.splice(0, nextHistory.length - maxLength);
  }

  return nextHistory;
}

export function calculateRollingFps(
  history: number[],
  options: FpsBufferOptions = {}
): number {
  if (history.length === 0) {
    return 0;
  }

  const sampleSize = options.sampleSize ?? DEFAULT_SAMPLE_SIZE;
  const considered = history.slice(-sampleSize);
  const sum = considered.reduce((total, value) => total + value, 0);

  return Number((sum / considered.length).toFixed(2));
}

export function calculateLatencyMs(lastFrameTimestamp: number | null, now: number): number {
  if (!lastFrameTimestamp) {
    return 0;
  }

  return Math.max(0, now - lastFrameTimestamp);
}

export function deriveLightingHint(averageLuminance: number): LightingHint {
  if (averageLuminance >= 0.6) {
    return "good";
  }
  if (averageLuminance <= 0.3) {
    return "dim";
  }
  return "unknown";
}

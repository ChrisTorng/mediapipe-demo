import { ChangeEvent, useEffect, useRef, useState } from "react";

import { MetricsResponse } from "@/mediapipe/media-session-adapter";
import { PreviewState } from "@/models/preview-state";

export interface PreviewStageProps {
  state: PreviewState;
  metrics: MetricsResponse;
  onFrame: (timestamp?: number) => void;
  onUploadPhoto: (file: File) => void;
}

export function PreviewStage({ state, metrics, onFrame, onUploadPhoto }: PreviewStageProps) {
  const frameRequestRef = useRef<number>();
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    function renderFrame(timestamp: number) {
      onFrame(timestamp);
      frameRequestRef.current = window.requestAnimationFrame(renderFrame);
    }

    frameRequestRef.current = window.requestAnimationFrame(renderFrame);

    return () => {
      if (frameRequestRef.current) {
        window.cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [onFrame]);

  useEffect(() => {
    if (state.mode === "live") {
      setUploadedPhotoUrl(null);
    }
  }, [state.mode]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onUploadPhoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section
      className="relative w-full overflow-hidden rounded-xl border border-surface-elevated bg-surface-base"
      data-testid="preview-stage"
      data-mode={state.mode}
    >
      <div className="flex items-center justify-between px-4 py-2 text-sm text-text-secondary">
        <span data-testid="device-indicator">{state.deviceProfile}</span>
        <span data-testid="camera-status">{state.cameraStatus}</span>
      </div>

      <div className="flex h-64 items-center justify-center bg-neutral-900 text-neutral-200">
        {state.mode === "live" ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-semibold">Live Preview Placeholder</span>
            <span className="text-xs text-neutral-400">鏡頭畫面將顯示於此</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {uploadedPhotoUrl ? (
              <img
                src={uploadedPhotoUrl}
                alt="上傳的照片"
                className="max-h-56 rounded-lg object-contain"
                data-testid="uploaded-photo"
              />
            ) : (
              <span className="text-sm text-neutral-400" data-testid="uploaded-photo-empty">
                尚未上傳照片
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-surface-elevated px-4 py-3 text-sm">
        <span data-testid="fps-indicator">FPS: {metrics.rollingFps.toFixed(1)}</span>
        <span data-testid="latency-indicator">Latency: {Math.round(metrics.latencyMs)} ms</span>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-brand-primary">
          <input
            data-testid="photo-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <span>上傳照片</span>
        </label>
      </div>
    </section>
  );
}

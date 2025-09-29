import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import { MetricsResponse } from "@/mediapipe/media-session-adapter";
import { CameraStatus, PreviewState } from "@/models/preview-state";

export interface PreviewStageProps {
  state: PreviewState;
  metrics: MetricsResponse;
  onFrame: (timestamp?: number) => void;
  onUploadPhoto: (file: File) => void;
  onCameraStatusChange?: (status: CameraStatus) => void;
}

export function PreviewStage({
  state,
  metrics,
  onFrame,
  onUploadPhoto,
  onCameraStatusChange,
}: PreviewStageProps) {
  const frameRequestRef = useRef<number>();
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitializingCamera, setIsInitializingCamera] = useState<boolean>(false);
  const [livePreviewError, setLivePreviewError] = useState<string | null>(null);

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

  const stopLiveStream = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (state.mode !== "live") {
      stopLiveStream();
      setLivePreviewError(null);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setLivePreviewError("此裝置不支援鏡頭或瀏覽器已停用相關功能。");
      onCameraStatusChange?.("unavailable");
      setIsInitializingCamera(false);
      return;
    }

    let cancelled = false;

    async function startStream() {
      if (streamRef.current) {
        const video = videoRef.current;
        if (video && video.srcObject !== streamRef.current) {
          video.srcObject = streamRef.current;
        }
        return;
      }

      try {
        setIsInitializingCamera(true);
        onCameraStatusChange?.("initializing");

        const constraints: MediaStreamConstraints = {
          audio: false,
          video:
            state.deviceProfile === "desktop"
              ? {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }
              : {
                  facingMode: "user",
                },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;

        if (video) {
          video.srcObject = stream;
          video.muted = true;
          try {
            await video.play();
          } catch {
            const handleLoadedMetadata = () => {
              video.play().catch(() => undefined);
              video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            };
            video.addEventListener("loadedmetadata", handleLoadedMetadata);
          }
        }

        onCameraStatusChange?.("ready");
        setLivePreviewError(null);
      } catch (error) {
        console.error(error);
        const domError = error instanceof DOMException ? error : null;
        const isPermissionDenied = domError?.name === "NotAllowedError";

        const message = isPermissionDenied
          ? "鏡頭權限遭拒，請於瀏覽器設定中允許存取。"
          : "鏡頭啟動失敗，請確認裝置與權限設定。";

        setLivePreviewError(message);
        onCameraStatusChange?.(isPermissionDenied ? "permissionDenied" : "unavailable");
      } finally {
        if (!cancelled) {
          setIsInitializingCamera(false);
        }
      }
    }

    void startStream();

    return () => {
      cancelled = true;
    };
  }, [state.mode, state.deviceProfile, onCameraStatusChange, stopLiveStream]);

  useEffect(() => () => stopLiveStream(), [stopLiveStream]);

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
          <div className="relative h-full w-full">
            <video
              ref={videoRef}
              className={`h-full w-full object-cover transition-opacity duration-300 ${livePreviewError ? "opacity-20" : "opacity-100"}`}
              playsInline
              autoPlay
              muted
              data-testid="live-video"
            />

            {(isInitializingCamera || livePreviewError) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-900/80 px-6 text-center">
                {isInitializingCamera && !livePreviewError ? (
                  <>
                    <span className="text-lg font-semibold">啟動鏡頭中…</span>
                    <span className="text-xs text-neutral-300">請確認已允許鏡頭權限或稍候片刻</span>
                  </>
                ) : null}

                {livePreviewError ? (
                  <>
                    <span className="text-lg font-semibold">無法顯示鏡頭</span>
                    <span className="text-xs text-neutral-300">{livePreviewError}</span>
                  </>
                ) : null}
              </div>
            ) : null}
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

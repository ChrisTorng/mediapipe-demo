import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MetricsResponse } from "@/mediapipe/media-session-adapter";
import { DemoAsset, DemoAssetMediaType } from "@/models/demo-asset";
import { CameraStatus, PreviewState } from "@/models/preview-state";

function getOverlayPosition(mediaType?: DemoAssetMediaType): string {
  switch (mediaType) {
    case "overlay":
      return "top-1/2 left-1/2 w-[60%] max-w-sm -translate-x-1/2 -translate-y-1/2";
    case "shader":
      return "inset-0 h-full w-full";
    case "foot-overlay":
      return "bottom-6 left-1/2 w-[75%] max-w-lg -translate-x-1/2";
    default:
      return "top-1/2 left-1/2 w-1/2 max-w-sm -translate-x-1/2 -translate-y-1/2";
  }
}

function getOverlayEnhancements(mediaType?: DemoAssetMediaType): string {
  switch (mediaType) {
    case "overlay":
      return "drop-shadow-xl";
    case "shader":
      return "mix-blend-screen saturate-150";
    case "foot-overlay":
      return "drop-shadow-lg";
    default:
      return "";
  }
}

function getOverlayOpacity(mediaType: DemoAssetMediaType | undefined, visible: boolean): string {
  if (!visible) {
    return "opacity-0";
  }

  switch (mediaType) {
    case "shader":
      return "opacity-80";
    case "foot-overlay":
      return "opacity-85";
    default:
      return "opacity-90";
  }
}

export interface PreviewStageProps {
  state: PreviewState;
  metrics: MetricsResponse;
  onFrame: (timestamp?: number) => void;
  onUploadPhoto: (file: File) => void;
  onCameraStatusChange?: (status: CameraStatus) => void;
  activeAsset?: DemoAsset | null;
}

export function PreviewStage({
  state,
  metrics,
  onFrame,
  onUploadPhoto,
  onCameraStatusChange,
  activeAsset,
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

  const shouldShowOverlay = useMemo(() => {
    if (!activeAsset) {
      return false;
    }

    if (state.mode === "live") {
      return state.cameraStatus === "ready" && !livePreviewError && !isInitializingCamera;
    }

    return Boolean(uploadedPhotoUrl);
  }, [activeAsset, state.cameraStatus, state.mode, livePreviewError, isInitializingCamera, uploadedPhotoUrl]);

  const overlayClassName = useMemo(() => {
    if (!activeAsset) {
      return "";
    }

    const base = [
      "pointer-events-none",
      "absolute",
      "z-10",
      "select-none",
      "object-contain",
      "transition-all",
      "duration-500",
      "ease-out",
    ];

    base.push(getOverlayPosition(activeAsset.mediaType));
    base.push(getOverlayEnhancements(activeAsset.mediaType));
    base.push(getOverlayOpacity(activeAsset.mediaType, shouldShowOverlay));

    return base.filter(Boolean).join(" ");
  }, [activeAsset, shouldShowOverlay]);

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

      <div className="relative flex h-64 w-full items-center justify-center bg-neutral-900 text-neutral-200">
        {state.mode === "live" ? (
          <>
            <video
              ref={videoRef}
              className={`h-full w-full object-cover transition-opacity duration-300 ${livePreviewError ? "opacity-20" : "opacity-100"}`}
              playsInline
              autoPlay
              muted
              data-testid="live-video"
            />

            {activeAsset ? (
              <img
                src={activeAsset.sourceUri}
                alt=""
                aria-hidden="true"
                role="presentation"
                className={overlayClassName}
                data-testid="asset-overlay"
                draggable={false}
              />
            ) : null}

            {(isInitializingCamera || livePreviewError) ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-neutral-900/80 px-6 text-center">
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
          </>
        ) : (
          <>
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
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

            {activeAsset ? (
              <img
                src={activeAsset.sourceUri}
                alt=""
                aria-hidden="true"
                role="presentation"
                className={overlayClassName}
                data-testid="asset-overlay"
                draggable={false}
              />
            ) : null}
          </>
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

import { useCallback, useEffect } from "react";

import { getAccessibilityHint } from "@/models/accessibility-hint";
import { DemoAssetId } from "@/models/demo-asset";
import { DeviceProfile } from "@/models/preview-state";
import { AssetSelector } from "@/components/AssetSelector";
import { DeviceSwitchBanner } from "@/components/DeviceSwitchBanner";
import { PreviewStage } from "@/components/PreviewStage";
import { useMediaSession } from "@/hooks/useMediaSession";

function describeLighting(deviceProfile: DeviceProfile) {
  switch (deviceProfile) {
    case "mobile":
      return "請確認環境光線良好以提升追蹤精準度";
    case "tablet":
      return "保持裝置穩定並避免背光";
    default:
      return "建議在自然光或柔和光源下體驗";
  }
}

export function TryOnScene() {
  const {
    assets,
    state,
    metrics,
    error,
    initialize,
    switchAsset,
    toggleMode,
    recordFrame,
    refreshMetrics,
  } = useMediaSession();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ video: true });
        }
        if (!cancelled) {
          await initialize();
        }
      } catch (cause) {
        if (!cancelled) {
          await toggleMode({ mode: "photo-fallback", cameraStatus: "permissionDenied" });
        }
      }
    }

    bootstrap().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [initialize, toggleMode]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshMetrics();
    }, 2_000);

    return () => window.clearInterval(intervalId);
  }, [refreshMetrics]);

  const handleSelectAsset = useCallback(
    async (assetId: DemoAssetId) => {
      await switchAsset(assetId);
    },
    [switchAsset]
  );

  const handleUploadPhoto = useCallback(
    async (_file: File) => {
      await toggleMode({ mode: "photo-fallback", cameraStatus: "permissionDenied" });
    },
    [toggleMode]
  );

  const accessibilityHint = getAccessibilityHint(
    assets.find((asset) => asset.id === state.activeAssetId)?.accessibilityHintId ?? "hint-glasses"
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-primary">XR 虛擬試戴</h1>
        <p className="text-sm text-text-secondary">
          即時試戴眼鏡、彩妝與鞋款，支援鏡頭與照片上傳模式。
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700" data-testid="error-banner">
          {error}
        </div>
      ) : null}

      <DeviceSwitchBanner
        deviceProfile={state.deviceProfile}
        mode={state.mode}
        onSwitchMode={(mode) =>
          toggleMode({
            mode,
            cameraStatus: mode === "photo-fallback" ? "permissionDenied" : "ready",
          })
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <PreviewStage
          state={state}
          metrics={metrics}
          onFrame={recordFrame}
          onUploadPhoto={handleUploadPhoto}
        />

        <div className="flex flex-col gap-4">
          <AssetSelector
            assets={assets}
            activeAssetId={state.activeAssetId}
            onSelect={handleSelectAsset}
            accessibilityHint={accessibilityHint}
          />
          <div className="rounded-lg border border-surface-elevated bg-surface-base p-4 text-sm text-text-secondary">
            <h3 className="text-base font-semibold text-text-primary">光線建議</h3>
            <p>{describeLighting(state.deviceProfile)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

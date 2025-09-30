import { DeviceProfile, PreviewMode } from "@/models/preview-state";

export interface DeviceSwitchBannerProps {
  deviceProfile: DeviceProfile;
  mode: PreviewMode;
  onSwitchMode: (mode: PreviewMode) => void;
}

const copyByProfile: Record<DeviceProfile, { title: string; description: string }> = {
  desktop: {
    title: "桌機模式",
    description: "建議使用鏡頭繼續體驗，若無鏡頭可切換至照片上傳模式。",
  },
  mobile: {
    title: "行動裝置模式",
    description: "手機可直接使用鏡頭。若欲改用桌機，可透過 QR code 進行鏡射。",
  },
  tablet: {
    title: "平板模式",
    description: "平板支援鏡頭或照片模式，請保持裝置穩定以提升追蹤準確度。",
  },
};

export function DeviceSwitchBanner({ deviceProfile, mode, onSwitchMode }: DeviceSwitchBannerProps) {
  const copy = copyByProfile[deviceProfile];
  const isPhotoMode = mode === "photo-fallback";

  return (
    <aside
      className="flex w-full flex-col gap-2 rounded-lg border border-brand-secondary/30 bg-brand-secondary/10 p-4 text-sm text-text-primary"
      data-testid="device-switch-banner"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-brand-secondary">{copy.title}</h3>
        <span className="rounded bg-brand-secondary/20 px-2 py-1 text-xs uppercase">
          {mode === "live" ? "Live" : "Photo"}
        </span>
      </div>
      <p className="text-text-secondary">{copy.description}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-brand-secondary px-3 py-2 text-sm text-brand-secondary transition hover:bg-brand-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
          onClick={() => onSwitchMode(isPhotoMode ? "live" : "photo-fallback")}
        >
          {isPhotoMode ? "返回即時鏡頭" : "改用照片模式"}
        </button>
      </div>
    </aside>
  );
}

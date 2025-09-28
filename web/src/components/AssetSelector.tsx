import { KeyboardEvent } from "react";

import { AccessibilityHint } from "@/models/accessibility-hint";
import { DemoAsset, DemoAssetId } from "@/models/demo-asset";

export interface AssetSelectorProps {
  assets: DemoAsset[];
  activeAssetId: DemoAssetId;
  onSelect: (assetId: DemoAssetId) => void;
  accessibilityHint?: AccessibilityHint;
}

function findNextAssetId(
  assets: DemoAsset[],
  activeAssetId: DemoAssetId,
  direction: "previous" | "next"
): DemoAssetId {
  const index = assets.findIndex((asset) => asset.id === activeAssetId);
  if (index === -1) {
    return assets[0]?.id ?? activeAssetId;
  }

  const nextIndex =
    direction === "next"
      ? (index + 1) % assets.length
      : (index - 1 + assets.length) % assets.length;

  return assets[nextIndex]?.id ?? activeAssetId;
}

export function AssetSelector({
  assets,
  activeAssetId,
  onSelect,
  accessibilityHint,
}: AssetSelectorProps) {
  const activeAsset = assets.find((asset) => asset.id === activeAssetId);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      onSelect(findNextAssetId(assets, activeAssetId, "next"));
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onSelect(findNextAssetId(assets, activeAssetId, "previous"));
    }
  };

  return (
    <section
      aria-labelledby="asset-selector-heading"
      className="w-full rounded-lg bg-surface-elevated p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 id="asset-selector-heading" className="text-xl font-semibold text-text-primary">
          選擇示範資產
        </h2>
        <span
          aria-live="polite"
          data-testid="active-asset"
          className="rounded-md bg-brand-primary/10 px-3 py-1 text-sm text-brand-primary"
        >
          {activeAsset?.label ?? "未選擇"}
        </span>
      </div>

      {accessibilityHint ? (
        <p className="mt-2 text-sm text-text-secondary" data-testid="asset-hint">
          {accessibilityHint.screenReaderMessage}
        </p>
      ) : null}

      <div
        className="mt-4 grid gap-2 sm:grid-cols-3"
        role="group"
        aria-label="試戴資產列表"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {assets.map((asset) => {
          const isActive = asset.id === activeAssetId;
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset.id)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors focus-visible:bg-brand-primary/10 focus-visible:outline-none ${
                isActive
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-surface-elevated bg-white text-text-primary hover:border-brand-secondary"
              }`}
              aria-pressed={isActive}
              data-testid={`asset-card-${asset.id}`}
            >
              <span className="block text-base font-medium">{asset.label}</span>
              <span className="mt-1 block text-xs text-text-secondary">{asset.mediaType}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

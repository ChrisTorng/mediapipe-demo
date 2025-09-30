import { AccessibilityHint } from "@/models/accessibility-hint";
import { DemoAsset } from "@/models/demo-asset";
import { PreviewState } from "@/models/preview-state";

export function composeAssetAnnouncement(
  asset: DemoAsset,
  hint: AccessibilityHint
): string {
  const shortcuts = hint.keyboardShortcuts.join("、");
  const gestures = hint.touchGestures.join("、");

  return [
    `目前選擇 ${asset.label} 示範`,
    `鍵盤快捷鍵：${shortcuts}`,
    `觸控手勢：${gestures}`,
    hint.screenReaderMessage,
  ].join("。") + "。";
}

export function describeCameraStatus(state: PreviewState): string {
  switch (state.cameraStatus) {
    case "ready":
      return "鏡頭已啟用，系統正在即時追蹤";
    case "permissionDenied":
      return "鏡頭權限被拒絕，已切換至照片模式";
    case "unavailable":
      return "裝置不支援鏡頭，請改用照片模式";
    default:
      return "鏡頭狀態初始化中";
  }
}

export function buildTouchInstruction(hint: AccessibilityHint): string {
  return `支援觸控手勢：${hint.touchGestures.join("、")}`;
}

export function buildKeyboardInstruction(hint: AccessibilityHint): string {
  return `鍵盤操作：${hint.keyboardShortcuts.join("、")}`;
}

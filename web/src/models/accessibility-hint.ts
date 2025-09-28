export interface AccessibilityHint {
  id: string;
  keyboardShortcuts: string[];
  touchGestures: string[];
  screenReaderMessage: string;
}

export const ACCESSIBILITY_HINTS: AccessibilityHint[] = [
  {
    id: "hint-glasses",
    keyboardShortcuts: ["←", "→", "Enter"],
    touchGestures: ["tap", "pinch"],
    screenReaderMessage:
      "目前為眼鏡示範，允許鏡頭後會即時套用眼鏡，按左右鍵可切換示範資產。",
  },
  {
    id: "hint-makeup",
    keyboardShortcuts: ["←", "→", "M"],
    touchGestures: ["double-tap", "swipe"],
    screenReaderMessage:
      "彩妝示範可切換色板，使用左右鍵或左右滑動切換，按 M 可切換美肌模式。",
  },
  {
    id: "hint-shoes",
    keyboardShortcuts: ["←", "→", "S"],
    touchGestures: ["tap", "long-press"],
    screenReaderMessage:
      "鞋款示範支援腳部追蹤。若無鏡頭請改用照片模式，上傳鞋款照片後長按切換角度。",
  },
];

const hintById = new Map(ACCESSIBILITY_HINTS.map((hint) => [hint.id, hint]));

export function getAccessibilityHint(id: string): AccessibilityHint {
  const hint = hintById.get(id);

  if (!hint) {
    throw new Error(`找不到無障礙提示 ${id}`);
  }

  return hint;
}

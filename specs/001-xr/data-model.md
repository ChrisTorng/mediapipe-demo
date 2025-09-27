# Data Model: XR 虛擬試戴體驗網站

## Entities

### DemoAsset
| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `id` | string | 唯一識別碼（`glasses`, `makeup`, `shoes`） | 固定三筆示範 | 
| `label` | string | 顯示名稱 | 用於多語系延伸 |
| `mediaType` | enum(`overlay`, `shader`, `foot-overlay`) | 渲染方式 | 對應不同 MediaPipe 任務 |
| `sourceUri` | string | 靜態資產位置（本地或 CDN） | 必須支援離線 fallback |
| `modelConfig` | object | MediaPipe 任務所需設定（landmark 模組、segmentation mask 等） | 於 build 時產生 |
| `accessibilityHintId` | string | 對應 `AccessibilityHint.id` | 確保一致性 |

### PreviewState
| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `activeAssetId` | string | 目前展示的 DemoAsset | 預設 `glasses` |
| `deviceProfile` | enum(`desktop`, `mobile`, `tablet`) | 依視窗大小與 UA 偵測 | 影響 UI 排版 |
| `cameraStatus` | enum(`ready`, `permissionDenied`, `unavailable`) | 目前鏡頭可用狀態 | 觸發 fallback |
| `lightingHint` | enum(`good`, `dim`, `unknown`) | 以曝光估計提供提示 | 由畫面平均亮度計算 |
| `mode` | enum(`live`, `photo-fallback`) | 是否使用照片模式 | 手動或自動切換 |
| `fpsHistory` | number[] | 最近 60 個 frame 的 fps 值 | 用於性能監控 |

### AccessibilityHint
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | 唯一識別碼（`hint-glasses`, `hint-makeup`, `hint-shoes`） |
| `keyboardShortcuts` | string[] | 支援的鍵盤操作（例：`ArrowLeft/Right` 切換 asset） |
| `touchGestures` | string[] | 觸控操作（例：`tap`、`swipe`） |
| `screenReaderMessage` | string | 供螢幕閱讀器朗讀的說明 |

## Relationships
- `DemoAsset.accessibilityHintId` → `AccessibilityHint.id`
- `PreviewState.activeAssetId` → `DemoAsset.id`

## State Diagram
```
[List View]
   │ select asset / change deviceProfile
   ▼
[Live Preview]
   │ camera unavailable      │ low light detected       │ close preview
   │-------------------------│--------------------------│
   ▼                         ▼                          ▼
[Request Permission]    [Photo Fallback]            [List View]
   │ allow / deny             │ capture/upload photo
   ▼                          ▼
[Live Preview] <-------------
```

## Validation Rules
- `DemoAsset.sourceUri` 必須透過 HTTPS，且對應檔案大小 ≤ 5 MB。
- `PreviewState.fpsHistory` 在 live 模式需持續更新；若 rolling 平均 < 30 fps，觸發性能警示。
- `AccessibilityHint.screenReaderMessage` 需提供裝置與模式相關資訊（ex: "目前為靜態照片模式"）。

## Derived Metrics
- `rollingFps = mean(fpsHistory[-30:])`
- `latencyMs = timestamp(currentFrame) - timestamp(lastInput)`，在煙霧測試中驗證 ≤ 200 ms。

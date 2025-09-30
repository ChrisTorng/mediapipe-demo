# Research: XR 虛擬試戴體驗網站

## 1. Browser & Device Support for MediaPipe Tasks Web
- **Decision**: 目標瀏覽器鎖定 Chrome 119+/Edge 119+/Safari 17+，皆支援 WebAssembly SIMD 與 WebGL 2。對於不支援的舊版瀏覽器，顯示升級提示。
- **Rationale**: MediaPipe Tasks 需 WASM SIMD 及 OffscreenCanvas 才能維持 45 fps；上述版本覆蓋主流桌機/行動裝置。
- **Alternatives Considered**:
  - 支援 Firefox：目前 Selfie Segmentation 在 Firefox 需要手動啟用 flags，效能不穩；暫不納入示範。

## 2. Model Selection per Demo Category
- **Decision**: 
  - 眼鏡：使用 FaceLandmarker v2 + 自訂 Overlay Shader。
  - 彩妝：使用 FaceLandmarker 的 landmark 與 SelfieSegmentation (general) 疊加色板。
  - 鞋款：使用 Mediapipe Pose Landmarker v2（足部關節）搭配簡易 2D overlay。
- **Rationale**: 皆為公開 Web 任務，無需訓練，能滿足單一示範資產需求。
- **Alternatives Considered**:
  - 使用 WebXR + Three.js：提高複雜度且依賴裝置 sensors；不符最小實作目標。

## 3. Camera-less / Low-light Fallback Strategy
- **Decision**: 提供靜態照片上傳流程，利用相同 MediaPipe 模型以單張影像推論，若曝光不足則使用對比增強預處理。
- **Rationale**: 不需後端，可用 `<input type="file">` 及 Canvas 處理；維持統一 pipeline。
- **Alternatives Considered**:
  - 轉向雲端推論：需後端與延遲較高，不符靜態網站目標。

## 4. Accessibility & Testing Toolchain
- **Decision**: 使用 `axe-core` 搭配 Playwright 無障礙掃描；手動檢查鍵盤導覽、螢幕閱讀器（VoiceOver / NVDA）腳本紀錄；文字與對比依 WCAG 2.1 AA。
- **Rationale**: 可在 CI 內自動化，又保留人工驗證。
- **Alternatives Considered**:
  - 使用 Lighthouse Accessibility 分數：保留作為補充，但對複雜互動偵測有限。

## 5. Static Hosting vs. Python Proxy
- **Decision**: 預設以純前端靜態資源部署（Netlify / GitHub Pages）；若遇到本機開發 wasm CORS 限制，再啟用最小 FastAPI 代理（single endpoint 轉發 `application/wasm`）。
- **Rationale**: MediaPipe 官方 CDN 支援直接導入；FastAPI 僅在企業環境禁止外部 CDN 時需要。
- **Alternatives Considered**:
  - Node.js Express 代理：團隊既有 Python 熟悉度較高，FastAPI 更適合作為後援。

## 6. Performance Measurement Approach
- **Decision**: 以 `requestAnimationFrame` 收集每次渲染耗時、計算 rolling fps；使用 PerformanceObserver 追蹤長任務（Long Task API），並在 Playwright 測試中紀錄指標。
- **Rationale**: 不需後端即可量測，結果可匯出 JSON 供 Lighthouse 報告引用。
- **Alternatives Considered**:
  - 使用外部 APM（New Relic）：超出示範範疇。

## Outstanding Items
- None

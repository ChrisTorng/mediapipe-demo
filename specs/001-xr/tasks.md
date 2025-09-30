# Tasks: XR 虛擬試戴體驗網站

**Feature Directory**: `specs/001-xr/`
**Input Documents**: `plan.md`, `research.md`, `data-model.md`, `contracts/media-session.yaml`, `quickstart.md`

## Phase 3.1 Setup
- [X] T001 Scaffold Vite React + TypeScript 專案結構於 `web/`，將 `src/components|hooks|mediapipe|scenes|styles|utils` 與 `tests/unit|visual|smoke|perf` 目錄初始化，並在 `web/package.json` 內建立 npm scripts（`dev`,`build`,`lint`,`test:unit`,`test:e2e`,`test:perf`）[P1]
- [X] T002 配置 TypeScript 嚴格模式與路徑別名（`tsconfig.json`, `vite.config.ts`），確保可導入 `@/components` 等別名 [P1]
- [X] T003 建立 ESLint + Prettier + Stylelint 設定（`web/.eslintrc.cjs`, `.prettierrc`, `.stylelintrc.cjs`），並將 constitution 原則檢查規則加入 `package.json` scripts [P1][P2]
- [X] T004 安裝並設定 Tailwind CSS + 自訂無障礙設計 token（`web/tailwind.config.cjs`, `web/postcss.config.cjs`, `web/src/styles/tokens.css`），同步在 `web/src/styles/global.css` 內引入 [P1][P2]
- [X] T005 安裝 Google MediaPipe Tasks Web 套件與對應 wasm 資產下載腳本 (`web/scripts/mediapipe/fetch-models.ts`)，並在 `package.json` postinstall 觸發 [P1][P3]

## Phase 3.2 Tests First (TDD)
- [X] T006 [P][P1][P3] 撰寫初始化契約測試於 `web/tests/unit/contracts/initialize-session.contract.test.ts`，模擬 `initializeSession` 回傳 `status: ready` 與 `fpsTarget`
- [X] T007 [P][P1][P3] 撰寫切換資產契約測試於 `web/tests/unit/contracts/switch-asset.contract.test.ts`，驗證無效資產時回傳 422
- [X] T009 [P][P1][P3] 撰寫指標查詢契約測試於 `web/tests/unit/contracts/get-metrics.contract.test.ts`，驗證 `rollingFps` 與 `latencyMs` 匯出格式
- [X] T010 [P][P1][P2][P3] 建立行動裝置主流程煙霧測試於 `web/tests/smoke/mobile-try-on.spec.ts`，覆蓋鏡頭授權與三資產切換
- [X] T011 [P][P1][P2] 建立桌機降階煙霧測試於 `web/tests/smoke/desktop-fallback.spec.ts`，覆蓋拒絕鏡頭→照片上傳流程
- [X] T012 [P][P2] 建立眼鏡視覺回歸基準於 `web/tests/visual/glasses.visual.spec.ts`
- [X] T013 [P][P2] 建立彩妝視覺回歸基準於 `web/tests/visual/makeup.visual.spec.ts`
- [X] T014 [P][P2] 建立鞋款視覺回歸基準於 `web/tests/visual/shoes.visual.spec.ts`
- [X] T015 [P][P3] 建立性能煙霧測試於 `web/tests/perf/session-metrics.perf.spec.ts`，紀錄 p95 延遲與 rolling fps
- [X] T016 [P][P2] 建立 axe 無障礙掃描腳本於 `web/tests/smoke/accessibility.spec.ts`

## Phase 3.3 Core Implementation
- [X] T017 實作 `DemoAsset` 型別與示例資料於 `web/src/models/demo-asset.ts`，提供靜態列表與授權註記 [P1][P2]
- [X] T018 實作 `AccessibilityHint` 型別與內容於 `web/src/models/accessibility-hint.ts`，含鍵盤/觸控/閱讀器訊息 [P1][P2]
- [X] T019 實作 `PreviewState` 與 fps buffer 輔助函式於 `web/src/models/preview-state.ts`，滿足性能指標追蹤 [P1][P3]
- [X] T020 建立 `web/src/mediapipe/media-session-adapter.ts`，封裝 MediaPipe 任務啟動、資產切換、模式切換、指標匯出並符合契約 [P1][P3]
- [X] T021 建立 `web/src/mediapipe/demo-asset-loader.ts`，負責下載 wasm/模型與資產緩存策略 [P1][P3]
- [X] T022 建立 `web/src/hooks/useMediaSession.ts` React hook，整合 adapter 與狀態管理 [P1][P3]
- [X] T023 建立 `web/src/components/AssetSelector.tsx`，負責資產清單與快捷鍵提示 [P2]
- [X] T024 建立 `web/src/components/PreviewStage.tsx`，呈現 live overlay、照片 fallback 與光線提醒 [P2][P3]
- [X] T025 建立 `web/src/components/DeviceSwitchBanner.tsx`，提示裝置/模式切換 [P2]
- [X] T026 建立 `web/src/scenes/TryOnScene.tsx` 與 `web/src/main.tsx` 入口，整合路由與 providers [P1][P2]

## Phase 3.4 Integration & Instrumentation
- [X] T027 實作性能監控工具於 `web/src/utils/metrics.ts`，提供 rolling fps、latency 計算與 PerformanceObserver hooks [P1][P3]
- [X] T028 實作無障礙與手勢輔助工具於 `web/src/utils/accessibility.ts`，產生讀屏訊息與觸控手勢 mapping [P1][P2]
- [ ] T029 擴充 `web/scripts/metrics/export-session-metrics.ts` 將測試結果輸出至 `docs/demos/perf/session-metrics.json` [P3]
- [ ] T030 在 `web/vite.config.ts` 設定可選 FastAPI proxy (`/mediapipe` route) 並記錄於 README [P1][P3]
- [ ] T031 建立備援 `server/app.py` FastAPI 靜態代理，支援 wasm 資產轉發 [P1][P3]
- [ ] T032 建立 CI Workflow `/.github/workflows/xr-demo.yml`，串接 lint、Vitest、Playwright、Lighthouse、axe [P1][P2][P3]

## Phase 3.5 Polish & Validation
- [ ] T033 [P][P1] 撰寫單元測試覆蓋 metrics 與 accessibility utils (`web/tests/unit/utils/metrics.test.ts`, `web/tests/unit/utils/accessibility.test.ts`)
- [ ] T034 [P][P2][P3] 更新 `docs/demos/xr-demo-performance.md`，附上 Lighthouse 指標、fps/latency 數據與截圖
- [ ] T035 [P][P2] 更新 `docs/demos/xr-demo-accessibility.md`，記錄螢幕閱讀器、鍵盤測試流程
- [ ] T036 [P][P1][P2] 整理驗證成果至 `specs/001-xr/validation.md`，對照 FR/PB 要求並附證據連結
- [ ] T037 [P][P2] 產出示範錄影並存放於 `docs/demos/xr-demo-demo.mp4`，在 README 加入連結
- [ ] T038 [P][P1][P3] 執行最終 `npm run lint && npm run test:unit && npm run test:e2e && npm run test:perf`，並在 `specs/001-xr/validation.md` 紀錄結果

## Dependencies
- T001 → T002 → T003 → T004 → T005（設定完成後方可進入測試階段）
- T006–T016 必須完成並確認測試失敗後，才能開始 T017 之後的實作
- T017 → T018 → T019 須依序完成以建立資料模型基礎
- T020 依賴 T017–T019 與 T021；T022 依賴 T020
- UI 元件 T023–T025 需在 hook T022 完成後開始；`TryOnScene` (T026) 依賴 T023–T025
- Instrumentation T027–T029 依賴核心實作 T019–T026
- FastAPI proxy T031 依賴 T030 完成 Vite proxy 設定
- CI 工作流程 T032 需在所有測試腳本（T006–T016, T033）存在後配置
- Polish 任務 T033–T038 需在核心與整合任務完成後執行

## Parallel Execution Example
以下任務位於不同檔案且無相依，可同時開工以節省時間：
```
tasks run T012 &
tasks run T013 &
tasks run T014 &
tasks run T015 &
tasks run T016 &
wait
```
上述平行批次將建立視覺/性能/無障礙測試基準，完成後再集中檢視測試失敗訊息以維持 TDD 流程。

---
*All tasks adhere to Constitution v1.0.0 (P1: Code Quality, P2: UX Consistency, P3: Performance Accountability).*

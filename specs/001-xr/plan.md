
# Implementation Plan: XR 虛擬試戴體驗網站

**Branch**: `001-xr` | **Date**: 2025-09-27 | **Spec**: [`spec.md`](./spec.md)
**Input**: Feature specification from `/specs/001-xr/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section by mapping the feature approach to each governing principle (Code Quality, UX Consistency, Performance Accountability).
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
建立一個以 Google MediaPipe Web 技術為核心的最小化 XR 試戴展示網站，提供眼鏡、彩妝、鞋款單一示例資產，在桌機、手機、平板上快速切換並即時預覽效果。目標是不依賴後端服務（除非必要才以 Python FastAPI 作為後援），以靜態網站形式驗證技術可行性並確保無障礙與性能門檻。

## Technical Context
**Language/Version**: TypeScript 5.x（若需後端則使用 Python 3.12 + FastAPI）  
**Primary Dependencies**: Google MediaPipe Tasks API for Web、Vite、Playwright、Vitest  
**Storage**: N/A（僅靜態資產與 in-memory 狀態）  
**Testing**: Vitest（單元）、Playwright（跨裝置模擬 E2E）、Lighthouse Smoke  
**Target Platform**: 現代桌機/手機/平板瀏覽器（Chrome、Safari、Edge 最新穩定版）
**Project Type**: single（靜態前端）  
**Performance Goals**: p95 動作到渲染 ≤ 200 ms；主要裝置 fps ≥45；初次載入資產 ≤3 秒  
**Constraints**: 偏好純前端靜態部署；必要時才引入 Python FastAPI 作為本地資產代理；必須符合 WCAG 2.1 AA 互動規範  
**Scale/Scope**: 單一示範頁面 + 3 個資產樣本；以 1 名展示者同時操作為主

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I – Uncompromising Code Quality**: 前端採用 TypeScript 嚴格模式、ESLint/Prettier、自動化煙霧測試與 90% 以上變更涵蓋率；Playwright 腳本納入 CI Gate，所有 PR 需由一位維護者審查。
- **Principle II – Seamless User Experience Consistency**: 桌機/手機/平板共享同一 UI 元件庫與 Tailwind 樣式 token；WCAG 2.1 AA 檢查（axe + 手動）列為合併前必跑；視覺回歸以 Playwright 截圖比對確保一致性。
- **Principle III – Performance Accountability**: Lighthouse + Web Vitals 腳本驗證 200 ms latency、≥45 fps；MediaPipe 以 WebAssembly 任務在主執行緒外運作並啟用 requestAnimationFrame 控制；必要時以 web worker 退場策略記錄。
- **Execution Standards**: 需求對應表將在 plan 與 tasks 中標註 P1/P2/P3；CI 執行 lint、Vitest、Playwright smoke、Lighthouse；釋出前提供 demo 錄影與效能報告鏈結。

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
web/
├── public/
│   └── assets/           # Demo 模型與靜態圖像
├── src/
│   ├── components/       # UI 元件（控制列、預覽畫面）
│   ├── hooks/            # MediaPipe session hook、裝置偵測
│   ├── mediapipe/        # MediaPipe 任務初始化與封裝
│   ├── scenes/           # 三個分類示範頁面
│   ├── styles/           # 共用樣式與無障礙 token
│   └── utils/            # FPS 量測、降階策略
└── tests/
   ├── unit/             # Vitest 單元測試（hook、utils）
   ├── visual/           # Playwright 視覺回歸
   └── smoke/            # Playwright 煙霧流程（桌機/手機 profile）

docs/
└── demos/                # Demo 操作說明、效能報告

scripts/
└── lighthouse/           # Lighthouse 驗證腳本

# 若需後端（僅當瀏覽器限制要求代理）
server/
└── app.py                # FastAPI 靜態資產代理（預設不啟動）
```

**Structure Decision**: 採單一 `web/` 靜態專案，使用 Vite 架構前端與測試目錄；`server/` 僅為備援。此結構符合最小實作並支援 CI 測試與文件輸出。

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - 器材支援度（桌機/手機瀏覽器）
   - MediaPipe Web 模型選型（眼鏡/彩妝/鞋款對應）
   - 無鏡頭情境降階方案
   - 無障礙測試與工具
   - 靜態部署與可選 FastAPI 代理判斷準則

2. **Generate and dispatch research agents**:
   ```
   1. Research browser support matrix for MediaPipe Tasks Web (FaceLandmarker, SelfieSegmentation, Body Segmentation).
   2. Research minimal demo asset preparation (眼鏡 overlay、彩妝 shader、鞋款 foot tracking)。
   3. Research fallback approach for photo upload try-on without live camera.
   4. Research WCAG 2.1 AA compliance checklist for WebAR/WebXR demos。
   5. Research static hosting options and criteria requiring FastAPI proxy（例如 CORS / wasm 資源路徑）。
   ```

3. **Consolidate findings** in `research.md` using格式：Decision / Rationale / Alternatives，並將仍須實驗的項目標註。

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - 定義 DemoAsset、PreviewState、AccessibilityHint 之欄位
   - 建立簡單狀態圖（列表 → 預覽 → 降階/返回）
   - 量測指標、fps buffer 儲存方式

2. **Generate API contracts** from functional requirements:
   - 無遠端 API，改撰寫 `contracts/media-session.yaml` 描述前端模組介面（Local API）
   - 如果後續啟動 FastAPI 代理，再追加 REST 介面定義

3. **Generate contract tests** from contracts:
   - 以 TypeScript interface 檢核 MediaSessionAdapter、DemoAssetLoader 行為
   - Playwright smoke 測試腳本預先標記 TODO，確保 TDD 順序

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally**:
   - 執行 `.specify/scripts/bash/update-agent-context.sh copilot`
   - 記錄新增技術：MediaPipe Tasks Web、Vite、Playwright Visual Regression
   - 保持檔案低於 150 行並保留人工段落

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- 依據 `media-session.yaml` 建立對應 TypeScript 介面測試（單元）與 Playwright smoke（桌機/手機 profile）。
- 針對 `DemoAsset`、`PreviewState`、`AccessibilityHint` 建立資料建置與 validator 任務。
- 每個示範資產對應一個視覺回歸任務（眼鏡、彩妝、鞋款）。
- 建立性能監控任務（fps、latency JSON export）與 Lighthouse 腳本執行任務。
- 無後端情境下仍保留 FastAPI 代理任務（條件式，標記可選）。

**Ordering Strategy**:
- Setup → 單元測試（Vitest）→ Playwright 視覺/煙霧 → 性能量測 → UI 元件建置 → 靜態部署腳本。
- 標記可平行執行的任務（例如不同資產的視覺回歸）。

**Estimated Output**: 約 18-22 個任務，依資產/測試類別分類。

**IMPORTANT**: 任務列表將由 `/tasks` 指令生成，/plan 僅描述策略。

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution（`/tasks` 生成 tasks.md，確認 Principle 對應與依賴圖）  
**Phase 4**: Implementation（依 tasks.md 順序完成、維持 90%+ 測試覆蓋、保留 Demo 錄影）  
**Phase 5**: Validation（Playwright 全端、Lighthouse、WCAG 檢核、錄製 Demo 上傳至 `docs/demos/`）

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _None_ | — | — |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `/.specify/memory/constitution.md`*

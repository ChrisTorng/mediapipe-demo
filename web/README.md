# XR 虛擬試戴體驗網站

本專案使用 Vite + React + TypeScript 以及 Google MediaPipe Tasks Web 建置最小化 XR 試戴展示。

## 開發指令
- `cd web`
- `npm install`：安裝相依套件與 MediaPipe 模型資產。
- `npm run dev`：啟動開發伺服器。
- `npm run lint`：執行 ESLint 資訊安全與品質檢查。
- `npm run test:unit`：執行 Vitest 單元與契約測試。
- `npm run test:e2e`：執行 Playwright 煙霧、視覺測試。
- `npm run test:perf`：執行 Lighthouse/性能檢查腳本。

## 可選 FastAPI Proxy

開發環境若無法直接存取 MediaPipe WASM 資產，可啟用 FastAPI 代理：

1. 啟動 FastAPI 代理伺服器：
   ```bash
   uvicorn server.app:app --host 0.0.0.0 --port 8000
   ```
2. 在啟動 Vite 前設定環境變數：
   ```bash
   export VITE_ENABLE_FASTAPI_PROXY=true
   export VITE_FASTAPI_TARGET=http://localhost:8000
   ```

Vite 將自動將 `/mediapipe` 路徑轉送至 FastAPI 代理。

## 指標匯出

`npm run test:perf` 會呼叫 `web/scripts/metrics/export-session-metrics.ts`，將最新 `rollingFps` 與 `latencyMs` 匯出至 `docs/demos/perf/session-metrics.json`，供驗證與文件引用。

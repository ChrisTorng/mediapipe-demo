# Quickstart: XR 虛擬試戴體驗網站 Demo

## 1. 先決條件
- Node.js 20 LTS（包含 npm）
- 可使用鏡頭的桌機或手機（Chrome/Safari/Edge 最新版）
- 若要執行備援 FastAPI 代理：Python 3.12 + `pipx`

## 2. 安裝與啟動（前端）
```bash
npm install
npm run dev
```
- 預設會在 `http://localhost:5173` 提供靜態開發伺服器。
- 首次載入時允許鏡頭權限；若拒絕可改用「上傳照片」流程。

## 3. 執行自動化檢查
```bash
npm run lint
npm run test:unit
npm run test:e2e
npm run test:perf
```
- `test:e2e` 會以 Playwright 模擬 desktop/mobile viewport，並驗證三項示範資產載入。
- `test:perf` 呼叫 Lighthouse 腳本，檢驗 p95 延遲與 fps 門檻。

## 4. FastAPI 靜態代理（僅必要時）
當環境無法直接串流 MediaPipe WASM 資源時，啟動 FastAPI：
```bash
pipx run fastapi-cli dev server/app.py --reload
```
- 代理僅轉發 `/mediapipe` 靜態檔案，主要前端仍由 Vite 服務。

## 5. 體驗流程
1. 進入首頁，選擇眼鏡／彩妝／鞋款任一示範資產。
2. 允許鏡頭後，確認 overlay 已套用並可於 200 ms 內更新。
3. 於裝置無鏡頭時，開啟上傳模式並載入示範照片。
4. 透過鍵盤（左右鍵）或觸控手勢切換資產，確認螢幕閱讀器朗讀提示。
5. 開啟開發者工具觀察 `Performance` overlay，應顯示 ≥45 fps。

## 6. 發布
- `npm run build` 產生 `/dist` 靜態檔案，可部署至 Netlify、GitHub Pages。
- 若啟用 FastAPI 代理，使用 `uvicorn server.app:app --host 0.0.0.0 --port 8000` 併發 1 worker 即可支援示範。

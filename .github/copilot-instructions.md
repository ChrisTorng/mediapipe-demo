# mediapipe-demo Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-27

## Active Technologies
- TypeScript 5.x（若需後端則使用 Python 3.12 + FastAPI） + Google MediaPipe Tasks API for Web、Vite、Playwright、Vitest (001-xr)

## Project Structure
```
web/
├── public/
├── src/
│   ├── components/
│   ├── mediapipe/
│   ├── hooks/
│   ├── scenes/
│   └── utils/
└── tests/
	├── unit/
	├── visual/
	└── smoke/

docs/
└── demos/

scripts/
└── lighthouse/

server/ (optional FastAPI proxy)
```

## Commands
```bash
npm install
npm run lint
npm run test:unit
npm run test:e2e
npm run test:perf
```

## Code Style
TypeScript 5.x（若需後端則使用 Python 3.12 + FastAPI）: Follow standard conventions

## Recent Changes
- 001-xr: Added TypeScript 5.x（若需後端則使用 Python 3.12 + FastAPI） + Google MediaPipe Tasks API for Web、Vite、Playwright、Vitest

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
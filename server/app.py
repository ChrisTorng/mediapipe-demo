from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_ROOT = BASE_DIR / "web" / "public" / "mediapipe"

app = FastAPI(title="XR Demo MediaPipe Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"]
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/mediapipe/{resource:path}")
def proxy_mediapipe(resource: str) -> FileResponse:
    file_path = (MEDIA_ROOT / resource).resolve()

    if not file_path.is_file() or MEDIA_ROOT not in file_path.parents:
        raise HTTPException(status_code=404, detail="Resource not found")

    return FileResponse(file_path)


@app.get("/")
def index() -> dict[str, Optional[str]]:
    return {
        "message": "MediaPipe proxy is running",
        "media_root": str(MEDIA_ROOT),
    }

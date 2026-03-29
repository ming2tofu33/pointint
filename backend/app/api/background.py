from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image

from app.services.background import remove_background

router = APIRouter()

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_RESOLUTION = 4096
MIN_RESOLUTION = 16


@router.post("/remove-background")
async def api_remove_background(file: UploadFile = File(...)):
    """이미지 업로드 → 배경 제거 → 투명 PNG 반환."""

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. PNG, JPG, WebP only.",
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10MB limit.",
        )

    try:
        img = Image.open(BytesIO(image_bytes))
        w, h = img.size
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file.",
        )

    if w > MAX_RESOLUTION or h > MAX_RESOLUTION:
        raise HTTPException(
            status_code=400,
            detail=f"Image resolution exceeds {MAX_RESOLUTION}x{MAX_RESOLUTION} limit.",
        )

    if w < MIN_RESOLUTION or h < MIN_RESOLUTION:
        raise HTTPException(
            status_code=400,
            detail=f"Image resolution must be at least {MIN_RESOLUTION}x{MIN_RESOLUTION}.",
        )

    result_bytes = remove_background(image_bytes)

    return Response(
        content=result_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "inline; filename=removed_bg.png"},
    )

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.background import remove_background

router = APIRouter()

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/remove-background")
async def api_remove_background(file: UploadFile = File(...)):
    """이미지 업로드 → 배경 제거 → 투명 PNG 반환."""

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 파일 형식입니다. PNG, JPG, WebP만 가능합니다.",
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="파일 크기가 10MB를 초과합니다.",
        )

    result_bytes = remove_background(image_bytes)

    return Response(
        content=result_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "inline; filename=removed_bg.png"},
    )

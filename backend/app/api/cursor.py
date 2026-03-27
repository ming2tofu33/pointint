from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.cursor import create_cur

router = APIRouter()


@router.post("/generate-cursor")
async def api_generate_cursor(
    file: UploadFile = File(...),
    hotspot_x: int = Form(0),
    hotspot_y: int = Form(0),
):
    """투명 PNG → .cur 파일 생성."""

    if file.content_type not in {"image/png"}:
        raise HTTPException(
            status_code=400,
            detail="PNG 파일만 가능합니다. 먼저 배경 제거를 진행해주세요.",
        )

    image_bytes = await file.read()
    cur_bytes = create_cur(image_bytes, hotspot_x, hotspot_y)

    return Response(
        content=cur_bytes,
        media_type="application/octet-stream",
        headers={"Content-Disposition": "attachment; filename=cursor.cur"},
    )

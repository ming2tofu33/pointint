from fastapi import APIRouter, File, Form, UploadFile

from app.services.health import check_cursor_health

router = APIRouter()


@router.post("/cursor-health")
async def api_cursor_health(
    file: UploadFile = File(...),
    hotspot_x: int = Form(0),
    hotspot_y: int = Form(0),
):
    """커서 이미지의 품질을 검사."""
    image_bytes = await file.read()
    return check_cursor_health(image_bytes, hotspot_x, hotspot_y)

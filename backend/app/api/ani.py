from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.ani import gif_to_ani_bytes

router = APIRouter()


@router.post("/generate-ani")
async def api_generate_ani(
    file: UploadFile = File(...),
    hotspot_x: int = Form(0),
    hotspot_y: int = Form(0),
    cursor_size: int = Form(32),
    cursor_name: str = Form("cursor"),
    fit_mode: str = Form("contain"),
    scale: float = Form(1.0),
    offset_x: int = Form(0),
    offset_y: int = Form(0),
):
    if file.content_type != "image/gif":
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. GIF only.",
        )

    safe_name = "".join(c for c in cursor_name if c.isalnum() or c in "-_ ").strip()
    if not safe_name:
        safe_name = "cursor"

    gif_bytes = await file.read()

    try:
        ani_bytes = gif_to_ani_bytes(
            gif_bytes,
            hotspot_x=hotspot_x,
            hotspot_y=hotspot_y,
            cursor_size=cursor_size,
            fit_mode=fit_mode,
            scale=scale,
            offset_x=offset_x,
            offset_y=offset_y,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return Response(
        content=ani_bytes,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename=pointint-{safe_name}.ani"
        },
    )

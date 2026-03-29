import zipfile
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.cursor import create_cur
from app.services.inf import generate_install_inf, generate_restore_inf

router = APIRouter()


@router.post("/generate-cursor")
async def api_generate_cursor(
    file: UploadFile = File(...),
    hotspot_x: int = Form(0),
    hotspot_y: int = Form(0),
    cursor_size: int = Form(32),
    cursor_name: str = Form("cursor"),
):
    """투명 PNG → .cur + .inf → zip 패키지 생성."""

    if file.content_type not in {"image/png"}:
        raise HTTPException(
            status_code=400,
            detail="PNG 파일만 가능합니다. 먼저 배경 제거를 진행해주세요.",
        )

    if cursor_size not in (32, 48, 64):
        raise HTTPException(
            status_code=400,
            detail="Cursor size must be 32, 48, or 64.",
        )

    # 파일명에서 위험 문자 제거
    safe_name = "".join(c for c in cursor_name if c.isalnum() or c in "-_ ").strip()
    if not safe_name:
        safe_name = "cursor"

    image_bytes = await file.read()

    cursor_filename = f"{safe_name}.cur"
    cur_bytes = create_cur(image_bytes, hotspot_x, hotspot_y, size=cursor_size)
    install_inf = generate_install_inf(cursor_filename)
    restore_inf = generate_restore_inf()

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(cursor_filename, cur_bytes)
        zf.writestr("install.inf", install_inf)
        zf.writestr("restore-default.inf", restore_inf)

    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=pointint-{safe_name}.zip"
        },
    )

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
):
    """투명 PNG → .cur + .inf → zip 패키지 생성."""

    if file.content_type not in {"image/png"}:
        raise HTTPException(
            status_code=400,
            detail="PNG 파일만 가능합니다. 먼저 배경 제거를 진행해주세요.",
        )

    image_bytes = await file.read()

    cursor_filename = "cursor.cur"
    cur_bytes = create_cur(image_bytes, hotspot_x, hotspot_y)
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
            "Content-Disposition": "attachment; filename=pointint-cursor.zip"
        },
    )

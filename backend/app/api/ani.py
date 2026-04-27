from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.ani import (
    gif_to_ani_bytes,
    image_sequence_to_ani_bytes,
    image_sequence_to_gif_bytes,
)

router = APIRouter()

SEQUENCE_FRAME_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
}
MAX_SEQUENCE_FRAMES = 64
MAX_SEQUENCE_FRAME_BYTES = 8 * 1024 * 1024
MAX_SEQUENCE_TOTAL_BYTES = 64 * 1024 * 1024


def _safe_attachment_name(cursor_name: str, extension: str = "ani") -> str:
    safe_name = "".join(
        c for c in cursor_name if c.isascii() and (c.isalnum() or c in "-_ ")
    ).strip()
    if not safe_name:
        safe_name = "cursor"
    return f"pointint-{safe_name}.{extension}"


def _ani_response(ani_bytes: bytes, cursor_name: str) -> Response:
    attachment_name = _safe_attachment_name(cursor_name)
    return Response(
        content=ani_bytes,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={attachment_name}"},
    )


def _gif_response(gif_bytes: bytes, cursor_name: str) -> Response:
    attachment_name = _safe_attachment_name(cursor_name, "gif")
    return Response(
        content=gif_bytes,
        media_type="image/gif",
        headers={"Content-Disposition": f"attachment; filename={attachment_name}"},
    )


def _validate_sequence_frame_count(frames: list[UploadFile]) -> None:
    if len(frames) > MAX_SEQUENCE_FRAMES:
        raise HTTPException(
            status_code=400,
            detail=f"Image sequence supports up to {MAX_SEQUENCE_FRAMES} frames.",
        )


def _validate_sequence_frame_content_type(frame: UploadFile, index: int) -> None:
    content_type = (frame.content_type or "").split(";", 1)[0].strip().lower()
    if content_type not in SEQUENCE_FRAME_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported frame content type at index {index}. "
                "Use PNG, JPG, or WebP image frames."
            ),
        )


async def _read_sequence_frames(frames: list[UploadFile]) -> list[bytes]:
    frame_bytes: list[bytes] = []
    total_bytes = 0

    for index, frame in enumerate(frames):
        _validate_sequence_frame_content_type(frame, index)
        remaining_total = MAX_SEQUENCE_TOTAL_BYTES - total_bytes
        if remaining_total <= 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Image sequence uploads may total up to "
                    f"{MAX_SEQUENCE_TOTAL_BYTES} bytes."
                ),
            )

        read_limit = min(MAX_SEQUENCE_FRAME_BYTES, remaining_total) + 1
        data = await frame.read(read_limit)
        if len(data) > MAX_SEQUENCE_FRAME_BYTES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Each image sequence frame may be up to "
                    f"{MAX_SEQUENCE_FRAME_BYTES} bytes."
                ),
            )

        total_bytes += len(data)
        if total_bytes > MAX_SEQUENCE_TOTAL_BYTES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Image sequence uploads may total up to "
                    f"{MAX_SEQUENCE_TOTAL_BYTES} bytes."
                ),
            )

        frame_bytes.append(data)

    return frame_bytes


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
    rotation: int = Form(0),
    flip_x: bool = Form(False),
    flip_y: bool = Form(False),
):
    if file.content_type != "image/gif":
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. GIF only.",
        )

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
            rotation=rotation,
            flip_x=flip_x,
            flip_y=flip_y,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return _ani_response(ani_bytes, cursor_name)


@router.post("/generate-ani-sequence")
async def api_generate_ani_sequence(
    frames: list[UploadFile] = File(...),
    duration_ms: int = Form(100),
    frame_durations_ms: list[int] | None = Form(None),
    hotspot_x: int = Form(0),
    hotspot_y: int = Form(0),
    cursor_size: int = Form(32),
    cursor_name: str = Form("cursor"),
    fit_mode: str = Form("contain"),
    scale: float = Form(1.0),
    offset_x: int = Form(0),
    offset_y: int = Form(0),
    rotation: int = Form(0),
    flip_x: bool = Form(False),
    flip_y: bool = Form(False),
):
    _validate_sequence_frame_count(frames)
    frame_bytes = await _read_sequence_frames(frames)

    try:
        ani_bytes = image_sequence_to_ani_bytes(
            frame_bytes,
            hotspot_x=hotspot_x,
            hotspot_y=hotspot_y,
            cursor_size=cursor_size,
            fit_mode=fit_mode,
            scale=scale,
            offset_x=offset_x,
            offset_y=offset_y,
            rotation=rotation,
            flip_x=flip_x,
            flip_y=flip_y,
            duration_ms=duration_ms,
            frame_durations_ms=frame_durations_ms,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return _ani_response(ani_bytes, cursor_name)


@router.post("/generate-gif-sequence")
async def api_generate_gif_sequence(
    frames: list[UploadFile] = File(...),
    duration_ms: int = Form(100),
    frame_durations_ms: list[int] | None = Form(None),
    cursor_size: int = Form(32),
    cursor_name: str = Form("cursor"),
    fit_mode: str = Form("contain"),
    scale: float = Form(1.0),
    offset_x: int = Form(0),
    offset_y: int = Form(0),
    rotation: int = Form(0),
    flip_x: bool = Form(False),
    flip_y: bool = Form(False),
):
    _validate_sequence_frame_count(frames)
    frame_bytes = await _read_sequence_frames(frames)

    try:
        gif_bytes = image_sequence_to_gif_bytes(
            frame_bytes,
            cursor_size=cursor_size,
            fit_mode=fit_mode,
            scale=scale,
            offset_x=offset_x,
            offset_y=offset_y,
            rotation=rotation,
            flip_x=flip_x,
            flip_y=flip_y,
            duration_ms=duration_ms,
            frame_durations_ms=frame_durations_ms,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return _gif_response(gif_bytes, cursor_name)

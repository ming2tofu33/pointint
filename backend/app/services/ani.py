"""Minimal GIF-to-ANI helpers for Pointint."""

from __future__ import annotations

import math
import struct
from dataclasses import dataclass
from io import BytesIO
from typing import Iterable

from PIL import Image, ImageSequence

from app.services.cursor import create_cur

DEFAULT_FRAME_DURATION_MS = 100
CURSOR_SIZE_CHOICES = {32, 48, 64}
FIT_MODE_CHOICES = {"contain", "cover"}
EDITOR_VIEWPORT_SIZE = 256
ANI_FLAGS_ICON = 0x00000001
ANI_FLAGS_SEQUENCE = 0x00000002


@dataclass(frozen=True)
class AniFrame:
    image: Image.Image
    duration_ms: int


@dataclass(frozen=True)
class AniCursorFrame:
    cur_bytes: bytes
    duration_ms: int


def extract_gif_frames(gif_bytes: bytes, max_frames: int | None = None) -> list[AniFrame]:
    gif = Image.open(BytesIO(gif_bytes))
    if gif.format != "GIF":
        raise ValueError("Unsupported file type. GIF only.")

    fallback_duration = int(gif.info.get("duration", DEFAULT_FRAME_DURATION_MS))
    fallback_duration = max(1, fallback_duration)

    frames: list[AniFrame] = []
    for index, frame in enumerate(ImageSequence.Iterator(gif)):
        if max_frames is not None and index >= max_frames:
            break

        image = frame.copy().convert("RGBA")
        duration = int(frame.info.get("duration", fallback_duration))
        frames.append(AniFrame(image=image, duration_ms=max(1, duration)))

    if not frames:
        raise ValueError("GIF must contain at least one frame.")

    return frames


def extract_gif_frames_to_cursors(
    gif_bytes: bytes,
    hotspot_x: int = 0,
    hotspot_y: int = 0,
    cursor_size: int = 32,
    max_frames: int | None = None,
) -> list[AniCursorFrame]:
    return [
        AniCursorFrame(
            cur_bytes=_frame_image_to_cur(
                frame.image,
                hotspot_x=hotspot_x,
                hotspot_y=hotspot_y,
                cursor_size=cursor_size,
            ),
            duration_ms=frame.duration_ms,
        )
        for frame in extract_gif_frames(gif_bytes, max_frames=max_frames)
    ]


def create_ani(
    frames: Iterable[AniFrame],
    hotspot_x: int = 0,
    hotspot_y: int = 0,
    size: int = 32,
    fit_mode: str = "contain",
    scale: float = 1.0,
    offset_x: int = 0,
    offset_y: int = 0,
) -> bytes:
    cursor_frames = [
        AniCursorFrame(
            cur_bytes=_frame_image_to_cur(
                frame.image,
                hotspot_x=hotspot_x,
                hotspot_y=hotspot_y,
                cursor_size=size,
                fit_mode=fit_mode,
                scale=scale,
                offset_x=offset_x,
                offset_y=offset_y,
            ),
            duration_ms=frame.duration_ms,
        )
        for frame in frames
    ]
    return write_ani_bytes(cursor_frames)


def write_ani_bytes(frames: Iterable[AniCursorFrame]) -> bytes:
    frames = list(frames)
    if not frames:
        raise ValueError("ANI requires at least one frame.")

    width, height = _read_cur_canvas_size(frames[0].cur_bytes)
    durations = [max(1, frame.duration_ms) for frame in frames]
    rates = [_duration_to_jiffies(duration) for duration in durations]
    default_rate = max(1, _duration_to_jiffies(sum(durations) // len(durations)))

    anih_data = struct.pack(
        "<9I",
        36,
        len(frames),
        len(frames),
        width,
        height,
        32,
        1,
        default_rate,
        ANI_FLAGS_ICON | ANI_FLAGS_SEQUENCE,
    )

    chunks = [
        _chunk(b"anih", anih_data),
        _chunk(b"rate", struct.pack(f"<{len(rates)}I", *rates)),
        _chunk(b"seq ", struct.pack(f"<{len(frames)}I", *range(len(frames)))),
        _list_chunk(
            b"fram",
            b"".join(_chunk(b"icon", frame.cur_bytes) for frame in frames),
        ),
    ]
    return _riff_file(b"ACON", b"".join(chunks))


def gif_to_ani_bytes(
    gif_bytes: bytes,
    hotspot_x: int = 0,
    hotspot_y: int = 0,
    cursor_size: int = 32,
    fit_mode: str = "contain",
    scale: float = 1.0,
    offset_x: int = 0,
    offset_y: int = 0,
    max_frames: int | None = None,
) -> bytes:
    frames = extract_gif_frames(gif_bytes, max_frames=max_frames)
    return create_ani(
        frames=frames,
        hotspot_x=hotspot_x,
        hotspot_y=hotspot_y,
        size=cursor_size,
        fit_mode=fit_mode,
        scale=scale,
        offset_x=offset_x,
        offset_y=offset_y,
    )


def _frame_image_to_cur(
    image: Image.Image,
    hotspot_x: int,
    hotspot_y: int,
    cursor_size: int,
    fit_mode: str = "contain",
    scale: float = 1.0,
    offset_x: int = 0,
    offset_y: int = 0,
) -> bytes:
    if cursor_size not in CURSOR_SIZE_CHOICES:
        raise ValueError("Cursor size must be 32, 48, or 64.")

    if fit_mode not in FIT_MODE_CHOICES:
        raise ValueError("Fit mode must be 'contain' or 'cover'.")

    if scale <= 0:
        raise ValueError("Scale must be greater than 0.")

    image = _render_frame_image(
        image,
        cursor_size=cursor_size,
        fit_mode=fit_mode,
        scale=scale,
        offset_x=offset_x,
        offset_y=offset_y,
    )

    png_buffer = BytesIO()
    image.save(png_buffer, format="PNG")
    return create_cur(
        png_buffer.getvalue(),
        hotspot_x=hotspot_x,
        hotspot_y=hotspot_y,
        size=cursor_size,
    )


def _render_frame_image(
    image: Image.Image,
    cursor_size: int,
    fit_mode: str,
    scale: float,
    offset_x: int,
    offset_y: int,
    editor_viewport_size: int = EDITOR_VIEWPORT_SIZE,
) -> Image.Image:
    safe_width = max(image.width, 1)
    safe_height = max(image.height, 1)
    base_scale = (
        max(cursor_size / safe_width, cursor_size / safe_height)
        if fit_mode == "cover"
        else min(cursor_size / safe_width, cursor_size / safe_height)
    )
    draw_width = max(1, round(safe_width * base_scale * scale))
    draw_height = max(1, round(safe_height * base_scale * scale))
    offset_scale = cursor_size / max(editor_viewport_size, 1)
    draw_x = round((cursor_size - draw_width) / 2 + offset_x * offset_scale)
    draw_y = round((cursor_size - draw_height) / 2 + offset_y * offset_scale)

    canvas = Image.new("RGBA", (cursor_size, cursor_size), (0, 0, 0, 0))
    resized = image.resize((draw_width, draw_height), Image.LANCZOS)
    canvas.paste(resized, (draw_x, draw_y), resized)
    return canvas


def _duration_to_jiffies(duration_ms: int) -> int:
    return max(1, math.ceil(duration_ms * 60 / 1000))


def _read_cur_canvas_size(cur_bytes: bytes) -> tuple[int, int]:
    width, height, _, _, _, _, _, _ = struct.unpack("<BBBBHHII", cur_bytes[6:22])
    return width or 256, height or 256


def _chunk(fourcc: bytes, data: bytes) -> bytes:
    if len(fourcc) != 4:
        raise ValueError("Chunk ids must be four bytes.")

    payload = fourcc + struct.pack("<I", len(data)) + data
    if len(data) % 2 == 1:
        payload += b"\x00"
    return payload


def _list_chunk(list_type: bytes, data: bytes) -> bytes:
    return _chunk(b"LIST", list_type + data)


def _riff_file(form_type: bytes, chunks: bytes) -> bytes:
    if len(form_type) != 4:
        raise ValueError("RIFF form types must be four bytes.")

    payload = form_type + chunks
    return b"RIFF" + struct.pack("<I", len(payload)) + payload

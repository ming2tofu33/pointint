import struct
from io import BytesIO

import pytest
from httpx import ASGITransport, AsyncClient
from PIL import Image, ImageSequence

from app.main import app
from app.services import ani as ani_service
from app.services.ani import create_ani, extract_gif_frames


def _make_test_gif() -> bytes:
    frame1 = Image.new("RGBA", (24, 24), (255, 0, 0, 255))
    frame2 = Image.new("RGBA", (24, 24), (0, 0, 255, 255))
    buffer = BytesIO()
    frame1.save(
      buffer,
      format="GIF",
      save_all=True,
      append_images=[frame2],
      duration=[100, 200],
      loop=0,
      disposal=2,
    )
    return buffer.getvalue()


def _make_test_png(color: tuple[int, int, int], mode: str = "RGB") -> bytes:
    image = Image.new(mode, (24, 24), color)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _read_ani_rates(ani: bytes) -> list[int]:
    offset = ani.find(b"rate")
    assert offset != -1
    size = struct.unpack("<I", ani[offset + 4 : offset + 8])[0]
    payload = ani[offset + 8 : offset + 8 + size]
    return list(struct.unpack(f"<{size // 4}I", payload))


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


def test_extract_gif_frames_reads_rgba_frames_and_durations():
    frames = extract_gif_frames(_make_test_gif(), max_frames=10)

    assert len(frames) == 2
    assert frames[0].image.mode == "RGBA"
    assert frames[1].image.mode == "RGBA"
    assert frames[0].duration_ms == 100
    assert frames[1].duration_ms == 200


def test_extract_gif_frames_applies_frame_cap():
    frames = extract_gif_frames(_make_test_gif(), max_frames=1)

    assert len(frames) == 1
    assert frames[0].duration_ms == 100


def test_create_ani_builds_riff_acon_file():
    frames = extract_gif_frames(_make_test_gif(), max_frames=10)

    ani = create_ani(
        frames=frames,
        hotspot_x=4,
        hotspot_y=5,
        size=32,
        fit_mode="contain",
        scale=1.0,
        offset_x=0,
        offset_y=0,
    )

    assert ani[:4] == b"RIFF"
    assert ani[8:12] == b"ACON"
    assert b"anih" in ani
    assert b"rate" in ani
    assert b"LIST" in ani
    assert b"fram" in ani
    assert ani.count(b"icon") == 2


def test_create_ani_rejects_empty_frame_sequence():
    with pytest.raises(ValueError):
        create_ani(
            frames=[],
            hotspot_x=0,
            hotspot_y=0,
            size=32,
            fit_mode="contain",
            scale=1.0,
            offset_x=0,
            offset_y=0,
        )


def test_image_sequence_to_ani_bytes_creates_ani_from_two_png_frames():
    ani = ani_service.image_sequence_to_ani_bytes(
        [
            _make_test_png((255, 0, 0)),
            _make_test_png((0, 0, 255)),
        ]
    )

    assert ani[:4] == b"RIFF"
    assert ani[8:12] == b"ACON"
    assert b"anih" in ani
    assert b"rate" in ani
    assert b"LIST" in ani
    assert b"fram" in ani
    assert ani.count(b"icon") == 2


def test_image_sequence_to_ani_bytes_preserves_per_frame_durations():
    ani = ani_service.image_sequence_to_ani_bytes(
        [
            _make_test_png((255, 0, 0)),
            _make_test_png((0, 0, 255)),
        ],
        frame_durations_ms=[40, 125],
    )

    assert _read_ani_rates(ani) == [3, 8]


def test_image_sequence_to_gif_bytes_preserves_per_frame_durations():
    gif = ani_service.image_sequence_to_gif_bytes(
        [
            _make_test_png((255, 0, 0)),
            _make_test_png((0, 0, 255)),
        ],
        frame_durations_ms=[40, 130],
    )

    with Image.open(BytesIO(gif)) as image:
        frames = [frame.copy() for frame in ImageSequence.Iterator(image)]

    assert image.format == "GIF"
    assert len(frames) == 2
    assert [frame.info["duration"] for frame in frames] == [40, 130]


def test_render_frame_image_applies_rotation_and_flip_before_fitting():
    image = Image.new("RGBA", (4, 2), (0, 0, 0, 0))
    image.putpixel((0, 0), (255, 0, 0, 255))

    rendered = ani_service._render_frame_image(
        image,
        cursor_size=4,
        fit_mode="contain",
        scale=1,
        offset_x=0,
        offset_y=0,
        rotation=90,
        flip_x=True,
        flip_y=False,
    )

    assert rendered.size == (4, 4)
    assert rendered.getpixel((1, 0)) == (255, 0, 0, 255)
    assert rendered.getpixel((0, 0))[3] == 0


def test_image_sequence_to_ani_bytes_rejects_invalid_rotation():
    with pytest.raises(ValueError, match="Rotation"):
        ani_service.image_sequence_to_ani_bytes(
            [
                _make_test_png((255, 0, 0)),
                _make_test_png((0, 0, 255)),
            ],
            rotation=45,
        )


def test_image_sequence_to_ani_bytes_rejects_fewer_than_two_frames():
    with pytest.raises(ValueError, match="at least two frames"):
        ani_service.image_sequence_to_ani_bytes([_make_test_png((255, 0, 0))])


def test_image_sequence_to_ani_bytes_rejects_invalid_image_bytes():
    with pytest.raises(ValueError, match="Unsupported or invalid image frame"):
        ani_service.image_sequence_to_ani_bytes(
            [
                _make_test_png((255, 0, 0)),
                b"not an image",
            ]
        )


def test_image_sequence_to_ani_bytes_rejects_non_numeric_duration():
    with pytest.raises(ValueError, match="Frame duration must be a number"):
        ani_service.image_sequence_to_ani_bytes(
            [
                _make_test_png((255, 0, 0)),
                _make_test_png((0, 0, 255)),
            ],
            duration_ms="fast",
        )


def test_image_sequence_to_ani_bytes_rejects_duration_too_large_for_ani_rate():
    with pytest.raises(ValueError, match="Frame duration is too large"):
        ani_service.image_sequence_to_ani_bytes(
            [
                _make_test_png((255, 0, 0)),
                _make_test_png((0, 0, 255)),
            ],
            duration_ms=100_000_000_000_000,
        )


def test_image_sequence_to_ani_bytes_rejects_mismatched_frame_durations():
    with pytest.raises(ValueError, match="Frame duration count"):
        ani_service.image_sequence_to_ani_bytes(
            [
                _make_test_png((255, 0, 0)),
                _make_test_png((0, 0, 255)),
            ],
            frame_durations_ms=[100],
        )


@pytest.mark.anyio
async def test_generate_ani_route_returns_ani(client: AsyncClient):
    gif = _make_test_gif()
    res = await client.post(
        "/api/generate-ani",
        files={"file": ("cursor.gif", gif, "image/gif")},
        data={"hotspot_x": "4", "hotspot_y": "5", "cursor_size": "32"},
    )

    assert res.status_code == 200
    assert res.headers["content-type"] == "application/octet-stream"
    assert res.content[:4] == b"RIFF"
    assert res.content[8:12] == b"ACON"


@pytest.mark.anyio
async def test_generate_ani_route_rejects_non_gif(client: AsyncClient):
    png = Image.new("RGBA", (32, 32), "red")
    buffer = BytesIO()
    png.save(buffer, format="PNG")
    res = await client.post(
        "/api/generate-ani",
        files={"file": ("cursor.png", buffer.getvalue(), "image/png")},
        data={"hotspot_x": "0", "hotspot_y": "0"},
    )

    assert res.status_code == 400


@pytest.mark.anyio
async def test_generate_ani_route_sanitizes_non_ascii_cursor_name(
    client: AsyncClient,
):
    res = await client.post(
        "/api/generate-ani",
        files={"file": ("cursor.gif", _make_test_gif(), "image/gif")},
        data={"cursor_name": "고양이 cursor"},
    )

    assert res.status_code == 200
    assert (
        res.headers["content-disposition"]
        == "attachment; filename=pointint-cursor.ani"
    )


@pytest.mark.anyio
async def test_generate_ani_sequence_route_returns_ani(client: AsyncClient):
    res = await client.post(
        "/api/generate-ani-sequence",
        files=[
            ("frames", ("frame-1.png", _make_test_png((255, 0, 0)), "image/png")),
            ("frames", ("frame-2.png", _make_test_png((0, 0, 255)), "image/png")),
        ],
        data={
            "duration_ms": "125",
            "hotspot_x": "4",
            "hotspot_y": "5",
            "cursor_size": "32",
            "cursor_name": "sequence cursor",
            "fit_mode": "contain",
            "scale": "1",
            "offset_x": "0",
            "offset_y": "0",
        },
    )

    assert res.status_code == 200
    assert res.headers["content-type"] == "application/octet-stream"
    assert (
        res.headers["content-disposition"]
        == "attachment; filename=pointint-sequence cursor.ani"
    )
    assert res.content[:4] == b"RIFF"
    assert res.content[8:12] == b"ACON"
    assert res.content.count(b"icon") == 2


@pytest.mark.anyio
async def test_generate_ani_sequence_route_accepts_per_frame_durations(
    client: AsyncClient,
):
    res = await client.post(
        "/api/generate-ani-sequence",
        files=[
            ("frames", ("frame-1.png", _make_test_png((255, 0, 0)), "image/png")),
            ("frames", ("frame-2.png", _make_test_png((0, 0, 255)), "image/png")),
        ],
        data={"frame_durations_ms": ["40", "125"]},
    )

    assert res.status_code == 200
    assert _read_ani_rates(res.content) == [3, 8]


@pytest.mark.anyio
async def test_generate_gif_sequence_route_returns_gif_with_durations(
    client: AsyncClient,
):
    res = await client.post(
        "/api/generate-gif-sequence",
        files=[
            ("frames", ("frame-1.png", _make_test_png((255, 0, 0)), "image/png")),
            ("frames", ("frame-2.png", _make_test_png((0, 0, 255)), "image/png")),
        ],
        data={
            "cursor_name": "sequence cursor",
            "frame_durations_ms": ["40", "130"],
        },
    )

    assert res.status_code == 200
    assert res.headers["content-type"] == "image/gif"
    assert (
        res.headers["content-disposition"]
        == "attachment; filename=pointint-sequence cursor.gif"
    )
    with Image.open(BytesIO(res.content)) as image:
        frames = [frame.copy() for frame in ImageSequence.Iterator(image)]

    assert image.format == "GIF"
    assert len(frames) == 2
    assert [frame.info["duration"] for frame in frames] == [40, 130]


@pytest.mark.anyio
async def test_generate_ani_sequence_route_sanitizes_non_ascii_cursor_name(
    client: AsyncClient,
):
    res = await client.post(
        "/api/generate-ani-sequence",
        files=[
            ("frames", ("frame-1.png", _make_test_png((255, 0, 0)), "image/png")),
            ("frames", ("frame-2.png", _make_test_png((0, 0, 255)), "image/png")),
        ],
        data={"cursor_name": "고양이 cursor"},
    )

    assert res.status_code == 200
    assert (
        res.headers["content-disposition"]
        == "attachment; filename=pointint-cursor.ani"
    )


@pytest.mark.anyio
async def test_generate_ani_sequence_route_rejects_one_frame(client: AsyncClient):
    res = await client.post(
        "/api/generate-ani-sequence",
        files=[
            ("frames", ("frame-1.png", _make_test_png((255, 0, 0)), "image/png")),
        ],
        data={"duration_ms": "100"},
    )

    assert res.status_code == 400
    assert "at least two frames" in res.json()["detail"]


@pytest.mark.anyio
async def test_generate_ani_sequence_route_rejects_png_bytes_with_text_plain(
    client: AsyncClient,
):
    res = await client.post(
        "/api/generate-ani-sequence",
        files=[
            ("frames", ("frame-1.png", _make_test_png((255, 0, 0)), "image/png")),
            ("frames", ("frame-2.png", _make_test_png((0, 0, 255)), "text/plain")),
        ],
        data={"duration_ms": "100"},
    )

    assert res.status_code == 400
    assert "Unsupported frame content type" in res.json()["detail"]


@pytest.mark.anyio
async def test_generate_ani_sequence_route_rejects_non_image_frame(
    client: AsyncClient,
):
    res = await client.post(
        "/api/generate-ani-sequence",
        files=[
            ("frames", ("frame-1.png", _make_test_png((255, 0, 0)), "image/png")),
            ("frames", ("frame-2.png", b"not an image", "image/png")),
        ],
        data={"duration_ms": "100"},
    )

    assert res.status_code == 400
    assert "Unsupported or invalid image frame" in res.json()["detail"]


@pytest.mark.anyio
async def test_generate_ani_sequence_route_rejects_too_many_frames(
    client: AsyncClient,
):
    frame = _make_test_png((255, 0, 0))
    res = await client.post(
        "/api/generate-ani-sequence",
        files=[
            ("frames", (f"frame-{index}.png", frame, "image/png"))
            for index in range(65)
        ],
        data={"duration_ms": "100"},
    )

    assert res.status_code == 400
    assert "up to 64 frames" in res.json()["detail"]

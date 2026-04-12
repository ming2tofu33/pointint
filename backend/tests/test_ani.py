from io import BytesIO

import pytest
from httpx import ASGITransport, AsyncClient
from PIL import Image

from app.main import app
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

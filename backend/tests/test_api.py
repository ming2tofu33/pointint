"""Phase 1 API 엔드포인트 테스트."""

from io import BytesIO

import pytest
from httpx import ASGITransport, AsyncClient
from PIL import Image

from app.main import app


def _make_png(width: int = 64, height: int = 64, color: str = "red") -> bytes:
    """테스트용 PNG 생성."""
    img = Image.new("RGBA", (width, height), color)
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _make_jpg(width: int = 64, height: int = 64) -> bytes:
    """테스트용 JPG 생성."""
    img = Image.new("RGB", (width, height), "blue")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ============================================
# Health Check
# ============================================


@pytest.mark.anyio
async def test_health(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "pointint-api"


# ============================================
# Background Removal
# ============================================


@pytest.mark.anyio
async def test_remove_background_png(client: AsyncClient):
    png = _make_png()
    res = await client.post(
        "/api/remove-background",
        files={"file": ("test.png", png, "image/png")},
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "image/png"
    assert len(res.content) > 0

    # 결과가 유효한 PNG인지 확인
    result_img = Image.open(BytesIO(res.content))
    assert result_img.mode == "RGBA"


@pytest.mark.anyio
async def test_remove_background_jpg(client: AsyncClient):
    jpg = _make_jpg()
    res = await client.post(
        "/api/remove-background",
        files={"file": ("test.jpg", jpg, "image/jpeg")},
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "image/png"


@pytest.mark.anyio
async def test_remove_background_invalid_type(client: AsyncClient):
    res = await client.post(
        "/api/remove-background",
        files={"file": ("test.txt", b"hello", "text/plain")},
    )
    assert res.status_code == 400


# ============================================
# Cursor Generation
# ============================================


@pytest.mark.anyio
async def test_generate_cursor_basic(client: AsyncClient):
    png = _make_png(32, 32)
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("cursor.png", png, "image/png")},
        data={"hotspot_x": "0", "hotspot_y": "0"},
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/octet-stream"

    # .cur 파일 구조 검증
    cur = res.content
    assert len(cur) > 22  # 헤더(6) + 엔트리(16) + 데이터

    import struct

    reserved, type_val, count = struct.unpack("<HHH", cur[:6])
    assert reserved == 0
    assert type_val == 2  # cursor
    assert count == 1


@pytest.mark.anyio
async def test_generate_cursor_with_hotspot(client: AsyncClient):
    png = _make_png(32, 32)
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("cursor.png", png, "image/png")},
        data={"hotspot_x": "16", "hotspot_y": "16"},
    )
    assert res.status_code == 200

    import struct

    cur = res.content
    entry = cur[6:22]
    _, _, _, _, hx, hy = struct.unpack("<BBBBHH", entry[:8])
    assert hx == 16
    assert hy == 16


@pytest.mark.anyio
async def test_generate_cursor_rejects_non_png(client: AsyncClient):
    jpg = _make_jpg()
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("test.jpg", jpg, "image/jpeg")},
        data={"hotspot_x": "0", "hotspot_y": "0"},
    )
    assert res.status_code == 400

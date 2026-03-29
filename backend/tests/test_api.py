"""Phase 1 API 엔드포인트 테스트."""

import struct
import zipfile
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


@pytest.mark.anyio
async def test_remove_background_too_large_resolution(client: AsyncClient):
    png = _make_png(4097, 4097)
    res = await client.post(
        "/api/remove-background",
        files={"file": ("big.png", png, "image/png")},
    )
    assert res.status_code == 400
    assert "4096" in res.json()["detail"]


@pytest.mark.anyio
async def test_remove_background_too_small_resolution(client: AsyncClient):
    png = _make_png(8, 8)
    res = await client.post(
        "/api/remove-background",
        files={"file": ("tiny.png", png, "image/png")},
    )
    assert res.status_code == 400
    assert "16" in res.json()["detail"]


# ============================================
# Cursor Generation (zip)
# ============================================


@pytest.mark.anyio
async def test_generate_cursor_zip(client: AsyncClient):
    png = _make_png(32, 32)
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("cursor.png", png, "image/png")},
        data={"hotspot_x": "0", "hotspot_y": "0"},
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/zip"

    zf = zipfile.ZipFile(BytesIO(res.content))
    names = zf.namelist()
    assert "cursor.cur" in names
    assert "install.inf" in names
    assert "restore-default.inf" in names

    # .cur 파일 구조 검증
    cur = zf.read("cursor.cur")
    reserved, type_val, count = struct.unpack("<HHH", cur[:6])
    assert type_val == 2
    assert count == 1


@pytest.mark.anyio
async def test_generate_cursor_hotspot_in_zip(client: AsyncClient):
    png = _make_png(32, 32)
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("cursor.png", png, "image/png")},
        data={"hotspot_x": "16", "hotspot_y": "16"},
    )
    assert res.status_code == 200

    zf = zipfile.ZipFile(BytesIO(res.content))
    cur = zf.read("cursor.cur")
    entry = cur[6:22]
    _, _, _, _, hx, hy = struct.unpack("<BBBBHH", entry[:8])
    assert hx == 16
    assert hy == 16


@pytest.mark.anyio
async def test_generate_cursor_inf_content(client: AsyncClient):
    png = _make_png(32, 32)
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("cursor.png", png, "image/png")},
        data={"hotspot_x": "0", "hotspot_y": "0"},
    )

    zf = zipfile.ZipFile(BytesIO(res.content))

    install = zf.read("install.inf").decode("utf-8")
    assert "CHICAGO" in install
    assert "Arrow" in install
    assert "IBeam" in install
    assert "Hand" in install
    assert "\r\n" in install

    restore = zf.read("restore-default.inf").decode("utf-8")
    assert "Windows Default" in restore
    assert "\r\n" in restore


@pytest.mark.anyio
async def test_generate_cursor_rejects_non_png(client: AsyncClient):
    jpg = _make_jpg()
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("test.jpg", jpg, "image/jpeg")},
        data={"hotspot_x": "0", "hotspot_y": "0"},
    )
    assert res.status_code == 400


# ============================================
# Cursor Health Check
# ============================================


@pytest.mark.anyio
async def test_cursor_health_pass(client: AsyncClient):
    png = _make_png(32, 32)
    res = await client.post(
        "/api/cursor-health",
        files={"file": ("cursor.png", png, "image/png")},
        data={"hotspot_x": "16", "hotspot_y": "16"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["visibility"] == "pass"
    assert data["hotspot"] == "pass"
    assert data["readability"] in ("pass", "warn")
    assert isinstance(data["messages"], list)


@pytest.mark.anyio
async def test_cursor_health_transparent_hotspot(client: AsyncClient):
    # 완전 투명 이미지
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    buf = BytesIO()
    img.save(buf, format="PNG")
    png = buf.getvalue()

    res = await client.post(
        "/api/cursor-health",
        files={"file": ("cursor.png", png, "image/png")},
        data={"hotspot_x": "16", "hotspot_y": "16"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["hotspot"] == "warn"
    assert data["visibility"] == "fail"

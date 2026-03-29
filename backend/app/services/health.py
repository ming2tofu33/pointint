"""커서 건강 체크 — 가시성, Hotspot 유효성, 가독성."""

from io import BytesIO

from PIL import Image, ImageFilter


def check_cursor_health(
    image_bytes: bytes, hotspot_x: int = 0, hotspot_y: int = 0
) -> dict:
    """커서 이미지의 품질을 검사하고 결과를 반환."""
    img = Image.open(BytesIO(image_bytes))
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    results = {
        "visibility": _check_visibility(img),
        "hotspot": _check_hotspot(img, hotspot_x, hotspot_y),
        "readability": _check_readability(img),
        "messages": [],
    }

    if results["visibility"] == "warn":
        results["messages"].append(
            "Cursor may be hard to see on some backgrounds."
        )
    elif results["visibility"] == "fail":
        results["messages"].append(
            "Cursor is nearly invisible. Consider adding contrast."
        )

    if results["hotspot"] == "warn":
        results["messages"].append(
            "Hotspot is on a transparent area. It may feel off when clicking."
        )

    if results["readability"] == "warn":
        results["messages"].append(
            "Cursor may look too complex at 32px. Consider simplifying."
        )

    return results


def _check_visibility(img: Image.Image) -> str:
    """흰/검 배경 위에서 커서가 보이는지 검사."""
    alpha = img.getchannel("A")
    pixels = list(alpha.tobytes())
    total = len(pixels)

    if total == 0:
        return "fail"

    opaque_count = sum(1 for p in pixels if p > 128)
    opaque_ratio = opaque_count / total

    if opaque_ratio < 0.01:
        return "fail"
    if opaque_ratio < 0.05:
        return "warn"
    return "pass"


def _check_hotspot(img: Image.Image, x: int, y: int) -> str:
    """Hotspot 위치가 불투명 픽셀 위에 있는지 검사."""
    if x < 0 or y < 0 or x >= img.width or y >= img.height:
        return "warn"

    alpha = img.getchannel("A")
    alpha_value = alpha.getpixel((x, y))

    if alpha_value < 32:
        return "warn"
    return "pass"


def _check_readability(img: Image.Image) -> str:
    """32px로 축소했을 때 가독성 검사 (엣지 밀도 기준)."""
    small = img.resize((32, 32), Image.LANCZOS)
    gray = small.convert("L")
    edges = gray.filter(ImageFilter.FIND_EDGES)

    edge_pixels = list(edges.tobytes())
    total = len(edge_pixels)

    if total == 0:
        return "pass"

    high_edge_count = sum(1 for p in edge_pixels if p > 80)
    edge_ratio = high_edge_count / total

    if edge_ratio > 0.4:
        return "warn"
    return "pass"

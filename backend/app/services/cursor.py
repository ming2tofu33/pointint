"""Windows .cur 바이너리 생성.

.cur 파일 = ICO와 동일한 구조, hotspot 추가.
호환성을 위해 BMP(DIB) 형식으로 이미지 데이터를 저장한다.

구조:
  - 6바이트 파일 헤더 (reserved=0, type=2, count=1)
  - 16바이트 디렉토리 엔트리 (크기, hotspot, 데이터 오프셋)
  - BITMAPINFOHEADER (40바이트)
  - RGBA 픽셀 데이터 (bottom-up, XOR 비트맵)
  - AND 마스크 (1bpp, bottom-up)
"""

import struct
from io import BytesIO

from PIL import Image

CURSOR_SIZE = 32


def create_cur(
    image_bytes: bytes,
    hotspot_x: int = 0,
    hotspot_y: int = 0,
    size: int = CURSOR_SIZE,
) -> bytes:
    """투명 PNG를 .cur 바이너리로 변환."""
    img = Image.open(BytesIO(image_bytes))

    # RGBA 보장
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # 커서 크기로 리사이즈 (비율 유지, 정사각형 캔버스에 센터링)
    img = _fit_to_square(img, size)

    # Hotspot 범위 클램프
    hotspot_x = max(0, min(hotspot_x, size - 1))
    hotspot_y = max(0, min(hotspot_y, size - 1))

    # BMP(DIB) 데이터 생성
    xor_data, and_data = _make_bmp_data(img)

    # BITMAPINFOHEADER (40 bytes)
    # biHeight는 XOR + AND 합쳐서 2배
    bih = struct.pack(
        "<IiiHHIIiiII",
        40,            # biSize
        size,          # biWidth
        size * 2,      # biHeight (XOR + AND)
        1,             # biPlanes
        32,            # biBitCount (RGBA)
        0,             # biCompression (BI_RGB)
        len(xor_data) + len(and_data),  # biSizeImage
        0,             # biXPelsPerMeter
        0,             # biYPelsPerMeter
        0,             # biClrUsed
        0,             # biClrImportant
    )

    image_data = bih + xor_data + and_data
    data_offset = 6 + 16  # 파일 헤더 + 디렉토리 1개

    # 파일 헤더 (6 bytes)
    header = struct.pack("<HHH", 0, 2, 1)

    # 디렉토리 엔트리 (16 bytes)
    # 형식: width(B), height(B), colors(B), reserved(B),
    #       hotspot_x(H), hotspot_y(H), image_size(I), offset(I)
    entry = struct.pack(
        "<BBBBHHII",
        size if size < 256 else 0,  # 너비
        size if size < 256 else 0,  # 높이
        0,                          # 색상 수
        0,                          # reserved
        hotspot_x,                  # hotspot X
        hotspot_y,                  # hotspot Y
        len(image_data),            # 이미지 데이터 크기
        data_offset,                # 데이터 오프셋
    )

    return header + entry + image_data


def _fit_to_square(img: Image.Image, size: int) -> Image.Image:
    """이미지를 비율 유지하며 정사각형 캔버스에 맞춤."""
    img.thumbnail((size, size), Image.LANCZOS)

    if img.size == (size, size):
        return img

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset_x = (size - img.width) // 2
    offset_y = (size - img.height) // 2
    canvas.paste(img, (offset_x, offset_y))
    return canvas


def _make_bmp_data(img: Image.Image) -> tuple[bytes, bytes]:
    """RGBA 이미지에서 XOR 비트맵과 AND 마스크를 생성.

    BMP는 bottom-up이므로 행을 뒤집어야 한다.
    """
    w, h = img.size

    # XOR 비트맵: BGRA 순서, bottom-up
    pixels = img.load()
    xor_rows = []
    for y in range(h - 1, -1, -1):  # bottom-up
        row = bytearray()
        for x in range(w):
            r, g, b, a = pixels[x, y]
            row.extend([b, g, r, a])  # BGRA
        xor_rows.append(bytes(row))
    xor_data = b"".join(xor_rows)

    # AND 마스크: 1bpp, bottom-up
    # 투명(alpha=0) → 1, 불투명 → 0
    and_rows = []
    row_bytes = (w + 31) // 32 * 4  # 4바이트 정렬
    for y in range(h - 1, -1, -1):
        row = bytearray(row_bytes)
        for x in range(w):
            _, _, _, a = pixels[x, y]
            if a < 128:  # 투명 → AND 마스크 1
                byte_idx = x // 8
                bit_idx = 7 - (x % 8)
                row[byte_idx] |= (1 << bit_idx)
        and_rows.append(bytes(row))
    and_data = b"".join(and_rows)

    return xor_data, and_data

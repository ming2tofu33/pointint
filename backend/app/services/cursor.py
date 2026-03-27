import struct
from io import BytesIO

from PIL import Image


def create_cur(image_bytes: bytes, hotspot_x: int = 0, hotspot_y: int = 0) -> bytes:
    """투명 PNG를 .cur 바이너리로 변환.

    .cur 파일 구조:
    - 6바이트 헤더 (reserved, type=2, count)
    - 16바이트 디렉토리 엔트리 (크기, 색상, hotspot, 데이터 오프셋)
    - 이미지 데이터 (PNG 포맷으로 임베드)
    """
    img = Image.open(BytesIO(image_bytes))

    # 커서 규격으로 리사이즈 (최대 256x256, 기본 32x32)
    size = min(img.width, img.height, 256)
    if img.width != size or img.height != size:
        img = img.resize((size, size), Image.LANCZOS)

    # RGBA 보장
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # PNG로 이미지 데이터 생성
    png_buffer = BytesIO()
    img.save(png_buffer, format="PNG")
    png_data = png_buffer.getvalue()

    # Hotspot 범위 클램프
    hotspot_x = max(0, min(hotspot_x, img.width - 1))
    hotspot_y = max(0, min(hotspot_y, img.height - 1))

    # 파일 헤더 (6 bytes)
    # reserved: 0, type: 2 (cursor), count: 1
    header = struct.pack("<HHH", 0, 2, 1)

    # 디렉토리 엔트리 (16 bytes)
    width = img.width if img.width < 256 else 0  # 256은 0으로 인코딩
    height = img.height if img.height < 256 else 0
    data_offset = 6 + 16  # 헤더 + 디렉토리 1개

    entry = struct.pack(
        "<BBBBHHIH",
        width,          # 너비 (0 = 256)
        height,         # 높이 (0 = 256)
        0,              # 색상 수 (0 = 256 이상)
        0,              # reserved
        hotspot_x,      # hotspot X
        hotspot_y,      # hotspot Y
        len(png_data),  # 이미지 데이터 크기
        data_offset,    # 데이터 시작 오프셋
    )

    return header + entry + png_data

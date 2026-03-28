import os
from io import BytesIO

from PIL import Image
from rembg import new_session, remove


_session = None


def get_session():
    """BiRefNet 세션을 lazy-load로 초기화."""
    global _session
    if _session is None:
        model = os.getenv("REMBG_MODEL", "u2net")
        _session = new_session(model)
    return _session


def remove_background(image_bytes: bytes) -> bytes:
    """이미지에서 배경을 제거하고 투명 PNG로 반환."""
    input_image = Image.open(BytesIO(image_bytes))

    # RGBA로 변환 (JPG 등 알파 없는 포맷 대응)
    if input_image.mode != "RGBA":
        input_image = input_image.convert("RGBA")

    session = get_session()
    output_image = remove(input_image, session=session)

    output_buffer = BytesIO()
    output_image.save(output_buffer, format="PNG")
    return output_buffer.getvalue()

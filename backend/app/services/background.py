import os
from io import BytesIO

from gradio_client import Client, handle_file
from PIL import Image

HF_SPACE = os.getenv(
    "HF_SPACE_URL", "ming2tofu33/pointint-bg-removal"
)

_client = None


def get_client():
    """Gradio 클라이언트를 lazy-load로 초기화."""
    global _client
    if _client is None:
        _client = Client(HF_SPACE)
    return _client


def remove_background(image_bytes: bytes) -> bytes:
    """HuggingFace Space를 호출해서 배경을 제거하고 투명 PNG로 반환."""
    import tempfile

    # 임시 파일로 저장 (gradio_client가 파일 경로를 요구)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        # 입력 이미지를 PNG로 통일
        img = Image.open(BytesIO(image_bytes))
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        img.save(tmp, format="PNG")
        tmp_path = tmp.name

    try:
        client = get_client()
        result_path = client.predict(
            input_image=handle_file(tmp_path),
            api_name="/predict",
        )

        # 결과 파일 읽기
        result_img = Image.open(result_path)
        output_buffer = BytesIO()
        result_img.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    finally:
        os.unlink(tmp_path)

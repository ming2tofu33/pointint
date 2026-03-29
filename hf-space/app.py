"""Pointint Background Removal — HuggingFace Space (BiRefNet)."""

from io import BytesIO

import gradio as gr
from PIL import Image
from rembg import new_session, remove

print("Loading BiRefNet model...")
session = new_session("birefnet-general")
print("Model loaded.")


def remove_background(input_image):
    if input_image is None:
        return None

    if input_image.mode != "RGBA":
        input_image = input_image.convert("RGBA")

    output = remove(input_image, session=session)
    return output


demo = gr.Interface(
    fn=remove_background,
    inputs=gr.Image(type="pil", label="Input"),
    outputs=gr.Image(type="pil", label="Output"),
    title="poin+tint BG Removal",
    flagging_mode="never",
)

demo.launch()

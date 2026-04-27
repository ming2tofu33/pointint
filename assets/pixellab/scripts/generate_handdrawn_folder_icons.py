from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "raw" / "folder-icons"
SELECTED_DIR = ROOT / "selected" / "folder-icons"

SCALE = 4
CANVAS = 64

COLORS = {
    "outline": "#5e3b20",
    "outline_soft": "#8a5a2b",
    "folder_back": "#f7c64d",
    "folder_front": "#ffe17a",
    "folder_light": "#fff0a6",
    "folder_shadow": "#e7ad35",
    "cat": "#ffb44f",
    "cat_light": "#ffd483",
    "cat_cream": "#fff1c8",
    "stripe": "#9a5a1f",
    "ear": "#ff8aa2",
    "eye": "#2d2116",
    "nose": "#6a4024",
    "cheek": "#f18d4a",
}


def new_icon() -> Image.Image:
    return Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))


def polygon(draw: ImageDraw.ImageDraw, points, fill: str, outline: str = "outline", width: int = 1) -> None:
    draw.polygon(points, fill=fill)
    pts = list(points) + [points[0]]
    draw.line(pts, fill=COLORS[outline], width=width, joint="curve")


def draw_pixel_eye(draw: ImageDraw.ImageDraw, x: int, y: int, big: bool = False) -> None:
    if big:
        draw.ellipse((x, y, x + 5, y + 6), fill=COLORS["eye"])
        draw.point((x + 2, y + 1), fill="#fff7d8")
    else:
        draw.rectangle((x, y, x + 2, y + 3), fill=COLORS["eye"])


def draw_cat_mouth(draw: ImageDraw.ImageDraw, cx: int, cy: int) -> None:
    draw.polygon([(cx - 1, cy), (cx + 1, cy), (cx, cy + 1)], fill=COLORS["nose"])
    draw.line((cx, cy + 2, cx - 2, cy + 4), fill=COLORS["outline"], width=1)
    draw.line((cx, cy + 2, cx + 2, cy + 4), fill=COLORS["outline"], width=1)


def draw_tabby_marks(draw: ImageDraw.ImageDraw, cx: int, y: int) -> None:
    draw.line((cx - 4, y, cx - 2, y + 4, cx, y + 1, cx + 2, y + 4, cx + 4, y), fill=COLORS["stripe"], width=1)
    draw.line((cx - 15, y + 14, cx - 10, y + 16), fill=COLORS["stripe"], width=1)
    draw.line((cx - 15, y + 18, cx - 10, y + 19), fill=COLORS["stripe"], width=1)
    draw.line((cx + 10, y + 16, cx + 15, y + 14), fill=COLORS["stripe"], width=1)
    draw.line((cx + 10, y + 19, cx + 15, y + 18), fill=COLORS["stripe"], width=1)


def draw_folder_back(draw: ImageDraw.ImageDraw) -> None:
    polygon(
        draw,
        [(8, 22), (22, 22), (27, 27), (55, 27), (55, 51), (8, 51)],
        COLORS["folder_back"],
        width=2,
    )
    draw.rectangle((10, 25, 53, 31), fill=COLORS["folder_light"])


def draw_folder_front(draw: ImageDraw.ImageDraw, y: int = 31) -> None:
    polygon(
        draw,
        [(7, y), (57, y), (53, 57), (10, 57)],
        COLORS["folder_front"],
        width=2,
    )
    draw.polygon([(12, y + 2), (55, y + 2), (52, y + 8), (13, y + 8)], fill=COLORS["folder_light"])
    draw.line((10, 56, 53, 56), fill=COLORS["folder_shadow"], width=1)


def draw_cat_head(draw: ImageDraw.ImageDraw, cx: int, cy: int, tabby: bool = True, big_eyes: bool = True) -> None:
    # Ears first so the rounded head sits cleanly in front of them.
    polygon(draw, [(cx - 18, cy + 8), (cx - 12, cy - 9), (cx - 4, cy + 8)], COLORS["cat"], width=2)
    polygon(draw, [(cx + 4, cy + 8), (cx + 12, cy - 9), (cx + 18, cy + 8)], COLORS["cat"], width=2)
    polygon(draw, [(cx - 14, cy + 5), (cx - 12, cy - 3), (cx - 8, cy + 6)], COLORS["ear"], "outline_soft")
    polygon(draw, [(cx + 8, cy + 6), (cx + 12, cy - 3), (cx + 14, cy + 5)], COLORS["ear"], "outline_soft")

    draw.rounded_rectangle((cx - 18, cy + 2, cx + 18, cy + 32), radius=10, fill=COLORS["cat"], outline=COLORS["outline"], width=2)
    draw.pieslice((cx - 13, cy + 12, cx + 13, cy + 36), 0, 180, fill=COLORS["cat_cream"])

    if tabby:
        draw_tabby_marks(draw, cx, cy + 7)

    draw_pixel_eye(draw, cx - 11, cy + 16, big=big_eyes)
    draw_pixel_eye(draw, cx + 6, cy + 16, big=big_eyes)
    draw_cat_mouth(draw, cx, cy + 23)
    draw.point((cx - 18, cy + 21), fill=COLORS["cheek"])
    draw.point((cx + 18, cy + 21), fill=COLORS["cheek"])


def draw_paw(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    draw.rounded_rectangle((x, y, x + 6, y + 5), radius=2, fill=COLORS["cat_cream"], outline=COLORS["outline"], width=1)
    draw.point((x + 2, y + 2), fill=COLORS["outline_soft"])
    draw.point((x + 4, y + 2), fill=COLORS["outline_soft"])


def icon_peek_tabby() -> Image.Image:
    img = new_icon()
    draw = ImageDraw.Draw(img)
    draw_folder_back(draw)
    draw_cat_head(draw, 32, 17, tabby=True, big_eyes=True)
    draw_folder_front(draw, y=34)
    draw_paw(draw, 18, 31)
    draw_paw(draw, 40, 31)
    return img


def icon_hug_tabby() -> Image.Image:
    img = new_icon()
    draw = ImageDraw.Draw(img)
    draw_folder_back(draw)
    draw_folder_front(draw, y=30)
    draw_cat_head(draw, 32, 9, tabby=True, big_eyes=False)
    draw_paw(draw, 13, 34)
    draw_paw(draw, 45, 34)
    draw.line((18, 37, 10, 45), fill=COLORS["outline"], width=2)
    draw.line((46, 37, 54, 45), fill=COLORS["outline"], width=2)
    return img


def icon_face_folder_tabby() -> Image.Image:
    img = new_icon()
    draw = ImageDraw.Draw(img)
    draw_folder_back(draw)
    polygon(draw, [(10, 29), (16, 13), (23, 29)], COLORS["cat"], width=2)
    polygon(draw, [(41, 29), (48, 13), (54, 29)], COLORS["cat"], width=2)
    polygon(draw, [(14, 26), (16, 18), (20, 27)], COLORS["ear"], "outline_soft")
    polygon(draw, [(44, 27), (48, 18), (50, 26)], COLORS["ear"], "outline_soft")
    polygon(draw, [(7, 28), (57, 28), (54, 57), (10, 57)], COLORS["folder_front"], width=2)

    draw.rectangle((13, 31, 51, 51), fill=COLORS["cat_light"])
    draw.line((13, 31, 51, 31), fill=COLORS["folder_light"], width=2)
    draw_tabby_marks(draw, 32, 31)
    draw_pixel_eye(draw, 20, 42, big=True)
    draw_pixel_eye(draw, 40, 42, big=True)
    draw_cat_mouth(draw, 32, 49)
    draw.point((16, 48), fill=COLORS["cheek"])
    draw.point((48, 48), fill=COLORS["cheek"])
    return img


def save_icon(name: str, img: Image.Image) -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    SELECTED_DIR.mkdir(parents=True, exist_ok=True)

    png = img.resize((256, 256), Image.Resampling.NEAREST)
    for directory in (RAW_DIR, SELECTED_DIR):
        png.save(directory / f"{name}.png")
        png.save(
            directory / f"{name}.ico",
            format="ICO",
            sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
        )


def build_comparison(names: list[str]) -> None:
    card_w = 330
    card_h = 250
    board = Image.new("RGBA", (card_w * len(names), card_h), (250, 244, 234, 255))
    draw = ImageDraw.Draw(board)

    for i, name in enumerate(names):
        icon = Image.open(SELECTED_DIR / f"{name}.png").convert("RGBA")
        x = i * card_w
        draw.rounded_rectangle(
            (12 + x, 12, x + card_w - 12, card_h - 12),
            8,
            fill=(255, 255, 255, 255),
            outline=(232, 214, 191, 255),
            width=2,
        )
        draw.text((x + 20, 18), name, fill=(90, 70, 55, 255))
        board.alpha_composite(icon.resize((128, 128), Image.Resampling.NEAREST), (x + 16, 58))
        board.alpha_composite(icon.resize((32, 32), Image.Resampling.NEAREST).resize((96, 96), Image.Resampling.NEAREST), (x + 160, 74))
        board.alpha_composite(icon.resize((16, 16), Image.Resampling.NEAREST).resize((72, 72), Image.Resampling.NEAREST), (x + 252, 86))
        draw.text((x + 58, 198), "128px", fill=(120, 96, 78, 255))
        draw.text((x + 178, 198), "32px", fill=(120, 96, 78, 255))
        draw.text((x + 266, 198), "16px", fill=(120, 96, 78, 255))

    board.save(SELECTED_DIR / "handdrawn-cat-folder-comparison-v01.png")


def main() -> None:
    icons = {
        "handdrawn-cat-peek-folder-tabby-v01": icon_peek_tabby(),
        "handdrawn-cat-hug-folder-tabby-v01": icon_hug_tabby(),
        "handdrawn-cat-face-folder-tabby-v01": icon_face_folder_tabby(),
    }
    for name, img in icons.items():
        save_icon(name, img)
    build_comparison(list(icons))
    print("Generated", len(icons), "hand-drawn folder icon variants.")


if __name__ == "__main__":
    main()

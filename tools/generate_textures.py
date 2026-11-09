#!/usr/bin/env python3
"""Generate the item textures and pack icons for the Angel & Devil addon.

The item sprites are 16x16 pixel art. Each row is a string of palette keys, so
you can edit the art directly in this file and re-run:

    python3 tools/generate_textures.py

Requires Pillow: pip install pillow
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

SPRITES = {
    "angel_staff": [
        "...........a....",
        "..........ada...",
        ".........adcda..",
        "........adcebba.",
        ".......adceiecba",
        "........adbebha.",
        ".........abcha..",
        "..........aba...",
        "........aacba...",
        ".......adcbba...",
        ".......acbaa....",
        "......acba......",
        ".....afga.......",
        "....afga........",
        "...afga.........",
        "....aa..........",
    ],
    "devil_scythe": [
        ".......aaaaa....",
        ".....aaeffeeaa..",
        "...aabbbffbbbea.",
        "..abbcccccccbba.",
        ".abecaaaaacadbaa",
        "aaaaa....aaadaba",
        ".aa.....adaaaaaa",
        ".......adaa..a..",
        "......adaa......",
        ".....adaa.......",
        "....adaa........",
        "...adaa.........",
        "..adaa..........",
        ".afeba..........",
        "abbea...........",
        ".aaa............",
    ],
}

PALETTES = {
    "angel_staff": {
        ".": (0, 0, 0, 0),
        "a": (26, 22, 32, 255),
        "b": (195, 168, 120, 255),
        "c": (220, 201, 127, 255),
        "d": (236, 231, 180, 255),
        "e": (110, 201, 255, 255),
        "f": (122, 160, 216, 255),
        "g": (106, 56, 181, 255),
        "h": (176, 122, 80, 255),
        "i": (224, 255, 255, 255),
    },
    "devil_scythe": {
        ".": (0, 0, 0, 0),
        "a": (13, 4, 8, 255),
        "b": (214, 16, 60, 255),
        "c": (90, 42, 53, 255),
        "d": (122, 63, 74, 255),
        "e": (247, 138, 107, 255),
        "f": (253, 220, 176, 255),
    },
}


def draw_sprite(name: str) -> Image.Image:
    rows = SPRITES[name]
    palette = PALETTES[name]
    height = len(rows)
    width = len(rows[0])

    if any(len(row) != width for row in rows):
        raise ValueError(f"{name}: every row must have the same width")

    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, key in enumerate(row):
            image.putpixel((x, y), palette[key])
    return image


def make_pack_icon() -> Image.Image:
    size = 256
    border = 8
    image = Image.new("RGBA", (size, size), (14, 12, 20, 255))

    for y in range(size):
        for x in range(size):
            if x < border or y < border or x >= size - border or y >= size - border:
                continue

            t = y / (size - 1)
            red = (
                round(69 + (58 - 69) * t),
                round(25 + (21 - 25) * t),
                round(38 + (32 - 38) * t),
                255,
            )
            blue = (
                round(18 + (32 - 18) * t),
                round(25 + (44 - 25) * t),
                round(47 + (82 - 47) * t),
                255,
            )

            # Diagonal split, bright red on the top-left and deep blue on the
            # bottom-right, matching the two sides of the addon.
            if x + y >= size - 1:
                image.putpixel((x, y), blue)
            else:
                image.putpixel((x, y), red)

    scale = 7
    icon_size = 16 * scale
    scythe = draw_sprite("devil_scythe").resize(
        (icon_size, icon_size), Image.Resampling.NEAREST
    )
    staff = draw_sprite("angel_staff").resize(
        (icon_size, icon_size), Image.Resampling.NEAREST
    )

    image.alpha_composite(scythe, (16, (size - icon_size) // 2))
    image.alpha_composite(staff, (128, (size - icon_size) // 2))
    return image


def main() -> None:
    item_dir = ROOT / "RP" / "textures" / "items"
    item_dir.mkdir(parents=True, exist_ok=True)

    for name in SPRITES:
        draw_sprite(name).save(item_dir / f"{name}.png")

    icon = make_pack_icon()
    for pack in ("BP", "RP"):
        icon.save(ROOT / pack / "pack_icon.png")

    print(f"wrote item textures to {item_dir}")
    print("wrote pack icons to BP/pack_icon.png and RP/pack_icon.png")


if __name__ == "__main__":
    main()

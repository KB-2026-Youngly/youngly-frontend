"""Build the Youngly Neo pixel webfont with an open-counter zero.

Requires: python -m pip install "fonttools[woff]"
The source font remains unchanged. Only U+0030 is redrawn and the modified
font is renamed because NeoDunggeunmo is a reserved font name under the OFL.
"""

from pathlib import Path

from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "src" / "assets" / "fonts"
SOURCE = FONT_DIR / "neodgm.woff2"
FAMILY_NAME = "YounglyNeoPixel"


def replace_zero(font: TTFont) -> None:
    glyph_name = next(
        table.cmap[0x30]
        for table in font["cmap"].tables
        if table.isUnicode() and 0x30 in table.cmap
    )
    glyph_set = font.getGlyphSet()
    pen = TTGlyphPen(glyph_set)

    # Preserve the original stepped outer contour.
    pen.moveTo((0, 576))
    pen.lineTo((64, 576))
    pen.lineTo((64, 640))
    pen.lineTo((384, 640))
    pen.lineTo((384, 576))
    pen.lineTo((448, 576))
    pen.lineTo((448, 64))
    pen.lineTo((384, 64))
    pen.lineTo((384, 0))
    pen.lineTo((64, 0))
    pen.lineTo((64, 64))
    pen.lineTo((0, 64))
    pen.closePath()

    # One continuous counter replaces the two counters split by the slash.
    pen.moveTo((128, 576))
    pen.lineTo((128, 64))
    pen.lineTo((320, 64))
    pen.lineTo((320, 576))
    pen.closePath()
    font["glyf"][glyph_name] = pen.glyph()


def rename_font(font: TTFont) -> None:
    names = font["name"]
    replacements = {
        1: FAMILY_NAME,
        3: f"{FAMILY_NAME} 1.0",
        4: FAMILY_NAME,
        5: "Version 1.000; Youngly open-zero modification",
        6: f"{FAMILY_NAME}-Regular",
        16: FAMILY_NAME,
        17: "Regular",
    }
    for record in names.names:
        if record.nameID not in replacements:
            continue
        value = replacements[record.nameID]
        names.setName(value, record.nameID, record.platformID, record.platEncID, record.langID)


def main() -> None:
    font = TTFont(SOURCE)
    replace_zero(font)
    rename_font(font)

    for flavor in ("woff2", "woff"):
        font.flavor = flavor
        font.save(FONT_DIR / f"YounglyNeoPixel.{flavor}")


if __name__ == "__main__":
    main()

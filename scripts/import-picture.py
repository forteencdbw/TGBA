"""Install ONE picture into `src/assets/` at the project's pixel density.

Usage:  python scripts/import-picture.py picture.png --name 珊瑚 --drawn 111
        python scripts/import-picture.py picture.png --name 珊瑚 --grid 79

WHY THIS EXISTS, next to `import-sheet.py`. That one imports a creature that ANIMATES: it finds the frames, aligns
them all on the head, and shares one palette across them. None of that applies to a picture that is just a picture
-- scenery, a prop, a backdrop element -- and asking it for one frame produces `珊瑚-1.png`, a filename that only
makes sense if there was going to be a second one. This is the single-picture door, and it is the same density
arithmetic with the alignment taken out.

WHAT IT DOES, and nothing else:

  * CROP to the content, with a small margin. The model's canvas is arbitrary; what matters is the picture.
  * PIXELATE with the pipeline's own `pixelate()` -- BOX-reduce onto a grid, palette-snap, alpha resampled
    separately so the transparent edge does not become a grey halo.
  * WRITE `src/assets/<name>.png` and say what density it landed at, in the screen pixels per texel the rest of
    the game is drawn at.

WHERE `--drawn` COMES FROM. It is the width the game draws the thing at, in screen pixels, and the grid is that
divided by 1.4 (`TARGET_TEXEL_PX`). The arithmetic is the same one `import-sheet.py` documents:

    drawn = 2 * radius * LANE_PX * scale

with `radius` from the config's own table (`hazards.radius` or `obstacles.radius`), `LANE_PX = 412` for the phone
the game ships to, and `scale` the extra multiplier the art row applies. There is no default and no lookup here
on purpose: `import-sheet.py` reads the TUNA's numbers out of the config when you pass neither, which is a trap
worth not repeating. State the width, or state the grid.
"""

import argparse
import importlib.util
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
PIPELINE = ROOT / "refs" / "asset_pipeline.py"
ASSETS = ROOT / "src" / "assets"

LANE_PX = 412  # a phone, which is the shipping target: `min(screenWidth, 900)` in computeViewport
TARGET_TEXEL_PX = 1.4  # screen pixels per texel, the density every picture in the game is drawn at
COLOURS = 40
ALPHA_FLOOR = 8
MARGIN_TEXELS = 2


def load_pipeline():
    spec = importlib.util.spec_from_file_location("asset_pipeline", PIPELINE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    parser = argparse.ArgumentParser(description="Install one picture at the project's pixel density.")
    parser.add_argument("picture", help="the source PNG")
    parser.add_argument("--name", required=True, help="file name stem; written to src/assets/<name>.png")
    parser.add_argument("--drawn", type=float, default=None, help="the width the game draws it at, in screen px")
    parser.add_argument("--grid", type=int, default=None, help="pixel grid, if you would rather state it")
    parser.add_argument("--colours", type=int, default=COLOURS)
    parser.add_argument("--margin", type=int, default=MARGIN_TEXELS, help="padding in texels")
    arguments = parser.parse_args()

    if arguments.grid is None and arguments.drawn is None:
        raise SystemExit(
            "state --drawn (the width the game draws it at, in screen px) or --grid.\n"
            f"  grid = drawn / {TARGET_TEXEL_PX}, and drawn = 2 * radius * {LANE_PX} * scale."
        )
    grid = arguments.grid or round(arguments.drawn / TARGET_TEXEL_PX)
    if grid < 2:
        raise SystemExit(f"a grid of {grid} is not a picture")

    source = Image.open(arguments.picture).convert("RGBA")
    alpha = np.array(source)[:, :, 3] > ALPHA_FLOOR
    if not alpha.any():
        raise SystemExit("the picture has no opaque pixels at all")
    ys, xs = np.where(alpha)
    crop = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    content = source.crop(crop)
    print(f"  {arguments.picture}: {source.width}x{source.height} -> content {content.width}x{content.height}")

    pipeline = load_pipeline()
    piece, _palette = pipeline.pixelate(content, grid, None, arguments.colours)

    pad = arguments.margin
    canvas = Image.new("RGBA", (piece.width + pad * 2, piece.height + pad * 2), (0, 0, 0, 0))
    canvas.alpha_composite(piece, (pad, pad))

    destination = ASSETS / f"{arguments.name}.png"
    canvas.save(destination, optimize=True)

    opaque = np.array(canvas).reshape(-1, 4)
    opaque_colours = len(set(map(tuple, opaque[opaque[:, 3] == 255])))
    drawn = arguments.drawn if arguments.drawn is not None else grid * TARGET_TEXEL_PX
    decoded = canvas.width * canvas.height * 4
    print(
        f"\n  {destination.name:<24s} {canvas.width}x{canvas.height}  {destination.stat().st_size / 1024:.1f} KB\n"
        f"  drawn {drawn:.0f}px wide ({drawn / canvas.width:.2f} screen px per texel), "
        f"{opaque_colours} opaque colours of a {arguments.colours} palette, decoded {decoded / 1024:.1f} KB"
    )
    print("now run:  node scripts/pack-atlas.mjs   (and `pnpm dev`/refresh to see it)")


if __name__ == "__main__":
    main()

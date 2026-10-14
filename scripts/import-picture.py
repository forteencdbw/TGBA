"""Install ONE picture into `src/assets/` at the project's pixel density.

Usage:  python scripts/import-picture.py picture.png --name 珊瑚 --grid 79
        python scripts/import-picture.py picture.png --name 珊瑚 --grid 75 --out-dir .scratch/asset-pipeline/x/candidates

`--out-dir` is what lets the asset pipeline SHOW you the picture before it ships it: pointing it at the batch's own
candidate directory pixelates the picture exactly as the real import would, and the file that lands in
`src/assets/` later is that same file copied -- not a second pixelation that might disagree with the one you
approved. It defaults to `src/assets`, so every existing caller is unaffected.

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


def stretch_sides(piece, keep, target):
    """Widen a pixelated picture to `target` texels by stretching only what is OUTSIDE a kept band.

    WHY THIS EXISTS. A set of pictures that has to be the same size -- three menu buttons, where the
    lettering is painted on the stone and so cannot be allowed to change scale at all -- cannot be
    reconciled by cropping or by scaling the whole thing. Scaling the whole thing changes the letters;
    cropping cannot add width. What CAN move is the ornament around the letters, and that is the one
    thing this does: the columns in [x0, x1) are copied through untouched, and the two stretches
    either side are resampled until the total is `target`.

    NEAREST, not LANCZOS, and that is not a quality shortcut. The picture has already been snapped to
    a palette and a grid; an interpolating filter would invent colours that are not in it and put the
    edges between texels, which is the one thing the rest of this pipeline spends its time undoing. It
    is checked: at the ratios this is used at, the output introduces zero new colours and the opaque
    coverage per column of the stretched regions is unchanged -- so a one-texel coral sprig comes
    through as a coral sprig.

    The two sides share the change in proportion to their widths, so both are stretched by the same
    factor. Giving all of it to the wider side would leave the narrower one at a different scale, and
    the two rims of one plate visibly disagreeing is worse than either being slightly off.
    """
    x0, x1 = keep
    w, h = piece.size
    if not 0 < x0 < x1 < w:
        raise SystemExit(f"--keep {x0},{x1} is not a band inside a {w} texel picture")
    left = piece.crop((0, 0, x0, h))
    middle = piece.crop((x0, 0, x1, h))
    right = piece.crop((x1, 0, w, h))
    extra = target - w
    sides = left.width + right.width
    share = extra * (left.width / sides)
    leftWidth = max(1, round(left.width + share))
    # The RIGHT side takes the rounding, rather than being rounded from the same `share` as the left: two
    # independent roundings can sum to one texel off the target, and an operation whose entire purpose is "these
    # pictures end up the same width" cannot be one texel off. It did, on the first run -- 170 against 169.
    rightWidth = max(1, target - leftWidth - middle.width)
    left = left.resize((leftWidth, h), Image.NEAREST)
    right = right.resize((rightWidth, h), Image.NEAREST)
    out = Image.new("RGBA", (left.width + middle.width + right.width, h), (0, 0, 0, 0))
    out.alpha_composite(left, (0, 0))
    out.alpha_composite(middle, (left.width, 0))
    out.alpha_composite(right, (left.width + middle.width, 0))
    factor = (sides + extra) / sides
    print(f"  stretched: sides {x0}+{w - x1} texels -> {left.width}+{right.width} (x{factor:.2f}), "
          f"middle {middle.width} texels held, total {out.width}")
    return out


def main():
    parser = argparse.ArgumentParser(description="Install one picture at the project's pixel density.")
    parser.add_argument("picture", help="the source PNG")
    parser.add_argument("--name", required=True, help="file name stem; written to src/assets/<name>.png")
    parser.add_argument("--drawn", type=float, default=None, help="the width the game draws it at, in screen px")
    parser.add_argument("--grid", type=int, default=None, help="pixel grid, if you would rather state it")
    parser.add_argument(
        "--grid-height",
        type=int,
        default=None,
        help=(
            "pixelate so the picture is this many TEXELS TALL, the width following the content's own shape. "
            "THE REASON IT EXISTS, next to `--grid`: a SET of pictures that has to match can only be matched by "
            "height when the drawings have different plate ratios -- normalise the width and the heights differ, "
            "and if the lettering is painted on the plate then those height differences ARE letter-size differences."
        ),
    )
    parser.add_argument(
        "--keep",
        default=None,
        help=(
            "x0,x1 texel columns to hold fixed, with --stretch-to. Everything outside the band is stretched and "
            "the band is copied through untouched, which is for artwork whose TEXT is part of the picture: the "
            "lettering cannot be scaled, so the ornament around it is what moves. See `stretch_sides`."
        ),
    )
    parser.add_argument(
        "--stretch-to",
        type=int,
        default=None,
        help="the texel width to stretch to, with --keep. Only the columns outside --keep change.",
    )
    parser.add_argument("--colours", type=int, default=COLOURS)
    parser.add_argument("--margin", type=int, default=MARGIN_TEXELS, help="padding in texels")
    parser.add_argument(
        "--out-dir",
        default=None,
        help=f"where to write the picture (default: {ASSETS}); the asset pipeline points it at its candidate dir",
    )
    parser.add_argument(
        "--crop",
        default=None,
        help=(
            "x0,y0,x1,y1 to crop with, instead of cropping to the content. THE REASON IT EXISTS: a picture with "
            "STATE VARIANTS (a button's normal / hover / pressed) has to be cut the same way in all of them, or "
            "swapping the texture moves the picture -- and cropping each to its own content does exactly that, "
            "because a pressed state is drawn a few pixels lower on purpose. Pass the UNION of the variants' boxes "
            "to every one of them."
        ),
    )
    arguments = parser.parse_args()

    if arguments.grid_height is not None and (arguments.grid is not None or arguments.drawn is not None):
        raise SystemExit("--grid-height states the height; do not also state --grid or --drawn")
    if (arguments.keep is None) != (arguments.stretch_to is None):
        raise SystemExit("--keep and --stretch-to only make sense together: one says what holds, the other how wide")
    if arguments.grid is None and arguments.drawn is None and arguments.grid_height is None:
        raise SystemExit(
            "state --drawn (the width the game draws it at, in screen px), --grid, or --grid-height.\n"
            f"  grid = drawn / {TARGET_TEXEL_PX}, and drawn = 2 * radius * {LANE_PX} * scale."
        )
    grid = arguments.grid or (round(arguments.drawn / TARGET_TEXEL_PX) if arguments.drawn is not None else None)
    if arguments.grid_height is not None and arguments.grid_height < 2:
        raise SystemExit(f"a grid height of {arguments.grid_height} is not a picture")

    source = Image.open(arguments.picture).convert("RGBA")
    if arguments.crop:
        try:
            crop = tuple(int(part) for part in arguments.crop.split(","))
        except ValueError:
            raise SystemExit("--crop takes four integers: x0,y0,x1,y1")
        if len(crop) != 4:
            raise SystemExit("--crop takes four integers: x0,y0,x1,y1")
        content = source.crop(crop)
        print(f"  {arguments.picture}: {source.width}x{source.height} -> crop {content.width}x{content.height} (stated)")
    else:
        alpha = np.array(source)[:, :, 3] > ALPHA_FLOOR
        if not alpha.any():
            raise SystemExit("the picture has no opaque pixels at all")
        ys, xs = np.where(alpha)
        crop = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
        content = source.crop(crop)
        print(f"  {arguments.picture}: {source.width}x{source.height} -> content {content.width}x{content.height}")

    pipeline = load_pipeline()
    if grid is None:
        # `--grid-height` is stated in TEXELS and the width follows the cropped content's own shape, which is the
        # whole point of it: it is the height that has to match across a set, so that is the one that is stated.
        grid = round(arguments.grid_height * content.width / content.height)
        if grid < 2:
            raise SystemExit(f"a grid height of {arguments.grid_height} on a {content.width}x{content.height} crop is not a picture")
    piece, _palette = pipeline.pixelate(content, grid, None, arguments.colours)

    if arguments.stretch_to is not None:
        try:
            keep = tuple(int(part) for part in arguments.keep.split(","))
        except ValueError:
            raise SystemExit("--keep takes two integers: x0,x1")
        if len(keep) != 2:
            raise SystemExit("--keep takes two integers: x0,x1")
        piece = stretch_sides(piece, keep, arguments.stretch_to)

    pad = arguments.margin
    canvas = Image.new("RGBA", (piece.width + pad * 2, piece.height + pad * 2), (0, 0, 0, 0))
    canvas.alpha_composite(piece, (pad, pad))

    destination = Path(arguments.out_dir or ASSETS) / f"{arguments.name}.png"
    destination.parent.mkdir(parents=True, exist_ok=True)
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
    if arguments.out_dir:
        print("this is a candidate, not an import -- nothing in src/assets/ changed, so no pack is needed yet")
    else:
        print("now run:  node scripts/pack-atlas.mjs   (and `pnpm dev`/refresh to see it)")


if __name__ == "__main__":
    main()

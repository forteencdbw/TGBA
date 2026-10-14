"""Re-stretch ONE already-imported picture sideways, holding a band of it fixed.

Usage:  python scripts/restretch-picture.py 按钮-设置 --keep 70,140 --stretch-to 165

WHY THIS EXISTS SEPARATELY FROM `import-picture.py`. That one takes a SOURCE drawing and produces the
project's picture from it: crop, pixelate, write. This one takes a picture that is already in the
project and changes only its width, which is a different job with a different input -- and, for the
three menu buttons, the only job that is still possible at all: their source drawings were deleted
from the download folder after they were imported, so the committed PNGs are the only copies there
are. Re-running the import would mean re-pixelating an already-pixelated picture, which is a lossy
round trip through the palette; this skips that and moves columns instead.

WHAT IT IS FOR, in one line: three pictures that must be the same width, whose TEXT is painted onto
them and so cannot be scaled. The answer is to hold the lettering's columns fixed and stretch only
the ornament either side -- see `stretch_sides` in `import-picture.py`, which is the single
implementation of that and is shared with the import path rather than copied.

COORDINATES. `--keep` is in the picture's CONTENT coordinates: the printed file has `--margin`
transparent texels around the content (`import-picture.py` adds them so a frame can be sampled
without bleeding), and those are not part of the count. The tool prints both so a measurement taken
off the file can be checked against it.
"""

import argparse
import importlib.util
import sys
from pathlib import Path

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "src" / "assets"


def load_import_tool():
    """Load `import-picture.py` as a module, for `stretch_sides` and the margin default.

    The filename has a hyphen, so it cannot be imported by name -- hence the spec dance, which is the
    same one `import-picture.py` itself uses to load `refs/asset_pipeline.py`. Its `main()` is behind
    an `if __name__ == "__main__"` guard, so loading it runs nothing.
    """
    spec = importlib.util.spec_from_file_location("import_picture", ROOT / "scripts" / "import-picture.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    tool = load_import_tool()
    parser = argparse.ArgumentParser(description="Stretch an imported picture sideways, holding a band fixed.")
    parser.add_argument("picture", help="the picture's name, with or without .png; looked up in src/assets")
    parser.add_argument("--keep", required=True, help="x0,x1 content texel columns to hold fixed")
    parser.add_argument("--stretch-to", type=int, required=True, help="the content's new width, in texels")
    parser.add_argument("--margin", type=int, default=tool.MARGIN_TEXELS, help="the transparent border the import wrote")
    parser.add_argument("--out-dir", default=None, help=f"where to write (default: {ASSETS}, in place)")
    arguments = parser.parse_args()

    name = arguments.picture if arguments.picture.endswith(".png") else f"{arguments.picture}.png"
    source = Path(ASSETS) / name
    if not source.exists():
        raise SystemExit(f"no picture called {name} in {ASSETS}")

    try:
        keep = tuple(int(part) for part in arguments.keep.split(","))
    except ValueError:
        raise SystemExit("--keep takes two integers: x0,x1")
    if len(keep) != 2:
        raise SystemExit("--keep takes two integers: x0,x1")

    frame = Image.open(source).convert("RGBA")
    pad = arguments.margin
    content = frame.crop((pad, pad, frame.width - pad, frame.height - pad))
    if content.width <= max(keep):
        raise SystemExit(f"--keep {keep[0]},{keep[1]} does not fit a {content.width} texel content")

    print(f"  {name}: frame {frame.width}x{frame.height}, content {content.width}x{content.height}")
    stretched = tool.stretch_sides(content, keep, arguments.stretch_to)

    out = Image.new("RGBA", (stretched.width + pad * 2, stretched.height + pad * 2), (0, 0, 0, 0))
    out.alpha_composite(stretched, (pad, pad))

    destination = Path(arguments.out_dir or ASSETS) / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    out.save(destination, optimize=True)
    print(
        f"\n  {destination.name:<24s} {out.width}x{out.height}  {destination.stat().st_size / 1024:.1f} KB\n"
        f"  (--keep {keep[0]},{keep[1]} in content texels is {keep[0] + pad},{keep[1] + pad} in the file)"
    )
    if arguments.out_dir:
        print("this is a candidate, not a change -- nothing in src/assets/ moved")
    else:
        print("now run:  node scripts/pack-atlas.mjs   (and `pnpm dev`/refresh to see it)")


if __name__ == "__main__":
    main()

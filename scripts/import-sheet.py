"""Import a creature sprite sheet: pixelate it the project's way and install it as an animation.

Usage:  python scripts/import-sheet.py <sheet.png> [--name 金枪鱼-游动] [--grid 66] [--cols 2] [--rows 2]
        python scripts/import-sheet.py <frames-dir> --cols 4 --rows 1     # one PNG per frame, laid out into a strip

WHY THIS EXISTS: the sheet you draw is the single source of truth for the frames, so the import must be re-runnable
without editing anything. Every number it needs is measured from the picture or read from the config; the only things
you choose are the file name and the layout.

  * FRAMES are found by CONNECTED COMPONENTS, not by cutting the image into cols x rows. A mechanical cut clips fins
    whenever the drawings are not on an exact grid (the first tuna sheet had its top row starting at x=8 and x=524 and
    its bottom row at x=0 and x=528), and `cols`/`rows` are only used to sort the blobs into reading order.
  * A DIRECTORY is accepted as well as a file, and laid out into a strip with a gap between the frames -- that is
    what `compose-swim-tail.py` leaves behind. See `read_input` for why the gap has to be wider than 4 pixels.
  * PIXELATION is the pipeline's own `pixelate()` at the grid the game's density calls for, with ONE palette shared
    by every frame -- a palette per frame would let two frames of the same creature pick two different blues.
  * ALIGNMENT is on the HEAD, both axes, in whole texels: x on the nose, y on the head's vertical centre. The tail is
    not a landmark, it is the part that moves; and whole-texel moves never resample, so a body that was identical
    between two frames stays identical.
  * STRAY PIXELS are ignored: sheets made by these models come with faint noise scattered over the transparent
    background (the first tuna sheet had ~200 such dots), so only components above a size floor are frames.
"""

import argparse
import importlib.util
import os
import re
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
PIPELINE = ROOT / "refs" / "asset_pipeline.py"
ASSETS = ROOT / "src" / "assets"

LANE_PX = 412  # a phone, which is the shipping target: `min(screenWidth, 900)` in computeViewport
TARGET_TEXEL_PX = 1.4  # screen pixels per texel, the density every other picture in the game is drawn at
COLOURS = 40  # the shared palette the hand-pixelated creatures use
ALPHA_FLOOR = 8
MARGIN_TEXELS = 2
MIN_COMPONENT_BLOCKS = 150  # 4x4 blocks; noise dots are a couple of pixels, a creature is thousands
FRAME_GAP_PX = 16  # transparent columns between frames when a directory is laid out into a strip; see read_input


def load_pipeline():
    spec = importlib.util.spec_from_file_location("asset_pipeline", PIPELINE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def components(alpha, step=4, floor=MIN_COMPONENT_BLOCKS):
    """The picture's separate drawings, as bounding boxes, largest first."""
    height, width = alpha.shape
    small = alpha[: height // step * step, : width // step * step].reshape(
        height // step, step, width // step, step
    ).max(axis=(1, 3))
    seen = np.zeros_like(small, dtype=bool)
    boxes = []
    for y0 in range(small.shape[0]):
        for x0 in range(small.shape[1]):
            if not small[y0, x0] or seen[y0, x0]:
                continue
            queue = deque([(y0, x0)])
            seen[y0, x0] = True
            cells = []
            while queue:
                y, x = queue.popleft()
                cells.append((y, x))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < small.shape[0] and 0 <= nx < small.shape[1] and small[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            queue.append((ny, nx))
            if len(cells) >= floor:
                ys = [c[0] for c in cells]
                xs = [c[1] for c in cells]
                boxes.append(
                    (min(xs) * step, min(ys) * step, (max(xs) + 1) * step - 1, (max(ys) + 1) * step - 1, len(cells))
                )
    boxes.sort(key=lambda b: -b[4])
    return boxes


def read_input(path):
    """
    The frames to import: either one sheet PNG, or a directory holding one PNG per frame.

    A DIRECTORY is what `compose-swim-tail.py` leaves behind, and this exists because the two scripts used to
    disagree. That one ends by printing `import-sheet.py <its output directory>` as the next command, and this
    one did `Image.open()` on its argument -- so following the printed instruction exactly ended in
    `PermissionError: [Errno 13]` on Windows. Accepting the directory is the half of the fix that makes the
    printed instruction true; the other half would have been to stop printing it.

    The frames are laid out into one strip with `FRAME_GAP_PX` transparent columns between them, because
    `components()` downsamples into 4x4 blocks before it looks for connected shapes: two drawings closer
    together than one block land in the same blob and merge. The count then comes out SHORT, which reads as a
    torn sheet rather than as too small a gap, so the gap is deliberately wider than the block size.

    Returns `(picture, description, boxes)`. `boxes` is None for a sheet -- the caller finds the frames in it --
    and the frames' own rectangles for a directory, because a directory's frames already share one canvas and
    must be pixelated as that canvas rather than cropped to their own content. See the caller.
    """

    source = Path(path)
    if not source.is_dir():
        return Image.open(source).convert("RGBA"), str(source), None

    def reading_order(p):
        # frame-10 comes after frame-2, which plain lexicographic order gets backwards.
        m = re.search(r"(\d+)$", p.stem)
        return (int(m.group(1)) if m else 1 << 30, p.stem)

    files = sorted((p for p in source.iterdir() if p.suffix.lower() == ".png"), key=reading_order)
    if not files:
        raise SystemExit(f"{path} is a directory with no PNGs in it -- expected one file per frame")

    frames = [Image.open(f).convert("RGBA") for f in files]
    height = max(f.height for f in frames)
    width = sum(f.width for f in frames) + FRAME_GAP_PX * (len(frames) - 1)
    strip = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    boxes = []
    x = 0
    for frame in frames:
        strip.alpha_composite(frame, (x, 0))
        boxes.append((x, 0, x + frame.width - 1, frame.height - 1))
        x += frame.width + FRAME_GAP_PX

    print(f"  {len(files)} frame file(s) from {path} -> a {width}x{height} strip")
    return strip, f"{path} ({len(files)} files)", boxes


def content_box(image):
    box = image.getchannel("A").point(lambda v: 255 if v > ALPHA_FLOOR else 0).getbbox()
    if box is None:
        raise SystemExit("a frame came out empty -- the crop or the component floor is wrong")
    return box


def main():
    parser = argparse.ArgumentParser(description="Pixelate and import a creature sprite sheet.")
    parser.add_argument("sheet", help="the sprite sheet PNG, or a directory holding one PNG per frame")
    parser.add_argument("--name", default="金枪鱼-游动", help="file name stem for the frames (default: 金枪鱼-游动)")
    parser.add_argument("--grid", type=int, default=None, help="pixel grid (default: from the config, 1.4 screen px per texel)")
    parser.add_argument("--drawn", type=float, default=None, help="the width the game draws this creature, in screen px")
    parser.add_argument("--cols", type=int, default=2, help="frames per row, only used to sort into reading order")
    parser.add_argument("--rows", type=int, default=2, help="rows in the sheet, only used to sort into reading order")
    parser.add_argument("--colours", type=int, default=COLOURS)
    args = parser.parse_args()

    source, described, laid_out = read_input(args.sheet)
    alpha = np.array(source)[:, :, 3] > ALPHA_FLOOR
    if not alpha.any():
        raise SystemExit("the sheet has no opaque pixels at all")
    print(f"  importing {described}")

    # The grid: the game's density applied to the width this creature is DRAWN at. `hazards.radius` x `hazardArt.scale`
    # x the lane width is that width -- read from the config unless the caller states it.
    drawn = args.drawn
    if drawn is None:
        mechanics = (ROOT / "config" / "mechanics.json5").read_text(encoding="utf-8")
        radius = re.search(r'"tuna":\s*([0-9.]+)', mechanics)
        scale = re.search(r'"tuna":\s*\{[^}]*?"scale":\s*([0-9.]+)', mechanics, re.S)
        drawn = 2 * float(radius.group(1)) * LANE_PX * (float(scale.group(1)) if scale else 1.0)
        print(f"drawn width from the config: radius {radius.group(1)} x scale {scale.group(1) if scale else 1} -> {drawn:.1f}px")
    grid = args.grid or round(drawn / TARGET_TEXEL_PX)
    print(f"lane {LANE_PX}px, drawn {drawn:.1f}px, {TARGET_TEXEL_PX} screen px per texel -> grid {grid}\n")

    pad = 3
    if laid_out is not None:
        # A DIRECTORY of frames came from `compose-swim-tail.py`, whose entire promise is that the four frames share
        # one window so the body that did not move does not change. Cropping each frame to its own content box -- the
        # right thing for a model-drawn sheet, where the canvas is arbitrary -- breaks that promise here, because a
        # swinging tail changes the box and `pixelate()` scales by width: frame 1 of the whale cropped to 983px and
        # frame 4 to 958px, so the body was resampled at 110/983 and at 110/958 and came out a different SIZE.
        # Measured on that first attempt: the body differed by 1752 pixels between frames 1 and 2. Pixelating the
        # window every frame shares is what makes the composition's guarantee survive into the game.
        frames = [source.crop((x0, y0, x1 + 1, y1 + 1)) for x0, y0, x1, y1 in laid_out]
        print(f"  {len(frames)} frames on one shared canvas, {frames[0].width}x{frames[0].height}")
    else:
        boxes = components(alpha)
        expected = args.cols * args.rows
        if len(boxes) < expected:
            raise SystemExit(
                f"found {len(boxes)} drawing(s) but the layout says {args.cols}x{args.rows} = {expected}; "
                f"check --cols/--rows, or the sheet may not have separated frames"
            )
        if len(boxes) > expected:
            print(f"note: {len(boxes)} drawings found, using the {expected} largest (the rest are smaller than a frame)")
            boxes = boxes[:expected]

        # Reading order: top row first, left to right within a row. Rows are split by each drawing's centre y.
        mid = (min(b[1] for b in boxes) + max(b[3] for b in boxes)) / 2
        if args.rows > 1:
            boxes.sort(key=lambda b: (0 if (b[1] + b[3]) / 2 < mid else 1, b[0]))
        else:
            boxes.sort(key=lambda b: b[0])

        frames = []
        for index, (x0, y0, x1, y1, _n) in enumerate(boxes, start=1):
            box = (max(0, x0 - pad), max(0, y0 - pad), min(source.width, x1 + 1 + pad), min(source.height, y1 + 1 + pad))
            frames.append(source.crop(box))
            print(f"  frame {index}: x {x0}..{x1} y {y0}..{y1} -> crop {frames[-1].width}x{frames[-1].height}")

    pipeline = load_pipeline()
    palette = None
    pieces = []
    print()
    for index, frame in enumerate(frames, start=1):
        piece, palette = pipeline.pixelate(frame, grid, palette, args.colours)
        pieces.append(piece)
        print(f"  frame {index}: {frame.width}x{frame.height} -> {piece.width}x{piece.height}")

    opaque_colours = []
    for piece in pieces:
        pixels = np.array(piece).reshape(-1, 4)
        opaque_colours.append(len(set(map(tuple, pixels[pixels[:, 3] == 255]))))
    print(f"\nopaque colours per frame: {opaque_colours} (shared palette: {args.colours})")

    # Align on the head, both axes, whole texels.
    raw_boxes = [content_box(p) for p in pieces]
    head_cols = max(4, int(round(0.40 * (raw_boxes[0][2] - raw_boxes[0][0]))))

    def head_centre(image, box):
        band = np.array(image)[:, box[0] : box[0] + head_cols, 3] > ALPHA_FLOOR
        rows = np.where(band.any(axis=1))[0]
        return (int(rows[0]) + int(rows[-1])) / 2

    centres = [head_centre(p, b) for p, b in zip(pieces, raw_boxes)]
    dx = [raw_boxes[0][0] - b[0] for b in raw_boxes]
    dy = [int(round(centres[0] - c)) for c in centres]
    print(f"nose x before: {[b[0] for b in raw_boxes]}   head centre y before: {[round(c, 1) for c in centres]}")
    print(f"whole-texel shifts: x {dx}, y {dy}")

    pad_x = max(dx) - min(dx) + 2 * MARGIN_TEXELS
    pad_y = max(dy) - min(dy) + 2 * MARGIN_TEXELS
    moved = []
    for piece, sx, sy in zip(pieces, dx, dy):
        canvas = Image.new("RGBA", (piece.width + pad_x, piece.height + pad_y), (0, 0, 0, 0))
        canvas.alpha_composite(piece, (sx - min(dx) + MARGIN_TEXELS, sy - min(dy) + MARGIN_TEXELS))
        moved.append(canvas)

    # One common canvas for every frame: the union of their content, plus the margin. Frames of different sizes would
    # otherwise be drawn at slightly different scales by the engine, which resamples the body.
    moved_boxes = [content_box(p) for p in moved]
    left = min(b[0] for b in moved_boxes)
    top = min(b[1] for b in moved_boxes)
    right = max(b[2] for b in moved_boxes)
    bottom = max(b[3] for b in moved_boxes)
    size = (right - left + 1, bottom - top + 1)
    aligned = []
    for piece in moved:
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        canvas.alpha_composite(piece, (-left + MARGIN_TEXELS, -top + MARGIN_TEXELS))
        aligned.append(canvas)

    final_boxes = [content_box(p) for p in aligned]
    final_centres = [head_centre(p, b) for p, b in zip(aligned, final_boxes)]
    print(f"\ncommon canvas {size[0]}x{size[1]}")
    print(f"after alignment -- nose x: {[b[0] for b in final_boxes]}   head centre y: {[round(c, 1) for c in final_centres]}")

    written = []
    print()
    for index, piece in enumerate(aligned, start=1):
        target = ASSETS / f"{args.name}-{index}.png"
        piece.save(target, optimize=True)
        written.append(target)
        print(f"  {target.name:24s} {piece.width}x{piece.height}  {os.path.getsize(target) / 1024:5.1f} KB")

    decoded = size[0] * size[1] * 4 * len(aligned)
    print(
        f"\n{len(aligned)} frames, {size[0]}x{size[1]} each, drawn {drawn:.0f}px wide "
        f"({drawn / size[0]:.2f} screen px per texel), decoded {decoded / 1024:.1f} KB"
    )
    print("now run:  node scripts/pack-atlas.mjs   (and `pnpm dev`/refresh to see it)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

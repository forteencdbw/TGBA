"""Build a tail-only swim cycle from a sprite sheet: one body, the fin rotated.

The other way to make a swim cycle, and the opposite trade-off to `scripts/import-sheet.py`:

  * the BODY is not redrawn, so it is byte-identical in every frame -- no boiling, no jitter, nothing to align;
  * the tail is rotated about the peduncle, so the motion is smooth and the amplitude is a number you can tune;
  * but the tail you get is a ROTATION of one drawing, not an artist's second pose for it.

The frames are read in reading order, and the SECOND one is used as the body (any of them works; the middle of the
stroke is the least extreme pose). Everything is measured: the peduncle is the waist where the silhouette stops
thinning on its way out to the fin -- not simply the narrowest column, because the tip of a crescent fin is thinner
still.
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
ALPHA_FLOOR = 8
OVERLAP = 14  # the cut sits this far behind the waist, so the fin's base swings behind the body's own taper


def content_box(alpha):
    rows = np.where(alpha.any(axis=1))[0]
    cols = np.where(alpha.any(axis=0))[0]
    return int(cols[0]), int(rows[0]), int(cols[-1]), int(rows[-1])


def peduncle_x(alpha, left, right):
    heights = np.array([int(alpha[:, x].sum()) for x in range(alpha.shape[1])])
    peak = int(heights[left : left + int((right - left) * 0.5)].max())
    x = left + int((right - left) * 0.55)
    while x < right:
        if heights[x + 1] >= heights[x] and heights[x] < peak * 0.25:
            return x, heights, peak
        x += 1
    raise SystemExit("could not find the peduncle: the silhouette never thins out before the fin")


def main():
    parser = argparse.ArgumentParser(description="Compose a tail-only swim cycle from a sprite sheet.")
    parser.add_argument("sheet")
    parser.add_argument("--out", required=True, help="directory for the four composed frames")
    parser.add_argument("--amplitude", type=float, default=15.0, help="tail sweep, degrees either side")
    parser.add_argument("--body-frame", type=int, default=2, help="which drawing to use as the body (1-based)")
    parser.add_argument("--cols", type=int, default=2)
    parser.add_argument("--rows", type=int, default=2)
    args = parser.parse_args()

    source = Image.open(args.sheet).convert("RGBA")
    # Crop to the picture first: these sheets come with faint noise over the transparent background, and the noise
    # would otherwise define the content box.
    alpha = np.array(source)[:, :, 3] > ALPHA_FLOOR
    if not alpha.any():
        raise SystemExit("the sheet has no opaque pixels at all")
    left, top, right, bottom = content_box(alpha)
    source = source.crop((left, top, right + 1, bottom + 1))
    pixels = np.array(source, dtype=np.uint8)
    alpha = pixels[:, :, 3] > ALPHA_FLOOR
    left, right = 0, pixels.shape[1] - 1

    waist, heights, peak = peduncle_x(alpha, left, right)
    band = np.where(alpha[:, waist])[0]
    pivot = (float(waist), float((int(band[0]) + int(band[-1])) / 2))
    cut = waist - OVERLAP
    print(
        f"picture {pixels.shape[1]}x{pixels.shape[0]}; peduncle x={waist} ({heights[waist]} opaque px, body peak "
        f"{peak}); cut at x={cut}; pivot y={pivot[1]:.1f}"
    )

    # The body first: the fin is drawn behind it, so the whole fin can swing without touching the silhouette.
    body_mask = np.zeros_like(alpha)
    body_mask[:, :cut] = alpha[:, :cut]
    tail = pixels.copy()
    tail[:, :cut] = 0
    tail_image = Image.fromarray(tail, "RGBA")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    # Four samples of a sine, offset so no two are the same angle: 0/90/180/270 would give 0, +A, 0, -A.
    phases = [20 + 90 * i for i in range(4)]
    frames = []
    for index, phase in enumerate(phases, start=1):
        angle = args.amplitude * np.sin(np.radians(phase))
        # PIL rotates counter-clockwise for positive angles and screen y points down, so -angle tilts the tail up.
        rotated = np.array(tail_image.rotate(-angle, resample=Image.BICUBIC, center=pivot, expand=False), dtype=np.uint8)
        frame = rotated.copy()
        # REPLACE the body's pixels; do not alpha-composite them, or the body's soft edge picks up the tail's colour
        # and changes from frame to frame.
        frame[body_mask] = pixels[body_mask]
        frames.append(frame)
        print(f"  frame {index}: tail {angle:+6.2f} deg")

    base = frames[0][body_mask]
    same = all(np.array_equal(f[body_mask], base) for f in frames[1:])
    print(f"\nbody pixels ({int(body_mask.sum())}) identical in all four frames: {same}")
    if not same:
        raise SystemExit("the body moved -- the cut or the composite is wrong")

    # One window for all four, so the pixelation scales them all alike and the body keeps its size as well as its place.
    boxes = [content_box(f[:, :, 3] > ALPHA_FLOOR) for f in frames]
    window = (
        min(b[0] for b in boxes) - 2,
        min(b[1] for b in boxes) - 2,
        max(b[2] for b in boxes) + 2,
        max(b[3] for b in boxes) + 2,
    )
    print(f"common window x {window[0]}..{window[2]} y {window[1]}..{window[3]}")
    for index, frame in enumerate(frames, start=1):
        Image.fromarray(frame, "RGBA").crop(
            (window[0], window[1], window[2] + 1, window[3] + 1)
        ).save(out / f"frame-{index}.png")
    print(f"wrote 4 composed frames to {out}")
    print(f"\nnow run:  python scripts/import-sheet.py {args.out} --cols 4 --rows 1   (they are already frame-sized)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

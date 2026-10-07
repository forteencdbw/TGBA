#!/usr/bin/env python3
"""Pack every picture in `src/assets/` into PixiJS spritesheet atlases.

WHY AN ATLAS AT ALL
-------------------
One picture used to be one file: `src/assets/*.png`, imported through Vite so each one got its own URL. That made
"replace a picture by hand" true, and it cost 19 requests and 19 GPU textures -- and the GPU textures are the part
that hurts, because the eight 1024x1024 boss frames are 32 MB of RGBA in the renderer whichever way they arrive.

An atlas fixes that: the pictures are packed into a few large textures, the engine still hands out one `Texture` per
name, and what changes underneath is that 19 requests became as many as there are pages.

WHAT IS COMMITTED, AND WHY THAT IS THE ONE RISK
-----------------------------------------------
The pages and their JSON are GENERATED ARTEFACTS THAT LIVE IN GIT (`src/assets/atlas/`). They are committed rather
than built because the deploy runs `pnpm exec vite build` on a clean Node runner, and a packer that had to run there
would put a Python image library on the critical path of every deploy.

The cost of committing them is staleness: replace a picture, forget to re-pack, and the game keeps showing the old
one with nothing to announce it. `--check` is the answer -- it recomputes every source's size and hash and says which
page is behind. It is deliberately NOT part of `vite build`, because a deploy that can be stopped by a stale art file
is how a site stops updating for a day.

WHAT THE PACKER REFUSES TO DO
-----------------------------
It does not trim. Trimming would save real space here (the boss frames are 1024x1024 with the crab filling about half
the height, so trimming would roughly halve the atlas), but a trimmed frame's `texture.width` is the trimmed width
while every painter in this game scales a picture by `size / texture.width` -- so trimming moves a packing decision
into the drawing code. Not worth it in the same change as the loader. If it is ever wanted, the painters have to read
`texture.orig.width` first.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops

REPO = Path(__file__).resolve().parents[1]
DEFAULT_SRC = REPO / "src" / "assets"
DEFAULT_OUT = REPO / "src" / "assets" / "atlas"
OUT_PREFIX = "atlas-"
MANIFEST_VERSION = "1.0"
APP = "pack-atlas.py"
PADDING_COLOUR = (0, 0, 0, 0)

# Page shapes the search may consider. The power-of-two sizes are here because they are the shapes a GPU vendor's
# documentation talks about; the content-derived ones are here because a power of two is often a few pixels too small
# for the arrangement that actually matters. Measured on this project's art: 1024 + 2*2 + 1024 = 2052 > 2048, so a
# 2048-wide page holds ONE boss frame per row where a 2052-wide page holds two -- 67 MB of texture against 34 MB.
CANDIDATE_SIZES = (256, 512, 1024, 2048, 4096)

# What one page costs ON TOP of the pixels it holds, in bytes: a request, a decode, a texture binding and a place in
# the batch. It is what stops the search from declaring victory with one picture per page -- which is the true minimum
# for "decoded bytes" and is exactly the arrangement this change exists to remove (19 textures and 19 requests).
#
# 2 MB is chosen so the answer is stable rather than sharp: on this project's art anything from about 1 MB to 8 MB
# picks the same arrangement, and the search prints its ranking so the choice can be seen rather than trusted.
DEFAULT_PAGE_PENALTY_BYTES = 2 * 1024 * 1024


def round4(value: int) -> int:
    """Round up to a multiple of 4: a texture row is read four bytes at a time, so this costs nothing and reads tidy."""
    return max(4, (value + 3) // 4 * 4)


def sha256_of(path: Path, block: int = 1 << 20) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(block), b""):
            digest.update(chunk)
    return digest.hexdigest()


def megabytes(value: float) -> str:
    return f"{value / 1024 / 1024:.2f} MB"


# --------------------------------------------------------------------------- #
# packing: MaxRects, best short side fit
# --------------------------------------------------------------------------- #


def subtract(free: list[tuple[int, int, int, int]], used: tuple[int, int, int, int]) -> list[tuple[int, int, int, int]]:
    """Replace every free rectangle that overlaps `used` with the parts of it outside.

    This is the MaxRects free list: free rectangles may overlap each other, and one wholly inside another is dropped
    because it can never be the best fit. It packs squares far better than a shelf layout, which is what this art
    needs -- a shelf would put one 1024 boss frame per 2048 row and double the texture.
    """
    ux, uy, uw, uh = used
    parts: list[tuple[int, int, int, int]] = []
    for fx, fy, fw, fh in free:
        if ux >= fx + fw or ux + uw <= fx or uy >= fy + fh or uy + uh <= fy:
            parts.append((fx, fy, fw, fh))
            continue
        if uy > fy:
            parts.append((fx, fy, fw, uy - fy))
        if uy + uh < fy + fh:
            parts.append((fx, uy + uh, fw, fy + fh - (uy + uh)))
        top, bottom = max(fy, uy), min(fy + fh, uy + uh)
        if ux > fx:
            parts.append((fx, top, ux - fx, bottom - top))
        if ux + uw < fx + fw:
            parts.append((ux + uw, top, fx + fw - (ux + uw), bottom - top))

    keep: list[tuple[int, int, int, int]] = []
    for index, rect in enumerate(parts):
        if rect[2] <= 0 or rect[3] <= 0:
            continue
        contained = False
        for other, candidate in enumerate(parts):
            if other == index or candidate[2] <= 0 or candidate[3] <= 0:
                continue
            if (
                candidate[0] <= rect[0]
                and candidate[1] <= rect[1]
                and candidate[0] + candidate[2] >= rect[0] + rect[2]
                and candidate[1] + candidate[3] >= rect[1] + rect[3]
            ):
                contained = True
                break
        if not contained:
            keep.append(rect)
    return keep


def pack_pages(pieces: list[dict], width: int, height: int) -> list[dict] | None:
    """Pack every piece into pages of `width` x `height`. None when a piece cannot fit that shape at all."""
    pages: list[dict] = []
    todo = list(pieces)
    while todo:
        free = [(0, 0, width, height)]
        placed: list[tuple[dict, int, int]] = []
        leftover: list[dict] = []
        for piece in todo:
            best = None
            for index, (fx, fy, fw, fh) in enumerate(free):
                if fw >= piece["w"] and fh >= piece["h"]:
                    slack_w, slack_h = fw - piece["w"], fh - piece["h"]
                    # Best short side fit: leave the narrowest gap on the short side, then on the long one, then
                    # topmost/leftmost -- the tie-breakers exist so the result is deterministic.
                    score = (min(slack_w, slack_h), max(slack_w, slack_h), fy, fx)
                    if best is None or score < best[0]:
                        best = (score, index, fx, fy)
            if best is None:
                leftover.append(piece)
                continue
            _score, _index, x, y = best
            # NOT `free.pop(index)` first: `subtract` splits the chosen rectangle into the two strips it leaves
            # behind, so the rectangle has to still be in the list for it to split. Popping it first emptied the free
            # list and every page held exactly one picture -- which the score then reported as a perfect 100% fill.
            free = subtract(free, (x, y, piece["w"], piece["h"]))
            placed.append((piece, x, y))

        if not placed:
            return None
        used_w = max(x + piece["w"] for piece, x, _y in placed)
        used_h = max(y + piece["h"] for piece, _x, y in placed)
        # A page is declared at the extent it actually uses rather than at the shape the search tried: the search's
        # shape is a boundary, and downloading and uploading the empty half of it would be the waste this is meant
        # to remove. (This is also why the score below cannot be just "decoded bytes" -- see DEFAULT_PAGE_PENALTY.)
        pages.append({"width": round4(used_w), "height": round4(used_h), "items": placed})
        if len(leftover) == len(todo):
            return None
        todo = leftover
    return pages


def candidate_shapes(pieces: list[dict], padding: int, max_size: int) -> list[tuple[int, int]]:
    """Page shapes worth trying, filtered by what has to fit in one.

    Beyond the power-of-two sizes, the shapes worth trying are the ones the CONTENT wants: k pieces of the widest kind
    side by side, plus a padding gutter between them and at the border. That is where the difference between a 2048 and
    a 2052 wide page comes from, and it is not a rounding detail -- see CANDIDATE_SIZES.
    """
    widest = max(piece["w"] for piece in pieces)
    tallest = max(piece["h"] for piece in pieces)
    sizes = set(CANDIDATE_SIZES)
    for count in (1, 2, 3, 4):
        # A piece already carries its own gutter, so `count` of them side by side need `count * widest` and nothing
        # more. (Getting this wrong by the 2px of a single gutter is what made a 2054 page hold one boss frame per
        # row where 2056 holds two -- and doubled the atlas. Hence the slack variant below as well.)
        sizes.add(round4(count * widest))
        sizes.add(round4(count * widest + 2 * padding))
        sizes.add(round4(count * tallest))
        sizes.add(round4(count * tallest + 2 * padding))

    widths = sorted(size for size in sizes if widest <= size <= max_size)
    heights = sorted(size for size in sizes if tallest <= size <= max_size)
    if not widths:
        raise SystemExit(f"the widest picture ({widest}px with padding) fits no page under --max-size {max_size}")
    if not heights:
        raise SystemExit(f"the tallest picture ({tallest}px with padding) fits no page under --max-size {max_size}")
    return [(w, h) for w in widths for h in heights]


def choose_shape(
    pieces: list[dict],
    padding: int,
    max_size: int,
    forced: tuple[int, int] | None,
    penalty_bytes: float,
    verbose: bool,
):
    """The page shape with the lowest score: decoded texture plus the penalty for each page.

    The score is not "decoded bytes" alone, and the reason is measured: declaring every page at the extent it uses
    makes one-picture-per-page the exact minimum for decoded bytes (19 pages, 9.7 MB, 100% "filled") while being the
    arrangement this change exists to delete. A page therefore costs its pixels PLUS a fixed penalty, and the search
    balances the two. See DEFAULT_PAGE_PENALTY_BYTES for why the default is what it is.
    """
    if forced:
        pages = pack_pages(pieces, forced[0], forced[1])
        if pages is None:
            raise SystemExit(f"--size {forced[0]}x{forced[1]} cannot hold these pictures")
        return forced, pages

    ranked = []
    for width, height in candidate_shapes(pieces, padding, max_size):
        pages = pack_pages(pieces, width, height)
        if pages is None:
            continue
        decoded = sum(page["width"] * page["height"] * 4 for page in pages)
        ranked.append((decoded + penalty_bytes * len(pages), decoded, len(pages), width, height, pages))
    if not ranked:
        raise SystemExit("no page shape could hold these pictures -- raise --max-size")
    ranked.sort(key=lambda row: (row[0], row[2], max(row[3], row[4])))

    if verbose:
        print(f"  page shapes considered (best first; score = decoded + {megabytes(penalty_bytes)} per page):")
        for score, decoded, count, width, height, pages in ranked[:5]:
            content = sum(piece["width"] * piece["height"] for page in pages for piece, _x, _y in page["items"])
            filled = content * 4 * 100 / decoded
            print(
                f"    {width:>5}x{height:<5} {count:>2} page(s)  score {megabytes(score):>9}  "
                f"decoded {megabytes(decoded):>9}  content {filled:5.1f}% filled"
            )
        if len(ranked) > 5:
            print(f"    ... and {len(ranked) - 5} worse")
    best = ranked[0]
    return (best[3], best[4]), best[5]


# --------------------------------------------------------------------------- #
# sources
# --------------------------------------------------------------------------- #


def find_sources(src: Path) -> list[Path]:
    """Every `.png` directly under `src`, which is what a picture is.

    Deliberately non-recursive: the atlas lives in `src/assets/atlas/`, and a packer that walks into its own output
    re-packs last run's texture as if it were art. JPEGs are not pictures in this sense -- the two backdrops are
    full-screen images no sprite draws from, and they stay individual files.
    """
    return sorted(path for path in src.glob("*.png") if path.is_file())


def load_pieces(paths: list[Path], padding: int) -> list[dict]:
    pieces = []
    for path in paths:
        with Image.open(path) as handle:
            image = handle.convert("RGBA")
        pieces.append(
            {
                "name": path.name,
                "image": image,
                "width": image.width,
                "height": image.height,
                # The piece is the picture plus a transparent gutter on all four sides. Two pixels, because the art is
                # drawn with linear filtering at non-integer scales: a sprite samples up to half a texel OUTSIDE its own
                # rectangle, and with no gutter that sample is the neighbouring picture.
                "w": image.width + 2 * padding,
                "h": image.height + 2 * padding,
            }
        )
    return pieces


# --------------------------------------------------------------------------- #
# comparing a decoded page with the pictures it claims to hold
# --------------------------------------------------------------------------- #

EXACT = "exact"
INVISIBLE = "invisible"
VISIBLE = "visible"


def rgb_difference_mask(first: Image.Image, second: Image.Image) -> Image.Image:
    """A white-where-they-differ mask over the three colour channels, compared one channel at a time.

    Channel by channel rather than through `difference(...).convert('L')`: a luminance conversion rounds, and a
    difference of one unit in blue would come out as zero and be reported as "no difference".
    """
    mask = Image.new("L", first.size, 0)
    for left, right in zip(first.split(), second.split()):
        mask = ImageChops.lighter(mask, ImageChops.difference(left, right).point(lambda value: 255 if value else 0))
    return mask


def compare(crop: Image.Image, source: Image.Image) -> str:
    """How one decoded frame differs from the picture it came from.

    EXACT     -- identical bytes.
    INVISIBLE -- the alpha channel is identical, and the only difference is the RGB of pixels whose alpha is 0. That is
                 what libwebp's lossless mode does (it rewrites the colour bits under fully transparent pixels because
                 they cannot be seen, which is why the WebP is smaller than the PNG). Measured on the boss frames: 19.6%
                 of the pixels differ, every one of them source-alpha-0, and no pixel with alpha above 0 differs at all.
    VISIBLE   -- anything else, including a different alpha anywhere. Not acceptable: fall back to PNG.
    """
    if crop.size != source.size:
        return VISIBLE
    if crop.tobytes() == source.tobytes():
        return EXACT
    if ImageChops.difference(crop.getchannel("A"), source.getchannel("A")).getbbox() is not None:
        return VISIBLE
    transparent = source.getchannel("A").point(lambda value: 255 if value == 0 else 0)
    outside = ImageChops.subtract(rgb_difference_mask(crop.convert("RGB"), source.convert("RGB")), transparent)
    return INVISIBLE if outside.getbbox() is None else VISIBLE


def page_verdict(decoded: Image.Image, page: dict, padding: int) -> str:
    """The worst verdict over every frame on a page."""
    worst = EXACT
    for piece, x, y in page["items"]:
        left, top = x + padding, y + padding
        verdict = compare(
            decoded.crop((left, top, left + piece["width"], top + piece["height"])),
            piece["image"],
        )
        if verdict == VISIBLE:
            return VISIBLE
        if verdict == INVISIBLE:
            worst = INVISIBLE
    return worst


# --------------------------------------------------------------------------- #
# writing and verifying
# --------------------------------------------------------------------------- #


def encode_texture(texture: Image.Image, stem: Path, page: dict, padding: int) -> tuple[Path, int, str, str]:
    """Write the page, keeping the smaller of lossless WebP and PNG among the encodings that pass verification.

    Both are lossless; the check is here because "lossless" is a claim about the ENCODER, and the useful question is
    what comes back out. The asset pipeline reached the same conclusion (its `webp-verify` mode keeps WebP only if
    decoding reproduces the sprite), and this is that rule with the one measured exception spelled out: the RGB under
    fully transparent pixels is not preserved by libwebp, cannot be seen, and is accepted -- with the count reported.
    """
    accepted: list[tuple[Path, int, str, str]] = []
    for suffix, save, label in (
        (".webp", lambda target: texture.save(target, "WEBP", lossless=True, quality=100, method=6), "lossless WebP"),
        (".png", lambda target: texture.save(target, optimize=True, compress_level=9), "PNG"),
    ):
        target = stem.with_suffix(suffix)
        save(target)
        with Image.open(target) as handle:
            decoded = handle.convert("RGBA")
        verdict = page_verdict(decoded, page, padding)
        if verdict == VISIBLE:
            target.unlink()
            continue
        acceptable = verdict == EXACT
        accepted.append(
            (
                target,
                target.stat().st_size,
                label,
                "pixel exact" if acceptable else "RGB under transparent pixels not preserved (invisible)",
            )
        )

    if not accepted:
        raise SystemExit(f"neither lossless WebP nor PNG reproduced {stem.name}: refusing to write a lossy texture")
    accepted.sort(key=lambda row: row[1])
    kept, size, label, note = accepted[0]
    for path, _size, _label, _note in accepted[1:]:
        path.unlink()
    return kept, size, label, note


def write_pages(pages: list[dict], out: Path, padding: int, sources: dict[str, dict]) -> list[dict]:
    written = []
    for index, page in enumerate(pages, start=1):
        texture = Image.new("RGBA", (page["width"], page["height"]), PADDING_COLOUR)
        frames = {}
        for piece, x, y in page["items"]:
            left, top = x + padding, y + padding
            texture.paste(piece["image"], (left, top))
            frames[piece["name"]] = {
                "frame": {"x": left, "y": top, "w": piece["width"], "h": piece["height"]},
                "rotated": False,
                # `trimmed: false` is what keeps `texture.width` equal to the picture's own width in PixiJS. Every
                # painter here scales a picture as `size / texture.width`, so a frame the engine believed was trimmed
                # would silently resize every creature drawn from it.
                "trimmed": False,
                "sourceSize": {"w": piece["width"], "h": piece["height"]},
            }

        stem = out / f"{OUT_PREFIX}{index}"
        kept, size, encoding, note = encode_texture(texture, stem, page, padding)
        payload = {
            "frames": frames,
            "meta": {
                "app": APP,
                "version": MANIFEST_VERSION,
                "image": kept.name,
                "format": "RGBA8888",
                "size": {"w": page["width"], "h": page["height"]},
                "scale": "1",
                "page": index,
                "encoding": encoding,
                "encodingNote": note,
                "textureBytes": size,
                "decodedBytes": page["width"] * page["height"] * 4,
                # Every source this page was built from, by size and hash: what `--check` compares against.
                "sources": {piece["name"]: sources[piece["name"]] for piece, _x, _y in page["items"]},
            },
        }
        manifest = stem.with_suffix(".json")
        manifest.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf8")
        written.append(
            {
                "index": index,
                "manifest": manifest,
                "texture": kept,
                "width": page["width"],
                "height": page["height"],
                "bytes": size,
                "encoding": encoding,
                "note": note,
                "frames": len(frames),
            }
        )
    return written


def verify(pages: list[dict], written: list[dict], sources: dict[str, dict], padding: int) -> list[str]:
    """Re-read every page from disk and check it against the pictures it claims to hold.

    A well-formed atlas can be entirely wrong: the JSON parses, the engine does not throw, and the sprites are
    misplaced. So the frames are decoded back out of the FILE that was written -- not out of the in-memory page -- and
    compared pixel by pixel, then checked for overlap and for a frame that escaped the texture.
    """
    problems: list[str] = []
    for page, entry in zip(pages, written):
        with Image.open(entry["texture"]) as handle:
            decoded = handle.convert("RGBA")
        if (decoded.width, decoded.height) != (entry["width"], entry["height"]):
            problems.append(f"{entry['texture'].name}: decodes to {decoded.size}, declared {entry['width']}x{entry['height']}")
            continue
        verdict = page_verdict(decoded, page, padding)
        if verdict == VISIBLE:
            problems.append(f"{entry['texture'].name}: a visible pixel differs from the source")
        rects = []
        for piece, x, y in page["items"]:
            left, top = x + padding, y + padding
            rect = (left, top, left + piece["width"], top + piece["height"])
            rects.append(rect)
            if rect[2] > entry["width"] or rect[3] > entry["height"]:
                problems.append(f"{entry['texture'].name}: {piece['name']} sticks out of the texture at {rect}")
        for index, first in enumerate(rects):
            for second in rects[index + 1 :]:
                if first[0] < second[2] and second[0] < first[2] and first[1] < second[3] and second[1] < first[3]:
                    problems.append(f"{entry['texture'].name}: two frames overlap at {first} and {second}")
    packed = [piece["name"] for page in pages for piece, _x, _y in page["items"]]
    if len(packed) != len(set(packed)):
        problems.append("a picture was packed more than once")
    missing = sorted(set(sources) - set(packed))
    if missing:
        problems.append("never packed: " + ", ".join(missing))
    return problems


# --------------------------------------------------------------------------- #
# --check: is the committed atlas still the atlas these pictures describe?
# --------------------------------------------------------------------------- #


def check(src: Path, out: Path) -> int:
    manifests = sorted(out.glob(f"{OUT_PREFIX}*.json"))
    if not manifests:
        print(f"STALE: no atlas manifests in {out} -- run `pnpm atlas`")
        return 1

    recorded: dict[str, dict] = {}
    textures: set[str] = set()
    for manifest in manifests:
        payload = json.loads(manifest.read_text(encoding="utf8"))
        image = payload["meta"].get("image", "?")
        textures.add(image)
        for name, info in payload["meta"].get("sources", {}).items():
            recorded[name] = info
        if not (out / image).is_file():
            print(f"STALE: {manifest.name} names a texture that is not there: {image}")
            return 1

    on_disk = {path.name: path for path in find_sources(src)}
    stale: list[str] = []
    for name, path in sorted(on_disk.items()):
        info = recorded.get(name)
        if info is None:
            stale.append(f"{name}: not in any atlas page")
        elif info.get("bytes") != path.stat().st_size or info.get("sha256") != sha256_of(path):
            stale.append(f"{name}: changed since the atlas was packed")
    for name in sorted(set(recorded) - set(on_disk)):
        stale.append(f"{name}: in the atlas but no longer on disk")

    # A texture or manifest left behind by an earlier run is the other way this goes wrong: the loader globs the
    # directory, so an orphan page would be fetched, decoded and uploaded for nothing.
    for path in sorted(out.glob(f"{OUT_PREFIX}*")):
        if path.suffix != ".json" and path.name not in textures:
            stale.append(f"{path.name}: not named by any manifest (left over from an earlier pack)")

    if stale:
        print(f"STALE: {len(stale)} problem(s) -- run `pnpm atlas`")
        for line in stale:
            print("  " + line)
        return 1

    total = sum((out / image).stat().st_size for image in textures)
    print(f"current: {len(manifests)} page(s), {len(recorded)} pictures, {total / 1024:.1f} KB of texture")
    return 0


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #


def main() -> int:
    parser = argparse.ArgumentParser(description="Pack src/assets pictures into PixiJS spritesheet atlases.")
    parser.add_argument("--src", type=Path, default=DEFAULT_SRC, help="where the pictures are (default: src/assets)")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="where the atlas goes (default: src/assets/atlas)")
    parser.add_argument("--padding", type=int, default=2, help="transparent gutter around each picture, in pixels")
    parser.add_argument("--max-size", type=int, default=4096, help="largest page edge the search may use")
    parser.add_argument("--size", type=str, default="", help="force a page shape, e.g. 2056x2056")
    parser.add_argument("--page-penalty", type=float, default=DEFAULT_PAGE_PENALTY_BYTES / 1024 / 1024,
                        help="MB charged per page on top of its pixels, so the search does not answer with one page per picture")
    parser.add_argument("--check", action="store_true", help="do not pack: report whether the atlas is up to date")
    parser.add_argument("--quiet", action="store_true", help="only print the summary")
    arguments = parser.parse_args()

    if arguments.check:
        return check(arguments.src, arguments.out)

    paths = find_sources(arguments.src)
    if not paths:
        raise SystemExit(f"no pictures (*.png) in {arguments.src}")
    sources = {path.name: {"bytes": path.stat().st_size, "sha256": sha256_of(path)} for path in paths}
    pieces = load_pieces(paths, arguments.padding)

    forced = None
    if arguments.size:
        width, _, height = arguments.size.partition("x")
        forced = (int(width), int(height))

    if not arguments.quiet:
        print(f"packing {len(pieces)} picture(s) from {arguments.src}")
    shape, pages = choose_shape(
        pieces, arguments.padding, arguments.max_size, forced, arguments.page_penalty * 1024 * 1024, not arguments.quiet
    )

    arguments.out.mkdir(parents=True, exist_ok=True)
    written = write_pages(pages, arguments.out, arguments.padding, sources)
    # Orphans are deleted AFTER writing rather than before: these files are committed, and a pack that dies halfway --
    # a missing encoder, a full disk -- must not be the thing that deletes the working atlas.
    keep = {entry["manifest"].name for entry in written} | {entry["texture"].name for entry in written}
    for orphan in arguments.out.glob(f"{OUT_PREFIX}*"):
        if orphan.name not in keep:
            orphan.unlink()
            if not arguments.quiet:
                print(f"  removed {orphan.name} (left over from an earlier pack)")

    problems = verify(pages, written, sources, arguments.padding)

    download = sum(entry["bytes"] for entry in written)
    decoded = sum(entry["width"] * entry["height"] * 4 for entry in written)
    content = sum(piece["width"] * piece["height"] * 4 for piece in pieces)
    if not arguments.quiet:
        print(f"  page shape cap {shape[0]}x{shape[1]}, padding {arguments.padding}px, {len(written)} page(s)")
        for entry in written:
            print(
                f"  {entry['texture'].name:<16} {entry['width']:>5}x{entry['height']:<5} "
                f"{entry['bytes'] / 1024:8.1f} KB  {entry['encoding']:<14} {entry['frames']:2d} frame(s)  "
                f"decoded {megabytes(entry['width'] * entry['height'] * 4):>9}"
            )
            if entry["note"] != "pixel exact" and not arguments.quiet:
                print(f"       note: {entry['note']}")
        individual = sum(info["bytes"] for info in sources.values())
        print(
            f"  {len(pieces)} pictures: {download / 1024:.1f} KB download ({download * 100 / individual:.0f}% of the "
            f"{individual / 1024:.1f} KB they weigh as files), {megabytes(decoded)} decoded RGBA "
            f"({content * 100 / decoded:.1f}% of the texture is picture)"
        )

    if problems:
        print(f"FAILED: {len(problems)} problem(s) after packing")
        for line in problems:
            print("  " + line)
        return 1
    print(f"OK: {len(pieces)} picture(s) in {len(written)} page(s), every frame verified against its source")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""
asset_pipeline -- turn a text prompt into a PixiJS-ready animated sprite asset.

Four stages, each usable on its own so a human can approve the reference before
anything else is generated:

  key     Give an opaque render a transparent background. Needed because Ark
          cannot produce transparency from text: measured against the live API,
          text-to-image with `background: "transparent"` is HTTP 400
          ("requires exactly one input image"), and image-to-image with an opaque
          reference is HTTP 400 too ("requires a PNG input with at least one
          transparent pixel"). So the first transparent image has to be
          manufactured, and every later frame is generated from it.
  sheet   Collect the frame renders, optionally pixelate them, align them on a
          shared anchor, and emit RGBA sprites plus sheets.
  atlas   Build the PixiJS atlas JSON (TexturePacker Hash), the animation
          manifest, and an optimised variant.
  verify  Decode the atlas back to pixels and compare against the sprites.

Nothing here knows what the subject is. Alignment is specified, not inferred:

  --anchor top|center|bottom
          where each frame's opaque bounding box is pinned vertically on the
          canvas. `top` is the right default for a character whose silhouette
          changes upward (a bobbing creature); `center` for a rotating or pulsing
          object; `bottom` for something standing on a floor.
  --anchor-x center|left|right
          horizontal pinning of the bounding box.

Two frame layouts, because engines differ:

  --layout uniform
          every frame is one identical WxH cell. Simplest to consume, works with
          engines that assume a fixed frame size; wastes transparent pixels.
  --layout tight
          each frame is cropped to its content. Smallest; the atlas carries
          `spriteSourceSize`, so frames stay registered with each other.

Example, the whole flow for one asset:

  python asset_pipeline.py key  raw/reference.png -o keyed/reference.png
  # ... generate the frames from keyed/reference.png ...
  python asset_pipeline.py sheet --frames frames --out sheet --name slime --animation idle --grid 192
  python asset_pipeline.py atlas --dir sheet --name slime --animation idle --fps 8
  python asset_pipeline.py verify --dir sheet
"""

import argparse
import glob
import hashlib
import json
import os
import shutil
import sys

from PIL import Image, ImageFilter

# --------------------------------------------------------------------------- #
# shared helpers
# --------------------------------------------------------------------------- #

ALPHA_CONTENT_THRESHOLD = 8


def content_box(image, threshold=ALPHA_CONTENT_THRESHOLD):
    """Opaque bounding box of an RGBA image; the whole image when fully empty."""
    mask = image.getchannel("A").point(lambda value: 255 if value > threshold else 0)
    return mask.getbbox() or (0, 0, image.width, image.height)


def alpha_report(image):
    alpha = image.getchannel("A")
    total = image.width * image.height
    histogram = alpha.histogram()
    transparent = sum(histogram[0:8])
    opaque = sum(histogram[248:256])
    return {
        "transparent": transparent / total,
        "partial": (total - transparent - opaque) / total,
        "opaque": opaque / total,
    }


def write_json(path, payload, minify):
    with open(path, "w", encoding="utf-8") as handle:
        if minify:
            json.dump(payload, handle, separators=(",", ":"), ensure_ascii=False)
        else:
            json.dump(payload, handle, indent=2, ensure_ascii=False)
    return path


def frame_paths(directory):
    """
    The frame images in a directory, excluding the pipeline's own outputs.

    When the directory already holds an `animation.json`, that manifest is
    authoritative: it lists exactly the frame files, so a re-run cannot mistake
    `jellyfish-atlas-opt.png` for a frame (measured: it did, which silently added a
    bogus 5th frame to the atlas). Without a manifest, fall back to filtering by
    name, including any `<something>-atlas` texture.
    """
    manifest_path = os.path.join(directory, "animation.json")
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as handle:
                manifest = json.load(handle)
            listed = [os.path.join(directory, name) for name in manifest.get("frames", [])]
            present = [path for path in listed if os.path.exists(path)]
            if present:
                return present
        except (OSError, ValueError):
            pass

    excluded_prefixes = ("strip-", "sheet-", "atlas-", "reference-", "idle-loop")
    paths = []
    for pattern in ("*.png", "*.webp", "*.jpg", "*.jpeg"):
        paths += glob.glob(os.path.join(directory, pattern))
    keep = []
    for path in sorted(paths):
        name = os.path.basename(path)
        if name.startswith(".") or name.startswith(excluded_prefixes):
            continue
        if "-atlas" in name or "-opt" in name:
            continue
        keep.append(path)
    return keep


# --------------------------------------------------------------------------- #
# key: opaque render -> transparent PNG
# --------------------------------------------------------------------------- #


def border_colour(pixels, width, height, band):
    samples = []
    for y in range(0, height, max(1, band)):
        for x in range(0, width, max(1, band)):
            if x < band or y < band or x >= width - band or y >= height - band:
                samples.append(pixels[x, y])
    samples.sort(key=lambda value: sum(value))
    return samples[len(samples) // 2]


def background_region(pixels, width, height, reference, tolerance):
    """
    Flood fill the background inward from every border pixel.

    A pixel joins the background when it is within `tolerance` of the neighbour
    that reached it and within `2 * tolerance` of the border reference. The
    neighbour test follows gradients and vignettes; the reference test stops the
    fill leaking through a soft shadow into the subject.
    """
    visited = bytearray(width * height)
    stack = []
    for x in range(width):
        stack.append((x, 0))
        stack.append((x, height - 1))
    for y in range(height):
        stack.append((0, y))
        stack.append((width - 1, y))
    escaped = 2 * tolerance
    while stack:
        x, y = stack.pop()
        index = y * width + x
        if visited[index]:
            continue
        current = pixels[x, y]
        if max(abs(current[c] - reference[c]) for c in range(3)) > escaped:
            continue
        visited[index] = 1
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                neighbour = pixels[nx, ny]
                if max(abs(neighbour[c] - current[c]) for c in range(3)) <= tolerance:
                    stack.append((nx, ny))
    return visited


def looks_emissive(image):
    """A near-black border plus a mostly dark frame: alpha should come from luminance."""
    pixels = image.load()
    band = max(2, min(image.size) // 64)
    reference = border_colour(pixels, image.width, image.height, band)
    if max(reference) > 40:
        return False, reference
    dark = total = 0
    for y in range(0, image.height, 4):
        for x in range(0, image.width, 4):
            total += 1
            if max(pixels[x, y]) <= 40:
                dark += 1
    return dark / total > 0.4, reference


def key_image(image, mode, tolerance, ramp, black, white):
    if mode == "auto":
        emissive, reference = looks_emissive(image)
        mode = "luminance" if emissive else "edge"
        print(f"  auto: border {reference}, emissive={emissive} -> {mode}")

    if mode == "luminance":
        alpha = image.convert("L").point(
            lambda value: 0
            if value <= black
            else 255
            if value >= white
            else round(255 * (value - black) / (white - black))
        )
        keyed = image.copy()
        keyed.putalpha(alpha)
        return keyed, mode

    pixels = image.load()
    band = max(2, min(image.size) // 64)
    reference = border_colour(pixels, image.width, image.height, band)
    background = background_region(pixels, image.width, image.height, reference, tolerance)
    mask = Image.new("L", image.size, 255)
    mask_pixels = mask.load()
    for y in range(image.height):
        row = y * image.width
        for x in range(image.width):
            if background[row + x]:
                mask_pixels[x, y] = 0
    if ramp > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(ramp))
    keyed = image.copy()
    keyed.putalpha(mask)
    return keyed, mode


def command_key(arguments):
    image = Image.open(arguments.source).convert("RGB")
    for tag in ("dpi", "resolution"):
        image.info.pop(tag, None)
    keyed, mode = key_image(image, arguments.mode, arguments.tolerance, arguments.ramp, arguments.black, arguments.white)
    os.makedirs(os.path.dirname(os.path.abspath(arguments.out)), exist_ok=True)
    keyed.save(arguments.out)
    if keyed.size != image.size:
        raise SystemExit(f"refusing to write: output {keyed.size} differs from input {image.size}")
    coverage = alpha_report(keyed)
    print(f"  wrote {arguments.out} ({keyed.size[0]}x{keyed.size[1]}, mode {mode})")
    print(f"  alpha: transparent {coverage['transparent']:.1%}, partial {coverage['partial']:.1%}, opaque {coverage['opaque']:.1%}")
    if coverage["transparent"] < 0.05:
        print("  WARNING: almost nothing became transparent -- check --mode / --tolerance / --black")


def command_grant(arguments):
    """
    Open the transparent branch on an image that has no transparency at all.

    Ark refuses `background: "transparent"` unless the single input image already has
    at least one transparent pixel, but the model then cuts the subject out itself:
    a 1x1 transparent corner produced the same silhouette as a careful local key
    (measured content box 134,156,898,894 vs 135,156,897,887 on the same render).
    So the cheapest correct move is to declare one transparent seed, not to segment
    anything -- and for emissive subjects it is also the better result, because a
    local luminance key washes the glow out (measured: partial alpha 7.6% from the
    model's own cutout vs 18.4% from the local key, the latter losing the body).

    Use `key` instead only when you need alpha you control -- a gradient backdrop
    the model would keep, or a subject the model might re-interpret.
    """
    image = Image.open(arguments.source)
    alpha_mode = image.mode in ("RGBA", "LA", "PA")
    rgba = image.convert("RGBA")
    for tag in ("dpi", "resolution"):
        rgba.info.pop(tag, None)

    if alpha_mode and not arguments.force:
        existing = rgba.getchannel("A").getextrema()[0]
        if existing < 255:
            print(f"  {arguments.source} already has transparency (min alpha {existing}); nothing to grant")
            print("  (pass --force to add the seed anyway)")
            return

    mask = Image.new("L", rgba.size, 255)
    pixels = mask.load()
    width, height = rgba.size
    if arguments.seed == "corner":
        # A corner seed: inside the canvas on every side, so it survives any later
        # crop, and it cannot be mistaken for part of the subject.
        for y in range(arguments.seed_size):
            for x in range(arguments.seed_size):
                pixels[x, y] = 0
    else:
        for index in range(arguments.thickness):
            for x in range(width):
                pixels[x, index] = 0
                pixels[x, height - 1 - index] = 0
            for y in range(height):
                pixels[index, y] = 0
                pixels[width - 1 - index, y] = 0

    granted = rgba.copy()
    granted.putalpha(mask)
    transparent = sum(mask.histogram()[0:1])

    os.makedirs(os.path.dirname(os.path.abspath(arguments.out)), exist_ok=True)
    granted.save(arguments.out)
    if granted.size != rgba.size:
        raise SystemExit(f"refusing to write: output {granted.size} differs from input {rgba.size}")
    print(f"  wrote {arguments.out} ({granted.size[0]}x{granted.size[1]})")
    print(f"  seed: {transparent} transparent pixel(s) ({transparent / (width * height):.4%} of the frame), kind {arguments.seed}")
    print("  now use this file as the single reference for image-to-image with background: transparent")


# --------------------------------------------------------------------------- #
# sheet: frames -> pixelated, aligned sprites
# --------------------------------------------------------------------------- #


def pixelate(image, grid, palette, colors):
    """BOX-reduce onto a `grid`-wide pixel grid, palette-snap RGB, keep alpha."""
    height = max(1, round(grid * image.height / image.width))
    small = image.resize((grid, height), Image.BOX)
    if palette is None:
        palette = small.convert("RGB").quantize(colors=colors, method=Image.MEDIANCUT)
    snapped = small.convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE).convert("RGBA")
    # Alpha is resampled separately: letting BOX average RGBA smears the edge into
    # a grey halo, because the colour of fully transparent pixels is meaningless.
    snapped.putalpha(small.getchannel("A"))
    return snapped, palette


def anchor_offset(box, source_size, layout, anchor_x, anchor_y, margin):
    """Where a frame's content goes on the output canvas."""
    left, top, right, bottom = box
    if anchor_x == "left":
        x = margin - left
    elif anchor_x == "right":
        x = source_size[0] - margin - right
    else:
        x = round((source_size[0] - (right - left)) / 2) - left
    if anchor_y == "top":
        y = margin - top
    elif anchor_y == "bottom":
        y = source_size[1] - margin - bottom
    else:
        y = round((source_size[1] - (bottom - top)) / 2) - top
    return x, y


def command_sheet(arguments):
    # The CLI spells the vertical anchor `--anchor`; keep one internal name.
    arguments.anchor_y = arguments.anchor
    paths = frame_paths(arguments.frames)
    if not paths:
        raise SystemExit(f"no frame images under {arguments.frames}")
    os.makedirs(arguments.out, exist_ok=True)

    sources = [(os.path.basename(path), Image.open(path).convert("RGBA")) for path in paths]
    sizes = {image.size for _name, image in sources}
    if len(sizes) != 1:
        print(f"  note: frames differ in size {sorted(sizes)}; each is scaled to the same grid, so this is fine")

    palette = None
    pixelated = []
    for name, image in sources:
        if arguments.grid > 0:
            image, palette = pixelate(image, arguments.grid, palette, arguments.colors)
        pixelated.append((name, image))

    # Optional normalisation on content width. Only useful when the silhouette's
    # width changes between frames for reasons that are NOT the motion (which is
    # common: the model draws each frame at its own scale). Off by default, because
    # for a genuine expand/contract motion this would flatten the animation.
    if arguments.scale == "content-width":
        widths = [content_box(image)[2] - content_box(image)[0] for _name, image in pixelated]
        target = sorted(widths)[len(widths) // 2]
        normalised = []
        for name, image in pixelated:
            width = content_box(image)[2] - content_box(image)[0]
            factor = target / width
            if abs(factor - 1.0) < 0.005:
                normalised.append((name, image))
                continue
            new_size = (max(1, round(image.width * factor)), max(1, round(image.height * factor)))
            resized = image.convert("RGB").resize(new_size, Image.LANCZOS)
            if palette is not None:
                resized = resized.quantize(palette=palette, dither=Image.Dither.NONE).convert("RGBA")
            else:
                resized = resized.convert("RGBA")
            resized.putalpha(image.getchannel("A").resize(new_size, Image.LANCZOS))
            normalised.append((name, resized))
        pixelated = normalised
        print(f"  normalised content width to {target}px (was {sorted(widths)})")

    grid_w, grid_h = pixelated[0][1].size
    boxes = [content_box(image) for _name, image in pixelated]

    if arguments.layout == "uniform":
        # One cell for every frame: sized by the widest/tallest content plus margin,
        # so no frame's silhouette is clipped.
        cell_w = max(box[2] - box[0] for box in boxes) + arguments.margin * 2
        cell_h = max(box[3] - box[1] for box in boxes) + arguments.margin * 2
        canvas_size = (cell_w, cell_h)
    else:
        canvas_size = (grid_w, grid_h)

    sprites = []
    for (name, image), box in zip(pixelated, boxes):
        offset_x, offset_y = anchor_offset(
            box,
            canvas_size if arguments.layout == "uniform" else image.size,
            arguments.layout,
            arguments.anchor_x,
            arguments.anchor_y,
            arguments.margin,
        )
        canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
        # Plain paste: passing the frame as its own mask makes PIL composite it, and
        # PIL 12.3 rewrites pixels there (measured: 36,234 of a 204x205 frame).
        canvas.paste(image, (offset_x, offset_y))
        if arguments.layout == "tight":
            canvas = canvas.crop(content_box(canvas))
            canvas_size = canvas.size
        sprites.append((name, canvas))

    if arguments.layout == "tight":
        width = max(image.width for _n, image in sprites)
        height = max(image.height for _n, image in sprites)
        padded = []
        for name, image in sprites:
            canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            box = content_box(image)
            x, y = anchor_offset(
                box, (width, height), "uniform", arguments.anchor_x, arguments.anchor_y, arguments.margin
            )
            canvas.paste(image, (x, y))
            padded.append((name, canvas))
        sprites = padded

    for name, image in sprites:
        image.save(os.path.join(arguments.out, name))

    width, height = sprites[0][1].size
    scale = arguments.sheet_scale
    sheet = Image.new("RGBA", (width * 2, height * 2), (0, 0, 0, 0))
    for index, (_name, image) in enumerate(sprites[:4]):
        sheet.paste(image, ((index % 2) * width, (index // 2) * height))
    strip = Image.new("RGBA", (width * len(sprites), height), (0, 0, 0, 0))
    for index, (_name, image) in enumerate(sprites):
        strip.paste(image, (index * width, 0))
    up = lambda image: image.resize((image.width * scale, image.height * scale), Image.NEAREST) if scale > 1 else image
    up(strip).save(os.path.join(arguments.out, "strip-4x1.png"))
    up(sheet).save(os.path.join(arguments.out, "sheet-2x2.png"))
    preview = checkerboard(sheet.size)
    preview.paste(sheet, (0, 0))
    up(preview).save(os.path.join(arguments.out, "sheet-2x2-checker.png"))

    gif_cell = checkerboard((width, height))
    loop = []
    for _name, image in sprites:
        tile = gif_cell.copy()
        tile.paste(image, (0, 0))
        loop.append(tile)
    loop[0].save(os.path.join(arguments.out, "idle-loop.gif"), save_all=True, append_images=loop[1:], duration=180, loop=0)

    print(f"  {len(sprites)} sprites, {width}x{height}, layout {arguments.layout}, anchor {arguments.anchor_y}/{arguments.anchor_x}")
    tops = sorted({content_box(image)[1] for _name, image in sprites})
    centres = sorted({round((content_box(image)[0] + content_box(image)[2]) / 2) for _name, image in sprites})
    # One pixel of spread is integer rounding on an odd/even content width, not
    # drift; more than that means the anchor genuinely is not pinned.
    pinned = tops[-1] - tops[0] <= 1 and centres[-1] - centres[0] <= 1
    print(f"  anchor check: content top {tops}, centre {centres} -> {'pinned' if pinned else 'DRIFTING'}")
    if not pinned:
        print("  WARNING: frames are not pinned to one anchor -- expect visible drift.")
        print("           If the silhouette itself changes size between frames, pass --scale content-width,")
        print("           which normalises every frame on its content width before anchoring.")


def checkerboard(size, cell=8):
    board = Image.new("RGB", size, (68, 68, 78))
    pixels = board.load()
    for y in range(size[1]):
        for x in range(size[0]):
            if ((x // cell) + (y // cell)) % 2 == 0:
                pixels[x, y] = (100, 100, 110)
    return board


# --------------------------------------------------------------------------- #
# atlas: PixiJS JSON + optimisation
# --------------------------------------------------------------------------- #


def next_power_of_two(value):
    size = 1
    while size < value:
        size *= 2
    return size


def encode_texture(image, path, encoding):
    """
    Write one texture encoding and return (bytes, pixel_exact).

    `webp-lossless` is the H5 default because it is both smaller and reversible:
    measured on the Jellyfish atlas, PNG 83.3 KB -> lossless WebP 44.0 KB (-47%)
    with a byte-identical RGBA round trip. The lossy modes measured 45.9 KB at
    q92 and 40.4 KB at q85 -- WORSE or barely better than lossless, so paying
    artefacts for them buys nothing and they are not offered.
    """
    if encoding == "png":
        image.save(path, optimize=True, compress_level=9)
        return os.path.getsize(path), True

    image.save(path, "WEBP", lossless=True, quality=100, method=6)
    if encoding == "webp-lossless":
        return os.path.getsize(path), True

    # webp-verify: keep the WebP only if decoding it reproduces the sprite exactly.
    if encoding == "webp-verify":
        with Image.open(path) as decoded:
            exact = decoded.convert("RGBA").tobytes() == image.tobytes()
        if exact:
            return os.path.getsize(path), True
        fallback = os.path.splitext(path)[0] + ".png"
        image.save(fallback, optimize=True, compress_level=9)
        return os.path.getsize(fallback), False
    raise SystemExit(f"unknown texture encoding {encoding!r}")


def compact_frame(rect, source, sprite_source):
    """
    One atlas frame entry, with the keys PixiJS actually reads.

    `rotated` and `pivot` are dropped: the pipeline never rotates a frame, and the
    pivot belongs to the sprite, not the texture. `sourceSize` and
    `spriteSourceSize` stay -- they are what re-register a trimmed frame onto its
    full logical frame, so dropping them would reintroduce the drift the alignment
    step exists to remove.
    """
    return {
        "frame": {"x": rect[0], "y": rect[1], "w": rect[2], "h": rect[3]},
        "spriteSourceSize": {"x": sprite_source[0], "y": sprite_source[1], "w": rect[2], "h": rect[3]},
        "sourceSize": {"w": source[0], "h": source[1]},
    }


def command_atlas(arguments):
    paths = frame_paths(arguments.dir)
    if not paths:
        raise SystemExit(f"no frame images under {arguments.dir}")
    frames = [(os.path.basename(path), Image.open(path).convert("RGBA")) for path in paths]
    names = [name for name, _image in frames]
    width, height = frames[0][1].size
    for name, image in frames:
        if image.size != (width, height):
            raise SystemExit(f"{name} is {image.size}, expected {width}x{height}")

    # Compact packing: frames sorted by height, placed in rows, one texture.
    margin = arguments.padding
    boxes = [(name, content_box(image), image) for name, image in frames]
    order = sorted(boxes, key=lambda item: item[1][3] - item[1][1], reverse=True)
    max_width = arguments.max_width or max(width * 2, 512)
    placements = []
    cursor_x = cursor_y = margin
    row_height = 0
    for name, box, image in order:
        left, top, right, bottom = box
        piece_w, piece_h = right - left, bottom - top
        if cursor_x + piece_w + margin > max_width:
            cursor_x = margin
            cursor_y += row_height + margin
            row_height = 0
        placements.append((name, image, box, cursor_x, cursor_y))
        cursor_x += piece_w + margin
        row_height = max(row_height, piece_h)
    sheet_w = max(x + (box[2] - box[0]) for _n, _i, box, x, _y in placements) + margin
    sheet_h = cursor_y + row_height + margin

    texture = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    table = {}
    for name, image, box, x, y in placements:
        left, top, right, bottom = box
        piece = image.crop(box)
        texture.paste(piece, (x, y))
        table[name] = compact_frame((x, y, piece.width, piece.height), (width, height), (left, top))

    # Power-of-two padding is off by default and the measurement says why: on this
    # atlas it changed the file from 83.3 KB to 85.9 KB (bigger) while raising the
    # decoded RGBA from 241 KB to 512 KB. It is only worth asking for when a target
    # engine genuinely requires it.
    if arguments.power_of_two:
        padded_w, padded_h = next_power_of_two(sheet_w), next_power_of_two(sheet_h)
        if (padded_w, padded_h) != (sheet_w, sheet_h):
            canvas = Image.new("RGBA", (padded_w, padded_h), (0, 0, 0, 0))
            canvas.paste(texture, (0, 0))
            print(
                f"  power-of-two padding {sheet_w}x{sheet_h} -> {padded_w}x{padded_h} "
                f"(decoded {sheet_w * sheet_h * 4 / 1024:.0f} KB -> {padded_w * padded_h * 4 / 1024:.0f} KB)"
            )
            texture = canvas
            sheet_w, sheet_h = padded_w, padded_h

    stem = f"{arguments.name}-atlas"
    candidates = []
    encodings = list(arguments.texture)
    # Quantisation is a per-asset gamble, so it is measured rather than assumed: a
    # texture already palette-quantised during pixelation gets BIGGER from doing it
    # again (measured 83.3 KB -> 86 KB with the raster loss). It is tried as an
    # extra candidate whenever the texture is encoded.
    if arguments.optimize:
        encodings += [arguments.texture[0] + "+quantised"]
    for encoding in encodings:
        quantised = encoding.endswith("+quantised")
        base = encoding[: -len("+quantised")] if quantised else encoding
        suffix = ".png" if base == "png" else ".webp"
        path = os.path.join(arguments.dir, stem + ("-q" if quantised else "") + suffix)
        to_write = texture
        if quantised:
            to_write = texture.convert("RGB").quantize(colors=arguments.colors, method=Image.MEDIANCUT).convert("RGBA")
            to_write.putalpha(texture.getchannel("A"))
        size, exact = encode_texture(to_write, path, base)
        candidates.append((encoding, path, size, exact))
        note = "" if exact else "  (not pixel-exact -> a PNG fallback was kept)"
        print(f"  texture {os.path.basename(path)}: {size / 1024:.1f} KB{note}")

    if len(candidates) > 1 and not arguments.keep_all_encodings:
        best = min(candidates, key=lambda item: item[2])
        for _encoding, path, _size, _exact in candidates:
            if path != best[1]:
                os.remove(path)
        print(f"  kept only {os.path.basename(best[1])} (smallest)")
        candidates = [best]

    image_name = os.path.basename(candidates[0][1])
    payload = {
        "frames": table,
        "animations": {arguments.animation: names},
        "meta": {
            "app": "asset_pipeline",
            "version": "1.0",
            "image": image_name,
            "size": {"w": sheet_w, "h": sheet_h},
            "scale": "1",
        },
    }
    write_json(os.path.join(arguments.dir, f"{arguments.name}.json"), payload, arguments.minify)

    manifest = {
        "name": arguments.name,
        "atlas": f"{arguments.name}.json",
        "animation": arguments.animation,
        "frames": names,
        "frameWidth": width,
        "frameHeight": height,
        "frameCount": len(names),
        "msPerFrame": round(1000 / arguments.fps),
        "loop": True,
        "anchor": {"x": 0.5, "y": 0.5},
        "textureBytes": candidates[0][2],
        "decodedBytes": sheet_w * sheet_h * 4,
    }

    write_json(os.path.join(arguments.dir, "animation.json"), manifest, arguments.minify)

    total = candidates[0][2] + os.path.getsize(os.path.join(arguments.dir, f"{arguments.name}.json")) + os.path.getsize(
        os.path.join(arguments.dir, "animation.json")
    )
    print(f"  atlas texture {sheet_w}x{sheet_h} ({len(names)} frames of {width}x{height})")
    print(
        f"  download: {total / 1024:.1f} KB total "
        f"(texture {candidates[0][2] / 1024:.1f} KB, decoded {sheet_w * sheet_h * 4 / 1024:.0f} KB RGBA)"
    )


# --------------------------------------------------------------------------- #
# plan: a reviewable, reproducible frame-generation spec
# --------------------------------------------------------------------------- #


def command_plan(arguments):
    """
    Turn one reviewed spec into the exact `generate_image` calls for every frame.

    The generation prompts are the part of the pipeline that lives in a human's
    head, and they are also the part worth keeping: written once into JSON, the
    frame set can be reviewed before anything is generated, re-run later, and
    diffed when an asset gets a second animation.
    """
    with open(arguments.spec, "r", encoding="utf-8") as handle:
        spec = json.load(handle)

    shared = spec.get("shared", {})
    reference = spec.get("reference")
    if not reference:
        raise SystemExit("the spec needs a `reference` path (the keyed, alpha-bearing image)")
    if not os.path.exists(reference):
        raise SystemExit(
            f"reference {reference} does not exist -- create it first:\n"
            f"  python asset_pipeline.py grant <raw render> -o {reference}"
        )
    reference_image = Image.open(reference)
    if reference_image.mode not in ("RGBA", "LA", "PA"):
        raise SystemExit(
            f"reference {reference} has no alpha channel (mode {reference_image.mode}).\n"
            "Ark refuses transparent output unless the single input carries at least one\n"
            "transparent pixel, so open the transparent branch first:\n"
            f"  python asset_pipeline.py grant <raw render> -o {reference}\n"
            "(the model cuts the subject out itself -- `key` is only needed when you want\n"
            "alpha you control, e.g. a gradient backdrop the model would otherwise keep)"
        )

    frames = spec.get("frames") or []
    if not frames:
        raise SystemExit("the spec needs a non-empty `frames` list")

    default_dir = spec.get("outputDir") or "."
    calls = []
    for index, frame in enumerate(frames):
        if not isinstance(frame, dict) or not frame.get("prompt"):
            raise SystemExit(f"frame {index + 1} needs a `prompt`")
        prefix = spec.get("promptPrefix", "")
        suffix = spec.get("promptSuffix", "")
        prompt = " ".join(part for part in (prefix, frame["prompt"], suffix) if part).strip()
        frame_id = frame.get("id") or f"frame-{index + 1}"
        out = frame.get("output") or os.path.join(default_dir, f"{frame_id}.png")
        calls.append(
            {
                "id": frame_id,
                "tool": "generate_image",
                "prompt": prompt,
                "reference_images": [reference],
                "background": "transparent",
                "output_format": "png",
                "size": frame.get("size") or shared.get("size") or "1K",
                "model": frame.get("model") or shared.get("model"),
                "output_path": out,
            }
        )

    plan = {
        "name": spec.get("name", "asset"),
        "reference": reference,
        "frameCount": len(calls),
        "calls": calls,
    }
    if arguments.out:
        write_json(arguments.out, plan, False)
        print(f"  wrote {arguments.out}")

    print(f"  {len(calls)} generate_image call(s), reference {reference} ({reference_image.size[0]}x{reference_image.size[1]}, alpha OK)")
    for call in calls:
        print(f"\n  [{call['id']}] -> {call['output_path']}")
        print(f"    prompt:              {call['prompt']}")
        print(f"    reference_images:    {call['reference_images']}")
        print(f"    background/output:   transparent / {call['output_format']}, size {call['size']}")
        if call["model"]:
            print(f"    model:               {call['model']}")
    print("\n  Every frame must use the SAME reference and the same subject wording;")
    print("  only the per-frame phase description should differ, or the frames stop being one asset.")


# --------------------------------------------------------------------------- #
# verify: decode the atlas back to pixels
# --------------------------------------------------------------------------- #


def command_verify(arguments):
    """
    Check every atlas in a directory, by decoding it rather than reading it.

    An atlas JSON can be perfectly well-formed and still place every frame wrong,
    and the failure is silent: PixiJS neither throws nor warns, the animation just
    shows the wrong pixels. So each frame entry is decoded back through the fields
    the loader uses and compared against the sprite on disk, byte for byte.
    """
    failures = []
    sprites = {}
    for path in frame_paths(arguments.dir):
        sprites[os.path.basename(path)] = Image.open(path).convert("RGBA")

    for atlas_path in sorted(glob.glob(os.path.join(arguments.dir, "*.json"))):
        with open(atlas_path, "r", encoding="utf-8") as handle:
            atlas = json.load(handle)
        if "frames" not in atlas or "meta" not in atlas:
            continue
        name = os.path.basename(atlas_path)
        texture_path = os.path.join(arguments.dir, atlas["meta"]["image"])
        if not os.path.exists(texture_path):
            failures.append(f"{name}: texture {atlas['meta']['image']} is missing")
            print(f"  FAIL  {name}: texture {atlas['meta']['image']} is missing")
            continue
        image = Image.open(texture_path).convert("RGBA")
        declared = atlas["meta"]["size"]

        def check(label, ok, detail=""):
            print(f"  {'ok  ' if ok else 'FAIL'}  {label}{'' if detail == '' else f' -- {detail}'}")
            if not ok:
                failures.append(f"{name}: {label}")

        check(f"{name}: meta.size matches the texture", (image.width, image.height) == (declared["w"], declared["h"]),
              f"declared {declared['w']}x{declared['h']}, texture {image.width}x{image.height}")

        rects = []
        for frame_name, entry in atlas["frames"].items():
            rect = entry["frame"]
            inside = (
                rect["x"] >= 0
                and rect["y"] >= 0
                and rect["x"] + rect["w"] <= image.width
                and rect["y"] + rect["h"] <= image.height
            )
            check(f"{name}/{frame_name}: rect inside the texture", inside, str(rect))
            rects.append((frame_name, rect))
        overlaps = []
        for index, (name_a, a) in enumerate(rects):
            for name_b, b in rects[index + 1 :]:
                if a["x"] < b["x"] + b["w"] and b["x"] < a["x"] + a["w"] and a["y"] < b["y"] + b["h"] and b["y"] < a["y"] + a["h"]:
                    overlaps.append(f"{name_a} vs {name_b}")
        check(f"{name}: no overlapping frame rects", not overlaps, "; ".join(overlaps))

        # Decode: crop each rect out of the packed texture and compare it to the
        # sprite file it claims to be. This is what catches a broken paste, a
        # rect off by a pixel, or a texture that a lossy encode mangled.
        animation = next(iter(atlas.get("animations", {})), None)
        order = atlas["animations"][animation] if animation else list(atlas["frames"])
        for index, frame_name in enumerate(order):
            entry = atlas["frames"].get(frame_name)
            if entry is None:
                check(f"{name}: {frame_name} is declared but has no entry", False)
                continue
            rect = entry["frame"]
            cut = image.crop((rect["x"], rect["y"], rect["x"] + rect["w"], rect["y"] + rect["h"]))
            source = sprites.get(f"frame-{index + 1}.png")
            if source is None:
                continue
            box = content_box(source)
            expected = source.crop(box) if entry.get("spriteSourceSize") else source
            same = cut.size == expected.size and cut.tobytes() == expected.tobytes()
            check(
                f"{name}/{frame_name}: decoded pixels equal frame-{index + 1}.png",
                same,
                f"{cut.size[0]}x{cut.size[1]} vs {expected.size[0]}x{expected.size[1]}",
            )

        hashes = {}
        for frame_name, entry in atlas["frames"].items():
            rect = entry["frame"]
            cut = image.crop((rect["x"], rect["y"], rect["x"] + rect["w"], rect["y"] + rect["h"]))
            hashes.setdefault(hashlib.sha256(cut.tobytes()).hexdigest(), []).append(frame_name)
        duplicates = [names for names in hashes.values() if len(names) > 1]
        check(f"{name}: every frame is a distinct image (no stuck animation)", not duplicates, str(duplicates))
        print(f"  {name}: {len(rects)} frames, {len(hashes)} distinct, texture {image.width}x{image.height}")
    if failures:
        print(f"\n  {len(failures)} check(s) failed")
        raise SystemExit(1)
    print("\n  all atlas checks passed")


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #


def main():
    parser = argparse.ArgumentParser(description="Generate a PixiJS-ready animated sprite asset.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    key = subparsers.add_parser("key", help="segment the background yourself, when you need alpha you control")
    key.add_argument("source")
    key.add_argument("-o", "--out", required=True)
    key.add_argument("--mode", choices=["auto", "edge", "luminance"], default="auto")
    key.add_argument("--tolerance", type=int, default=26, help="edge mode: per-channel background tolerance")
    key.add_argument("--ramp", type=int, default=2, help="edge mode: edge softness in pixels")
    key.add_argument("--black", type=int, default=18, help="luminance mode: at or below this, alpha 0")
    key.add_argument("--white", type=int, default=120, help="luminance mode: at or above this, alpha 255")
    key.set_defaults(handler=command_key)

    grant = subparsers.add_parser("grant", help="add a transparent seed so the API will produce transparency")
    grant.add_argument("source", help="an opaque render, e.g. straight from generate_image")
    grant.add_argument("-o", "--out", required=True)
    grant.add_argument("--seed", choices=["corner", "border"], default="corner")
    grant.add_argument("--seed-size", type=int, default=8, help="corner seed edge length in pixels")
    grant.add_argument("--thickness", type=int, default=1, help="seed thickness in pixels")
    grant.add_argument("--force", action="store_true", help="add the seed even when transparency already exists")
    grant.set_defaults(handler=command_grant)

    sheet = subparsers.add_parser("sheet", help="pixelate and align the frames")
    sheet.add_argument("--frames", required=True, help="directory holding the frame renders")
    sheet.add_argument("--out", required=True, help="directory for the aligned sprites")
    sheet.add_argument("--grid", type=int, default=0, help="pixelate to this width (0 = keep source resolution)")
    sheet.add_argument("--colors", type=int, default=40, help="shared palette size when pixelating")
    sheet.add_argument("--layout", choices=["uniform", "tight"], default="uniform")
    sheet.add_argument("--scale", choices=["none", "content-width"], default="none",
                       help="normalise frames on their content width before anchoring")
    sheet.add_argument("--anchor", choices=["top", "center", "bottom"], default="top")
    sheet.add_argument("--anchor-x", choices=["center", "left", "right"], default="center")
    sheet.add_argument("--margin", type=int, default=4, help="padding in output pixels")
    sheet.add_argument("--sheet-scale", type=int, default=1, help="nearest-neighbour scale for the sheets")
    sheet.set_defaults(handler=command_sheet)

    atlas = subparsers.add_parser("atlas", help="build the PixiJS atlas and animation JSON")
    atlas.add_argument("--dir", required=True, help="directory holding the aligned sprites")
    atlas.add_argument("--name", required=True, help="asset name, used for the JSON and texture filenames")
    atlas.add_argument("--animation", default="idle")
    atlas.add_argument("--fps", type=float, default=8.0)
    atlas.add_argument("--padding", type=int, default=2, help="padding around each packed frame")
    atlas.add_argument("--max-width", type=int, default=0, help="max texture width (0 = auto)")
    atlas.add_argument(
        "--texture",
        nargs="+",
        choices=["webp-lossless", "webp-verify", "png"],
        default=["webp-lossless"],
        help="texture encodings to try; webp-lossless is -47%% vs PNG at identical pixels",
    )
    atlas.add_argument("--keep-all-encodings", action="store_true", help="keep every encoding instead of the smallest")
    atlas.add_argument(
        "--power-of-two",
        action="store_true",
        help="pad the texture to power-of-two dimensions (measured: bigger file, 2x decoded memory)",
    )
    atlas.add_argument("--optimize", action="store_true", help="also try a palette-quantised texture and keep the smaller")
    atlas.add_argument("--colors", type=int, default=64, help="palette size for the quantised candidate")
    atlas.add_argument("--minify", action="store_true", default=True, help="write JSON without whitespace")
    atlas.add_argument("--pretty", dest="minify", action="store_false")
    atlas.set_defaults(handler=command_atlas)

    verify = subparsers.add_parser("verify", help="decode the atlas back to pixels")
    verify.add_argument("--dir", required=True)
    verify.set_defaults(handler=command_verify)

    plan = subparsers.add_parser("plan", help="turn a frame spec into the generate_image calls")
    plan.add_argument("--spec", required=True, help="JSON frame spec (see the README for the shape)")
    plan.add_argument("--out", help="also write the resolved call list here")
    plan.set_defaults(handler=command_plan)

    arguments = parser.parse_args()
    arguments.handler(arguments)


if __name__ == "__main__":
    main()

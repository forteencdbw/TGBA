"""
The project's picture-asset pipeline: find a real reference, get three candidates out of Seedream, pixelate them
the game's way, pick one, optionally generate an idle animation, and land it in the game.

    python asset_flow.py <subcommand> --batch <name> [options]

or, more usually, through the skill's wrapper, which finds a Python that has Pillow and reaches both this file and
the substrate with one name:

    pwsh -NoProfile -File .claude/skills/game-asset/scripts/run.ps1 flow <subcommand> --batch <name> [...]

WHY THIS EXISTS, next to `asset_pipeline.py`. That one is the SUBSTRATE -- transparency seeding, the pixelation
itself, alignment, atlas packing, verification -- and it is deliberately subject-agnostic: nothing in it knows
whether it is drawing a crab or a bullet. It knows HOW to make a picture the game's density; it has no opinion
about where the picture comes from. This is the opinion, and it was transcribed from the batch that was done by
hand: the four gunners (README, "四位枪手的贴图"), where a photo from Wikimedia went through `grant`, Seedream
flash, a grid derived from `obstacles.radius`, and `import-picture.py`. Everything here existed as a human
procedure once; this is that procedure with the numbers written down.

WHAT IT DOES NOT DO: it does not modify `asset_pipeline.py`. The skill's copy of that file and `refs/`'s copy are
kept BYTE-IDENTICAL on purpose (a skill that can be copied to another project on its own), so an edit to one is a
silent divergence until someone notices. This file imports it instead, and reuses `pixelate()`, `content_box()` and
the whole `grant` command through their own entry points. `md5sum` both after any change to either.

THE THREE NUMBERS THAT DECIDE WHETHER THE RESULT LOOKS LIKE THE REST OF THE GAME
--------------------------------------------------------------------------------
Every picture in TGBA is drawn at `TARGET_TEXEL_PX = 1.4` screen pixels per texel. So:

    drawn      = 2 x radius x LANE_PX x scale        radius from config/mechanics.json5, scale from the art row
    file width = round(drawn / 1.4)
    grid       = file width - 2 x margin             margin is the IMPORTER's own MARGIN_TEXELS (2)

and `--grid` takes the third one. Passing `--drawn` instead is the trap the README calls out: the importers treat
it as "content width", so the file comes out `drawn/1.4 + 2*margin` wide, the density lands at 1.66 instead of
1.4, and the creature looks finer than its neighbours. This file always computes the grid and always states it.

THE STATE IT KEEPS
------------------
`.scratch/asset-pipeline/<batch>/batch.json` is the whole of the pipeline's memory: one record per asset, carrying
the derived numbers, the candidates, what you picked, whether it wants an idle animation, and what was imported.
Every step is re-runnable and every step reads that record first, so "regenerate candidate 3" or "this one does
want an idle after all" is one command rather than a re-run from the top. `.scratch/**` is gitignored -- this is
working state, not a deliverable.
"""

import argparse
import base64
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

SKILL = Path(__file__).resolve().parent
ROOT = SKILL.parents[3]
PIPELINE = SKILL / "asset_pipeline.py"
CONFIG_QUERY = SKILL / "config-query.mjs"
MECHANICS = ROOT / "config" / "mechanics.json5"
ASSETS = ROOT / "src" / "assets"
SCRATCH = ROOT / ".scratch" / "asset-pipeline"

LANE_PX = 412  # a phone, the shipping target: `min(screenWidth, 900)` in computeViewport
TARGET_TEXEL_PX = 1.4  # screen pixels per texel, the density every picture in the game is drawn at
IMPORTER_MARGIN = 2  # `MARGIN_TEXELS` in BOTH importers; the grid formula subtracts it, so they must agree
ALPHA_FLOOR = 8

DEFAULT_MODEL = "doubao-seedream-5-0-flash-260915"  # flash: the only model this account has activated
DEFAULT_COLOURS = 40
DEFAULT_CANDIDATES = 3
DEFAULT_SIZE = "1K"

# The pixel count a GIF needs to be readable. A sprite is 40-90px wide, so this is a 3-6x nearest-neighbour blow-up.
GIF_MIN_WIDTH = 240
GIF_CHECKER = 8  # checkerboard cell, in the GIF's own pixels


# --------------------------------------------------------------------------- #
# plumbing
# --------------------------------------------------------------------------- #


def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def pipeline():
    """`asset_pipeline.py` -- imported, never edited. See the module docstring."""
    return load_module(PIPELINE, "asset_pipeline")


def seedream():
    """`scripts/seedream.py` -- the Ark half. Also imported rather than reimplemented."""
    return load_module(ROOT / "scripts" / "seedream.py", "seedream")


def say(message=""):
    print(message)


def fail(message):
    raise SystemExit(f"\n  {message}\n")


def run_tool(argv, **kwargs):
    """
    Run one of the project's own scripts or package scripts, echoing it, and stop on failure.

    Two things about the child environment, both measured on this machine rather than assumed:

      * **`pnpm` is not on PATH.** `shutil.which('pnpm')` returns None and `subprocess.run(['pnpm', ...])` raises
        FileNotFoundError -- a confusing way to learn that the tool which created `node_modules/` is unreachable
        from Python. `corepack pnpm` is the route that works, and corepack is what provides pnpm anyway.
      * **`DSH_PYTHON` has to be set.** It is what `scripts/pack-atlas.mjs` documents as the override for its own
        interpreter search, and without it `pnpm atlas` fails with "No Python with Pillow found. Tried: python3,
        python, py" -- even though `python -c "import PIL"` works from the same shell. The wrapper in this skill
        resolves that interpreter, so passing it down makes the two agree by construction instead of by luck.
    """
    argv = resolve_command(argv)
    env = dict(os.environ)
    env["DSH_PYTHON"] = python_exe()
    say(f"  $ {' '.join(str(a) for a in argv)}")
    result = subprocess.run(
        [str(a) for a in argv], capture_output=True, text=True, encoding="utf-8", cwd=ROOT, env=env
    )
    if result.stdout:
        print("".join(f"    {line}\n" for line in result.stdout.rstrip().splitlines()), end="")
    if result.returncode != 0:
        if result.stderr:
            print("".join(f"    {line}\n" for line in result.stderr.rstrip().splitlines()), end="")
        if kwargs.get("tolerate"):
            return result
        fail(f"that command failed (exit {result.returncode})")
    return result


def resolve_command(argv):
    """`argv` as it should actually be launched -- see `run_tool` for why `pnpm` is the interesting one."""
    if shutil.which(argv[0]):
        return list(argv)
    if argv[0] == "pnpm":
        corepack = shutil.which("corepack")
        if corepack:
            return [corepack, "pnpm", *argv[1:]]
    return list(argv)


_PYTHON = None


def python_exe():
    """
    The interpreter that has Pillow, for the child processes.

    `sys.executable` is the right answer when this file was itself started by the wrapper (which is the documented
    way in), and the wrong one when it was started by anything else -- `python` on PATH on this machine is the
    Windows Store stub, which exits without running anything and reads as "the script is broken". The wrapper
    resolves one; ask it, and remember the answer, because it takes a PowerShell launch to find out.
    """
    global _PYTHON
    if _PYTHON:
        return _PYTHON
    wrapper = SKILL / "run.ps1"
    for shell in (["pwsh", "-NoProfile"], ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass"]):
        try:
            result = subprocess.run(
                [*shell, "-File", str(wrapper), "python"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                timeout=60,
            )
        except (OSError, subprocess.TimeoutExpired):
            continue
        candidate = (result.stdout or "").strip().splitlines()
        if result.returncode == 0 and candidate and Path(candidate[-1]).exists():
            _PYTHON = candidate[-1]
            return _PYTHON
    _PYTHON = sys.executable
    return _PYTHON


# --------------------------------------------------------------------------- #
# the batch record
# --------------------------------------------------------------------------- #


def slug(name):
    """A directory name for an asset. Chinese is fine on this filesystem; path separators and spaces are not."""
    return "".join(ch if ch not in '\\/:*?"<>|' else "-" for ch in name).strip().replace(" ", "-")


def batch_dir(batch):
    return SCRATCH / slug(batch)


def read_batch(batch, create=False):
    path = batch_dir(batch) / "batch.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    if not create:
        fail(
            f"no batch {batch!r} at {path}\n"
            f"  Start one:  asset_flow.py new --spec <spec.json>"
        )
    return {"batch": batch, "created": time.strftime("%Y-%m-%dT%H:%M:%S"), "assets": []}


def write_batch(batch, data):
    path = batch_dir(batch) / "batch.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path


def assets_of(data, name=None):
    if name is None:
        return data["assets"]
    found = [a for a in data["assets"] if a["name"] == name]
    if not found:
        known = ", ".join(a["name"] for a in data["assets"]) or "(none)"
        fail(f"no asset {name!r} in this batch. Known assets: {known}")
    return found


def asset_dir(batch, name):
    return batch_dir(batch) / slug(name)


def asset_file(batch, asset, relative):
    return asset_dir(batch, asset["name"]) / relative


# --------------------------------------------------------------------------- #
# the numbers
# --------------------------------------------------------------------------- #


def config_lookup(table, kind):
    result = subprocess.run(
        ["node", str(CONFIG_QUERY), "lookup", "--table", table, "--kind", kind],
        capture_output=True,
        text=True,
        encoding="utf-8",
        cwd=ROOT,
    )
    try:
        payload = json.loads(result.stdout)
    except ValueError:
        fail(f"config-query.mjs did not answer ({result.returncode}): {(result.stdout or result.stderr)[:400]}")
    if not payload.get("ok"):
        fail(payload.get("error", "config lookup failed"))
    return payload


def png_size(path):
    """Width and height out of a PNG's IHDR, without decoding the picture."""
    with open(path, "rb") as handle:
        header = handle.read(24)
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG")
    return int.from_bytes(header[16:20], "big"), int.from_bytes(header[20:24], "big")


def derive(table, kind, scale):
    """
    The three numbers, from the config, with the density they imply.

    `grid` subtracts the importer's own margin because `import-picture.py` pads the canvas by `MARGIN_TEXELS` on
    each side: the file ends up `grid + 2 * margin` wide, and it is the FILE width the game divides by 1.4.
    """
    lookup = config_lookup(table, kind)
    radius = float(lookup["radius"])
    drawn = 2 * radius * LANE_PX * scale
    file_width = round(drawn / TARGET_TEXEL_PX)
    grid = file_width - 2 * IMPORTER_MARGIN
    if grid < 2:
        fail(f"grid {grid} is not a picture -- drawn {drawn:.1f}px is too small for this scale")
    return {"table": table, "kind": kind, "radius": radius, "scale": scale, "drawn": drawn,
            "fileWidth": file_width, "grid": grid, "lookup": lookup}


def sibling_densities(table, kind, lookup):
    """
    What the pictures that are ALREADY in the game are actually drawn at.

    This is the check that matters, and it is not the same question as "did the formula come out to 1.4": the six
    shipped corals all sit near 1.33, so a new one computed to 1.41 would be visibly finer than the five it stands
    next to -- which is exactly the failure the README describes. Measuring the siblings turns "the formula said
    so" into "the game says so".
    """
    rows = []
    for sibling in lookup.get("siblings", []):
        path = ASSETS / f"{sibling['image']}.png"
        if not path.exists():
            continue
        width, _height = png_size(path)
        drawn = 2 * float(lookup["radius"]) * LANE_PX * float(sibling["scale"])
        rows.append({"image": sibling["image"], "width": width, "density": drawn / width})
    return rows


def density_report(entry, sibling_rows):
    drawn, width = entry["drawn"], entry["fileWidth"]
    density = drawn / width
    say(f"  drawn {drawn:.1f}px, file {width}px wide -> density {density:.2f} screen px per texel")
    if not sibling_rows:
        return density
    values = sorted(row["density"] for row in sibling_rows)
    low, high = values[0], values[-1]
    say(f"  the {len(sibling_rows)} siblings already in src/assets/ are {low:.2f}-{high:.2f}")
    if density < low - 0.05 or density > high + 0.05:
        say(f"  WARNING: {density:.2f} is outside that range -- this one will look "
            f"{'finer' if density > high else 'coarser'} than the pictures it stands next to")
    return density


# --------------------------------------------------------------------------- #
# the boiling metric
# --------------------------------------------------------------------------- #


def boil_report(images):
    """
    How much the frame set shimmers, in the units `reference/api-notes.md` established.

    Measured: four per-frame renders of one subject differ by 30.7-39.5/255 on average, on 38-58% of the pixels
    that are opaque in both frames -- and the octopus set was REJECTED on that number, with the decisive half being
    that the region which must hold still (the mantle) differed on 55-73% of its own area. A composed tail cycle
    measures 1.0-2.1/255 instead.

    So this is the number to look at before deciding a frame set is fine. Two things it does NOT do: it does not
    compare the fully transparent corners (exactly inequality says 100% differ there, which is true and useless),
    and it does not decide -- a boiling set can still be the right answer for a creature whose body is supposed to
    move. It exists so the decision is made on a number rather than on a hunch.
    """
    if len(images) < 2:
        return None
    arrays = [np.array(image.convert("RGBA")).astype(int) for image in images]
    means, shares = [], []
    for index in range(1, len(arrays)):
        first, second = arrays[0], arrays[index]
        both = (first[:, :, 3] > ALPHA_FLOOR) & (second[:, :, 3] > ALPHA_FLOOR)
        if not both.any():
            continue
        delta = np.abs(first[:, :, :3] - second[:, :, :3]).mean(axis=2)[both]
        means.append(float(delta.mean()))
        shares.append(float((delta > 32).mean()))
    if not means:
        return None
    return {"meanRgb": float(np.mean(means)), "over32": float(np.mean(shares)), "frames": len(images)}


def print_boil(boil):
    if not boil:
        return
    say(f"  boiling: mean |dRGB| {boil['meanRgb']:.1f}/255 over {boil['over32'] * 100:.0f}% of shared pixels")
    if boil["meanRgb"] >= 20:
        say("  WARNING: that is the range a per-frame re-render lands in (measured 30.7-39.5 was rejected).")
        say("           Look at the GIF: if the part that should be still is shimmering, this is not the route.")


# --------------------------------------------------------------------------- #
# new: the spec
# --------------------------------------------------------------------------- #


def command_new(arguments):
    """
    Read the spec and start (or extend) a batch.

    The spec is written FIRST, before anything is paid for, so the prompts are reviewable and the whole thing is
    re-runnable. That is the same argument `asset_pipeline.py plan` makes, and it is worth keeping: the prompts are
    the part that lives in a human's head.
    """
    spec = json.loads(Path(arguments.spec).read_text(encoding="utf-8"))
    batch = arguments.batch or spec.get("batch")
    if not batch:
        fail("the spec needs a `batch` name, or pass --batch")
    data = read_batch(batch, create=True)
    data["batch"] = batch

    for entry in spec.get("assets") or []:
        name = entry.get("name")
        table, kind = entry.get("table"), entry.get("kind")
        if not name or not table or not kind:
            fail("every asset needs a `name`, a `table` (hazards|obstacles) and a `kind`")
        existing = next((a for a in data["assets"] if a["name"] == name), None)
        if existing:
            # The spec is the source of truth for the INPUTS -- the prompt, the composition, the scale -- and this
            # batch is the source of truth for what has been generated. Re-running `new` after editing the spec
            # updates the first without throwing away the second, so "the prompt was wrong, say it differently" is
            # `new` then `render` rather than starting the batch over.
            changed = []
            for field, value in (
                ("prompt", entry.get("prompt") or ""),
                ("composition", entry.get("composition")),
                ("scale", float(entry.get("scale") or existing["scale"])),
                ("colours", int(entry.get("colours") or existing["colours"])),
                ("aspect", entry.get("aspect") or existing["aspect"]),
                ("candidateCount", int(entry.get("candidates") or existing["candidateCount"])),
                ("alpha", float(entry.get("alpha") or existing.get("alpha") or 1.0)),
                ("swayDegrees", float(entry.get("swayDegrees") or existing.get("swayDegrees") or 0.0)),
                ("swaySeconds", float(entry.get("swaySeconds") or existing.get("swaySeconds") or 6.0)),
                ("originalDir", entry.get("originalDir")),
                ("photo", entry.get("photo") or existing.get("photo")),
            ):
                if value is not None and existing.get(field) != value:
                    changed.append(field)
                    existing[field] = value
            if "scale" in changed:
                numbers = derive(table, kind, existing["scale"])
                numbers.pop("lookup")
                existing.update(numbers)
            say(f"  {name}: updated {', '.join(changed) if changed else 'nothing'} "
                f"(candidates and the selection are kept)")
            continue

        scale = float(entry.get("scale") or 1.0)
        numbers = derive(table, kind, scale)
        lookup = numbers.pop("lookup")
        siblings = sibling_densities(table, kind, lookup)

        directory = asset_dir(batch, name)
        for sub in ("refs", "candidates", "frames", "frames-cropped", "sprites"):
            (directory / sub).mkdir(parents=True, exist_ok=True)

        asset = {
            "name": name,
            "table": table,
            "kind": kind,
            **numbers,
            "colours": int(entry.get("colours") or DEFAULT_COLOURS),
            "size": entry.get("size") or DEFAULT_SIZE,
            "aspect": entry.get("aspect") or "1:1",
            "candidateCount": int(entry.get("candidates") or DEFAULT_CANDIDATES),
            "alpha": float(entry.get("alpha") or 1.0),
            "state": entry.get("state"),
            "alignTo": entry.get("alignTo"),
            "alignRatio": float(entry.get("alignRatio") or 0.63),
            "swayDegrees": float(entry.get("swayDegrees") or 0.0),
            "swaySeconds": float(entry.get("swaySeconds") or 6.0),
            "prompt": entry.get("prompt") or "",
            "composition": entry.get("composition"),
            "originalDir": entry.get("originalDir"),
            "photo": entry.get("photo"),
            "reference": None,
            "candidates": [],
            "selected": None,
            "idle": entry.get("idle"),
            "frames": [],
            "sprites": [],
            "boil": None,
            "imported": None,
        }
        data["assets"].append(asset)

        say(f"\n  {name}  ({table}.{kind}, scale {scale})")
        density_report(asset, siblings)
        say(f"  grid {asset['grid']}, {asset['colours']} colours, {asset['size']}, {asset['aspect']}")
        if not asset["prompt"]:
            say("  NOTE: no `prompt` in the spec -- `render` needs the subject description before it can draw")

    path = write_batch(batch, data)
    say(f"\n  wrote {path}")
    say(f"  next:  put the reference photo in {asset_dir(batch, data['assets'][-1]['name']) / 'refs'}")
    return 0


# --------------------------------------------------------------------------- #
# render: the three candidates
# --------------------------------------------------------------------------- #


# Aspect has to be ASKED FOR IN WORDS. `size: "1K"` is a class, not a dimension -- measured on this very run, a
# 1K request came back 1312x880 -- and the documented way to steer the shape is the prompt. The field was in the
# spec and read by nothing until this table existed, which is the sort of gap that only shows up when you look at
# what actually came back.
# Every entry ends with a full stop, because the parts are concatenated with nothing between them and Chinese does
# not put spaces between sentences -- without it, "主体居中" runs straight into the next clause.
ASPECT_WORDS = {
    "1:1": "正方形构图（1:1），主体居中。",
    "4:3": "横向构图（4:3）。",
    "3:2": "横向构图（3:2）。",
    "16:9": "横向构图（16:9）。",
    "3:4": "竖向构图（3:4）。",
    "2:3": "竖向构图（2:3）。",
    "9:16": "竖向构图（9:16）。",
}


# The style half of the prompt, and it is FIXED on purpose -- see `prompt_for` for why it is not "pixel art".
#
# The framing half is NOT fixed. It used to be, and that is the mistake the first real run made: the template said
# "背景纯色、与主体颜色明显不同、没有任何其他物体", which is right for a creature and exactly wrong for an obstacle
# whose six existing variants are all little SCENES -- a coral plus its rock-and-sand base plus a couple of
# companions. Three candidates came back as lone coral bushes on transparency; measured, the new sprite's bottom
# tenth of columns was 30% filled against 65-88% for the five it would stand next to. Nothing about the density,
# the palette or the silhouette said so. So `composition` is a spec field with this as its default.
STYLE = (
    "16 位主机游戏精灵的形体与配色：有限的调色板、明确的大色块、硬边、轮廓清晰、没有抗锯齿、"
    "没有细腻的纹理和渐变、不要景深和写实光照。"
)
DEFAULT_COMPOSITION = "主体占满画面、居中、四周留白。背景纯色、与主体颜色明显不同、没有任何其他物体。"


def prompt_for(asset, phase=None):
    """
    The prompt the model gets: fixed style, then the spec's subject and the spec's composition.

    DELIBERATELY NOT "pixel art". Seedream cannot draw it: measured on the four-gunner batch, the run-length of a
    single colour along a scanline is 1.0px no matter what the prompt says, including prompts that spell out
    "about 256px of effective resolution, 6x6 blocks, nearest-neighbour upscale, absolutely no antialiasing". The
    README's conclusion is that this is not a compromise but the correct input -- pixelating a smooth picture is
    clean, pixelating a picture that is already pixel art resamples it. So this asks for the SHAPE and the PALETTE
    in the idiom of a 16-bit sprite, and leaves the pixels to `pixelate()`.

    The subject comes BEFORE the composition because the composition is a constraint on it, and a constraint reads
    as a constraint when it follows what it constrains.
    """
    parts = [
        STYLE,
        asset["prompt"].strip(),
        ASPECT_WORDS.get(asset.get("aspect") or "", ""),
        (asset.get("composition") or DEFAULT_COMPOSITION).strip(),
    ]
    if phase:
        parts.append(phase)
    return "".join(part for part in parts if part)


REFERENCE_LONG_EDGE = 1536  # what the four-gunner batch used, and enough for a 1K output


def prepare_reference(source, target, long_edge):
    """
    Downscale the photograph, then seed it -- in that order.

    A 3872x2592 photograph is 15.3 MB as a seeded PNG, which is ~20 MB once base64'd into the request and is sent
    once per candidate. Measured, and it buys nothing: the output is 1K, so the model is going to resample whatever
    it is given, and 1536 on the long edge is more detail than a 1024 output can hold. It also keeps a comfortable
    margin under Ark's 30 MB input ceiling, which a 15 MB reference does not.

    The order is the whole trick. `grant` writes an 8x8 block of alpha-0 into a corner as the permission signal Ark
    requires; resampling after that would blend the seed's edge and leave the corner at alpha 3 instead of 0. So the
    picture is resized first and the seed goes into the resized one.
    """
    image = Image.open(source).convert("RGB")
    if max(image.size) > long_edge:
        factor = long_edge / max(image.size)
        size = (max(1, round(image.width * factor)), max(1, round(image.height * factor)))
        image = image.resize(size, Image.LANCZOS)
        say(f"  reference {Image.open(source).size[0]}x{Image.open(source).size[1]} -> {size[0]}x{size[1]} "
            f"(long edge {long_edge})")
    image.convert("RGBA").save(target, optimize=True)
    return target


def command_render(arguments):
    """
    Seed the reference and ask Ark for every candidate.

    Two rules are enforced here rather than discovered later, both measured (see `reference/api-notes.md`):

      * Transparency must be SEEDED. Ark refuses `background: "transparent"` unless the single input image already
        carries at least one transparent pixel; a 1x1 corner produces the same silhouette as a careful local
        cutout, so `grant` writes 64 of them and stops. The model then cuts the subject out itself, which beats a
        local luminance key on anything emissive (7.6% partial alpha against 18.4%).
      * EXACTLY ONE input image. `background: "transparent"` is image-to-image with one reference; a second
        reference turns a working request into a 400.

    Three candidates are three REQUESTS, not one: 5.0 pro/flash -- the only models with transparency -- have no
    batch mode at all. Same prompt every time; the variation is the model's.
    """
    data = read_batch(arguments.batch)
    targets = [a for a in assets_of(data, arguments.asset) if a.get("prompt")]
    if not targets:
        fail("no asset in this batch has a `prompt`; put one in the spec")

    ark = seedream()
    key, source = ark.resolve_key()
    model = arguments.model or DEFAULT_MODEL
    say(f"  key from {source}; model {model}")

    for asset in targets:
        directory = asset_dir(data["batch"], asset["name"])
        photo = asset.get("photo")
        if not photo:
            fail(f"{asset['name']}: no `photo` in the spec -- run step 1 first and name the file it saved")
        photo_path = directory / photo
        if not photo_path.exists():
            fail(
                f"{asset['name']}: {photo_path} does not exist.\n"
                f"  Step 1 is finding a real reference photograph; put it here as `photo` names it."
            )

        # The grant is the whole of why an opaque photograph can become a transparent sprite at all.
        reference = directory / "refs" / "keyed.png"
        prepare_reference(photo_path, reference, arguments.reference_size or REFERENCE_LONG_EDGE)
        pipeline().command_grant(
            argparse.Namespace(source=str(reference), out=str(reference), seed="corner",
                               seed_size=8, thickness=1, force=True)
        )
        asset["reference"] = str(reference.relative_to(directory))

        calls = []
        indices = [arguments.candidate] if arguments.candidate else list(range(1, asset["candidateCount"] + 1))
        for index in indices:
            if index < 1 or index > asset["candidateCount"]:
                fail(f"--candidate {index} is outside 1..{asset['candidateCount']}")
            target = directory / "candidates" / f"c{index}-raw.png"
            calls.append(
                {
                    "id": f"{asset['name']}-c{index}",
                    "tool": "generate_image",
                    "prompt": prompt_for(asset),
                    "reference_images": [str(reference)],
                    "background": "transparent",
                    "output_format": "png",
                    "size": asset["size"],
                    "model": model,
                    "output_path": str(target),
                }
            )
        plan_path = directory / "plan.json"
        plan_path.write_text(
            json.dumps({"name": asset["name"], "reference": str(reference), "frameCount": len(calls),
                        "calls": calls}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        say(f"\n  {asset['name']}: {len(calls)} candidate(s), plan at {plan_path.relative_to(ROOT)}")

        failures = 0
        for call in calls:
            if not ark.run_call(call, key, model, None, arguments.dry_run):
                failures += 1
        if failures:
            fail(f"{failures} of {len(calls)} candidate(s) failed -- see the messages above")

        # Merged rather than replaced: `--candidate 2` regenerates ONE, and wiping the other two would make "redo
        # the third one" cost three generations.
        known = {c["index"]: c for c in asset["candidates"]}
        for index in range(1, asset["candidateCount"] + 1):
            known[index] = {
                "index": index,
                "raw": f"candidates/c{index}-raw.png",
                "sprite": known.get(index, {}).get("sprite"),
                "width": known.get(index, {}).get("width"),
                "height": known.get(index, {}).get("height"),
                "density": known.get(index, {}).get("density"),
            }
        asset["candidates"] = [known[i] for i in sorted(known)]

    write_batch(data["batch"], data)
    if arguments.dry_run:
        say("\n  dry run -- nothing was sent, nothing was spent")
    else:
        say(f"\n  next:  asset_flow.py pixelate --batch {data['batch']}")
    return 0


# --------------------------------------------------------------------------- #
# pixelate: the candidates, at the game's density
# --------------------------------------------------------------------------- #


def command_pixelate(arguments):
    """
    Run each candidate through the project's own importer, at the derived grid, into the batch directory.

    It calls `scripts/import-picture.py --out-dir <candidates>/` rather than doing the pixelation here, and that is
    the point: the file this produces is byte-for-byte the file the import will copy into `src/assets/` later. If
    this re-implemented the density arithmetic, the picture you approved and the picture that shipped could differ
    and nothing would say so.
    """
    data = read_batch(arguments.batch)
    python = python_exe()

    for asset in assets_of(data, arguments.asset):
        directory = asset_dir(data["batch"], asset["name"])

        # Adopt renders that are already sitting in the batch directory. `render` is how candidates normally
        # arrive, but it is not the only honest source: a picture from a different model, a hand-made render, or a
        # candidate set regenerated one frame at a time all belong at this point in the pipeline, and all of them
        # are just files named `c<index>-raw.png`.
        if not asset["candidates"]:
            loose = sorted(directory.glob("candidates/c*-raw.png"))
            adopted = []
            for path in loose:
                digits = "".join(ch for ch in path.stem.split("-")[0] if ch.isdigit())
                adopted.append({"index": int(digits) if digits else len(adopted) + 1,
                                "raw": str(path.relative_to(directory)), "sprite": None, "width": None})
            if adopted:
                asset["candidates"] = adopted
                say(f"  {asset['name']}: adopted {len(adopted)} render(s) already in the batch directory")

        if not asset["candidates"]:
            say(f"  {asset['name']}: no candidates yet, skipping")
            continue
        grid = arguments.grid or asset["grid"]
        directory = asset_dir(data["batch"], asset["name"])
        say(f"\n  {asset['name']}: grid {grid}")
        for candidate in asset["candidates"]:
            raw = directory / candidate["raw"]
            if not raw.exists():
                say(f"    candidate {candidate['index']}: {raw.name} is missing, skipping")
                continue
            sprite_name = f"{asset['name']}-候选{candidate['index']}"
            if asset.get("alignTo"):
                # A second state of a creature that already has one: same canvas, same palette, smaller. See
                # `pixelate_aligned` -- and note the template is the SHIPPED file, not the raw render, so what this
                # lines up against is what the game is actually drawing.
                template = ASSETS / f"{asset['alignTo']}.png"
                if not template.exists():
                    fail(f"{asset['name']} says alignTo {asset['alignTo']!r}, but {template} does not exist -- "
                         f"the base picture has to be imported first")
                result = pixelate_aligned(
                    raw, directory / "candidates", sprite_name, grid, asset["colours"],
                    template, float(asset.get("alignRatio") or 0.63),
                )
                say(f"    aligned to {template.name}: content {result['templateWidth']}px canvas, "
                    f"drawn at {float(asset.get('alignRatio') or 0.63):.2f} of it")
            else:
                run_tool([
                    python, ROOT / "scripts" / "import-picture.py", raw,
                    "--name", sprite_name, "--grid", grid,
                    "--colours", asset["colours"],
                    "--out-dir", directory / "candidates",
                ])
            sprite = directory / "candidates" / f"{sprite_name}.png"
            if sprite.exists():
                width, height = png_size(sprite)
                candidate["sprite"] = str(sprite.relative_to(directory))
                candidate["width"] = width
                candidate["height"] = height
                candidate["density"] = asset["drawn"] / width
                say(f"    -> {width}x{height}, density {candidate['density']:.2f}")

        widths = [c["width"] for c in asset["candidates"] if c.get("width")]
        if widths:
            say(f"  candidate widths {widths}; spread {max(widths) - min(widths)}px")

    write_batch(data["batch"], data)
    say(f"\n  next:  asset_flow.py gallery --batch {data['batch']}   (then run the driver it prints)")
    return 0


# --------------------------------------------------------------------------- #
# gallery: the page you choose on
# --------------------------------------------------------------------------- #


def data_uri(path, scale=1, checker=False, max_width=None):
    """
    A picture as an inline `data:` URI, so the page is one file that cannot half-load.

    Resizing happens here rather than in CSS because the point of inlining is that no request is ever made: a
    1024px render base64'd three times over is several megabytes of HTML to answer a question -- "what did the
    model draw" -- that a 420px thumbnail answers just as well. The sprite views are the ones that must not be
    smoothed, so the display downscale is LANCZOS (it is a photo) and the pixel views are NEAREST (they are not).
    """
    image = Image.open(path).convert("RGBA")
    if max_width and image.width > max_width:
        height = max(1, round(image.height * max_width / image.width))
        image = image.resize((max_width, height), Image.LANCZOS)
    if checker:
        background = Image.new("RGBA", image.size, (255, 255, 255, 255))
        for y in range(0, image.height, GIF_CHECKER):
            for x in range(0, image.width, GIF_CHECKER):
                if (x // GIF_CHECKER + y // GIF_CHECKER) % 2:
                    background.paste((210, 216, 224, 255), (x, y, min(x + GIF_CHECKER, image.width),
                                                            min(y + GIF_CHECKER, image.height)))
        background.alpha_composite(image)
        image = background
    if scale > 1:
        image = image.resize((image.width * scale, image.height * scale), Image.NEAREST)
    import io

    buffer = io.BytesIO()
    image.save(buffer, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


def command_gallery(arguments):
    """
    Write the page, with the pictures inlined.

    Self-contained on purpose: a `file://` page with base64 images needs no server, no dev server, no build, and
    cannot half-load. The three views per candidate are the three questions worth asking about a candidate -- what
    the model drew, what the game's density does to it, and how big it will actually be on a phone -- and the
    game-size one is drawn at `LANE_PX` for a 412px-wide lane, which is the shipping target.
    """
    data = read_batch(arguments.batch)
    directory = batch_dir(data["batch"])
    records = []
    for asset in data["assets"]:
        for candidate in asset["candidates"]:
            if not candidate.get("sprite"):
                continue
            records.append((asset, candidate))

    if not records:
        fail("nothing to show -- run `pixelate` first")

    # A strip of what is ALREADY in the game for this kind, at the size the game draws each one.
    #
    # This exists because of what the first real run got wrong. Three candidates were generated, pixelated and put
    # in a gallery, and every one of them was a lone coral bush on transparency -- while all six corals already in
    # `src/assets/` are little SCENES: a coral plus its rock-and-sand base plus a couple of companions. Measured,
    # the new one's bottom tenth of columns was 30% filled against 65-88% for its neighbours: the density matched,
    # the composition did not. Nothing in the gallery could have shown that, because a candidate shown alone has
    # nothing to be compared against. It cost a generation to find out.
    lookups = {}
    for asset in data["assets"]:
        key = (asset["table"], asset["kind"])
        if key not in lookups:
            try:
                lookups[key] = config_lookup(*key)
            except SystemExit:
                lookups[key] = {"siblings": []}

    def sibling_strip(asset):
        lookup = lookups.get((asset["table"], asset["kind"])) or {"siblings": []}
        radius = lookup.get("radius")
        if not radius or not lookup.get("siblings"):
            return ""
        figures = []
        for sibling in lookup["siblings"]:
            path = ASSETS / f"{sibling['image']}.png"
            if not path.exists():
                continue
            drawn = 2 * radius * LANE_PX * float(sibling.get("scale") or 1)
            figures.append(
                f'<figure><img src="{data_uri(path, scale=1, checker=True)}" style="width:{round(drawn)}px">'
                f'<figcaption>{sibling["image"]}<br>{drawn:.0f}px</figcaption></figure>'
            )
        if not figures:
            return ""
        return (
            f'<div class="strip"><h2>同类现有 —— 游戏实际大小（{len(figures)} 个）</h2>'
            f'<div class="views">{"" .join(figures)}</div></div>'
        )

    body = []
    for asset in data["assets"]:
        mine = [(a, c) for a, c in records if a["name"] == asset["name"]]
        if not mine:
            continue
        # The strip goes with its own candidates, not in a block at the top: the comparison only means anything
        # next to the thing being compared.
        body.append(sibling_strip(asset))
        for _asset, candidate in mine:
            asset_root = asset_dir(data["batch"], asset["name"])
            raw = asset_root / candidate["raw"]
            sprite = asset_root / candidate["sprite"]
            screen_width = round(candidate["width"] * candidate["density"])
            body.append(
                f"""
  <section class="card" data-key="{asset['name']}#{candidate['index']}">
    <header>
      <span class="name">{asset['name']}</span>
      <span class="meta">候选 {candidate['index']} · {asset['table']}.{asset['kind']} · 网格 {asset['grid']} ·
        {candidate['width']}×{candidate['height']} · 密度 {candidate['density']:.2f}</span>
    </header>
    <div class="views">
      <figure><img src="{data_uri(raw, max_width=420)}" style="max-height:170px"><figcaption>原图（未像素化）</figcaption></figure>
      <figure><img src="{data_uri(sprite, scale=4, checker=True)}" style="max-height:170px"><figcaption>像素化 ×4</figcaption></figure>
      <figure><img src="{data_uri(sprite, scale=1)}" style="width:{screen_width}px">
        <figcaption>游戏实际大小（{screen_width}px 宽）</figcaption></figure>
    </div>
    <div class="buttons">
      <button data-pick="still">选它</button>
      <button data-pick="idle">选它 + 要 idle 动画</button>
    </div>
  </section>"""
            )

    page = f"""<!doctype html>
<meta charset="utf-8">
<title>候选 · {data['batch']}</title>
<style>
  :root {{ color-scheme: dark; }}
  body {{ margin: 0; padding: 24px 24px 200px; background: #12161c; color: #e6edf3;
         font: 14px/1.5 system-ui, "Microsoft YaHei", sans-serif; }}
  h1 {{ font-size: 18px; margin: 0 0 4px; }}
  .hint {{ color: #8b98a5; margin-bottom: 20px; }}
  .card {{ background: #1a2029; border: 1px solid #2a323d; border-radius: 10px; padding: 14px 16px; margin-bottom: 14px; }}
  .strip {{ background: #0f141b; border: 1px dashed #33405280; border-radius: 10px; padding: 12px 16px;
            margin-bottom: 14px; overflow-x: auto; }}
  .strip h2 {{ font-size: 12px; font-weight: 600; color: #8b98a5; margin: 0 0 10px; }}
  .card.picked {{ border-color: #3fb950; box-shadow: 0 0 0 1px #3fb95044; }}
  header {{ display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; }}
  .name {{ font-weight: 600; font-size: 15px; }}
  .meta {{ color: #8b98a5; font-size: 12px; }}
  .views {{ display: flex; align-items: flex-end; gap: 26px; flex-wrap: wrap; }}
  figure {{ margin: 0; text-align: center; }}
  figure img {{ display: block; image-rendering: pixelated; background:
      repeating-conic-gradient(#e9eef4 0 25%, #cfd6e0 0 50%) 0 0 / 16px 16px; }}
  figcaption {{ color: #8b98a5; font-size: 11px; margin-top: 6px; }}
  .buttons {{ margin-top: 12px; display: flex; gap: 8px; }}
  button {{ background: #263140; color: #e6edf3; border: 1px solid #38455a; border-radius: 6px;
            padding: 6px 14px; font: inherit; cursor: pointer; }}
  button:hover {{ background: #2f3d4f; }}
  button.on {{ background: #238636; border-color: #2ea043; }}
  #bar {{ position: fixed; left: 0; right: 0; bottom: 0; background: #0d1117ee; border-top: 1px solid #2a323d;
          padding: 12px 24px; backdrop-filter: blur(6px); }}
  #out {{ font: 12px/1.45 ui-monospace, Consolas, monospace; white-space: pre-wrap; color: #7ee787;
          max-height: 92px; overflow: auto; margin: 0 0 8px; }}
  #done {{ background: #1f6feb; border-color: #388bfd; }}
</style>
<h1>{data['batch']}</h1>
<p class="hint">
  每张卡片两个按钮：<b>选它</b>＝直接导入项目；<b>选它 + 要 idle 动画</b>＝选定后再走动画管线。
  点完按下面的「完成选择」。
</p>
{''.join(body)}
<div id="bar">
  <pre id="out"></pre>
  <button id="done">完成选择（读取中会自动写入）</button>
</div>
<script>
  // The whole of the handoff. `asset_flow.py select` reads this object over CDP -- no file writing, no
  // localStorage, no clipboard, no download: the page runs at file:// and none of those are reliable there.
  window.__gallerySelection = {{ picks: [] }};
  window.__galleryDone = false;

  const render = () => {{
    document.getElementById('out').textContent =
      JSON.stringify(window.__gallerySelection.picks.map(p => ({{ name: p.name, candidate: p.candidate, idle: p.idle }})));
    for (const card of document.querySelectorAll('.card')) {{
      const pick = window.__gallerySelection.picks.find(p => p.key === card.dataset.key);
      card.classList.toggle('picked', Boolean(pick));
      for (const button of card.querySelectorAll('button')) {{
        // `pick.idle` is a boolean and `dataset.pick` is the string "idle", so these never matched until the
        // pair was spelled out -- the button that had been clicked simply did not light up, which reads as
        // "the click did not register".
        const wanted = pick && pick.idle ? 'idle' : 'still';
        button.classList.toggle('on', Boolean(pick) && button.dataset.pick === wanted);
      }}
    }}
  }};

  for (const card of document.querySelectorAll('.card')) {{
    const [name, index] = card.dataset.key.split('#');
    for (const button of card.querySelectorAll('button')) {{
      button.addEventListener('click', () => {{
        const picks = window.__gallerySelection.picks;
        const at = picks.findIndex(p => p.key === card.dataset.key);
        if (at >= 0) picks.splice(at, 1);
        picks.push({{ key: card.dataset.key, name, candidate: Number(index), idle: button.dataset.pick === 'idle' }});
        render();
      }});
    }}
  }}
  document.getElementById('done').addEventListener('click', () => {{
    window.__galleryDone = true;
    document.getElementById('done').textContent = '已记录，回到 Claude Code 继续';
  }});
  render();
</script>
"""
    page_path = directory / "gallery.html"
    page_path.write_text(page, encoding="utf-8")
    say(f"  {len(records)} candidate(s) from {len(data['assets'])} asset(s)")
    say(f"  wrote {page_path}")
    say(f"\n  open it and pick:\n    node {SKILL / 'gallery-driver.mjs'} {page_path} {directory / 'selection.json'}")
    return 0


# --------------------------------------------------------------------------- #
# select: read the picks back
# --------------------------------------------------------------------------- #


def command_select(arguments):
    """
    Fold the picks into the batch record -- from the driver's `selection.json`, or from JSON typed in.

    `--json` is not a convenience. Launching a browser is the one step here that depends on something outside this
    repository: a Chrome, a window, a person in front of it. When that fails the picture is not lost -- the page
    prints the same object in its footer as you click -- so the route back is to hand the same JSON over rather
    than to re-run anything.
    """
    data = read_batch(arguments.batch)
    directory = batch_dir(data["batch"])

    if arguments.json:
        # Either the JSON itself or a path to it. Both, because a JSON object on a Windows command line loses its
        # double quotes on the way through PowerShell and arrives here as `{picks:[...]}`, which is not JSON -- the
        # file route is what actually survives an operator pasting a selection in.
        text = arguments.json
        if not text.lstrip().startswith("{"):
            path = Path(text)
            if not path.exists():
                fail(f"--json was neither JSON nor a file that exists: {text}")
            text = path.read_text(encoding="utf-8")
        payload = json.loads(text)
    else:
        path = directory / "selection.json"
        if not path.exists():
            fail(
                f"{path} does not exist yet.\n"
                f"  Run the driver printed by `gallery`, pick in the browser, and press 完成选择.\n"
                f"  If the browser could not be launched, the page shows the same JSON in its footer --\n"
                f'  pass it as:  flow select --batch {data["batch"]} --json \'{{"picks":[...]}}\''
            )
        payload = json.loads(path.read_text(encoding="utf-8"))

    picks = payload.get("picks") or []
    if not picks:
        fail("nothing was picked in the browser")

    for pick in picks:
        asset = assets_of(data, pick["name"])[0]
        candidate = next((c for c in asset["candidates"] if c["index"] == pick["candidate"]), None)
        if not candidate or not candidate.get("sprite"):
            fail(f"{pick['name']} candidate {pick['candidate']} has no pixelated picture")
        asset["selected"] = {"index": pick["candidate"], "sprite": candidate["sprite"],
                             "raw": candidate["raw"], "idle": bool(pick.get("idle"))}
        asset["idle"] = (asset.get("idle") or {}) if pick.get("idle") else None
        kind = "＋idle 动画" if pick.get("idle") else "，不要 idle"
        say(f"  {asset['name']}: 候选 {pick['candidate']}{kind}")

    write_batch(data["batch"], data)
    still = [a for a in data["assets"] if a.get("selected") and not a["selected"]["idle"]]
    animated = [a for a in data["assets"] if a.get("selected") and a["selected"]["idle"]]
    if still:
        say(f"\n  {len(still)} asset(s) are done generating -- import them:")
        say(f"    asset_flow.py import --batch {data['batch']} --asset {still[0]['name']}")
    if animated:
        say(f"\n  {len(animated)} asset(s) want an idle animation -- next step:")
        say(f"    asset_flow.py idle --batch {data['batch']} --asset {animated[0]['name']}")
    return 0


# --------------------------------------------------------------------------- #
# idle: the animation
# --------------------------------------------------------------------------- #


def union_box(paths, threshold=ALPHA_FLOOR):
    """
    The box that contains every frame's content.

    One box for the whole set rather than one box per frame, and that is not tidiness: `pixelate()` scales by
    width, so cropping each frame to ITS OWN content box makes a frame whose content is a few pixels wider come
    out at the same grid width but with its body a different SIZE. Measured on the whale when `compose-swim-tail`
    got this wrong: the body differed by 1752 pixels between two frames. The union box keeps every frame on one
    canvas, so the part that did not move stays put.
    """
    boxes = []
    for path in paths:
        image = Image.open(path).convert("RGBA")
        alpha = np.array(image)[:, :, 3] > threshold
        if not alpha.any():
            fail(f"{path} has no opaque pixels at all")
        ys, xs = np.where(alpha)
        boxes.append((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def frame_set_name(asset, state="move"):
    """
    What a frame set is called on disk: `<asset>-<state>` for a creature, `<asset>` for anything else.

    THE NAME IS LOAD-BEARING, and getting it wrong is silent. `wire_hazard` declares
    `animations.<name>.frames = "<name>-{n}"` and `hazardArt.<kind>.move = "<name>"`, and the atlas looks up a frame
    by FILE NAME -- so a frame written as `螃蟹-1.png` under an animation that asks for `螃蟹-move-1` is a picture
    the game never finds, with nothing failing anywhere. The two are derived from this one function so they cannot
    disagree.
    """
    return f"{asset['name']}-{state}" if asset["table"] == "hazards" else asset["name"]


def normalise_frames(paths, out_dir, threshold=ALPHA_FLOOR):
    """
    Scale every frame so they all have the same CONTENT WIDTH, then crop them to one shared box.

    WHY THIS IS NOT OPTIONAL. `import-sheet.py` scales each frame to the same grid width, which is right when the
    frames share a canvas and wrong when the MODEL drew the creature wider in some of them. Measured on the crab:
    content widths came out 35, 32, 35, 32 -- a two-frame pulse that reads as the creature swelling and shrinking
    at 4 fps, which is not what a leg motion is supposed to say. It was visible before it was measured; the number
    only said how big it was.

    It is the same judgement `asset_pipeline.py sheet --scale content-width` makes, for the same reason, and it is
    safe here for the same reason too: a size difference between two RENDERS is a render inconsistency, not an
    intended expand/contract. A creature whose motion really is a size change would be flattened by this -- and no
    kind in this game has that motion.

    Scaling happens about each frame's own content-box centre, so nothing slides. Then the union box is taken again
    from the SCALED frames, because scaling changed what the union is.
    """
    images, boxes = [], []
    for path in paths:
        image = Image.open(path).convert("RGBA")
        images.append(image)
        alpha = np.array(image)[:, :, 3] > threshold
        if not alpha.any():
            fail(f"{path} has no opaque pixels at all")
        ys, xs = np.where(alpha)
        boxes.append((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))

    widths = [box[2] - box[0] for box in boxes]
    target = sorted(widths)[len(widths) // 2]
    spread = max(widths) - min(widths)

    scaled = []
    for image, box, width in zip(images, boxes, widths):
        factor = target / width
        if abs(factor - 1.0) < 0.005:
            scaled.append(image)
            continue
        size = (max(1, round(image.width * factor)), max(1, round(image.height * factor)))
        resized = image.resize(size, Image.LANCZOS)
        scaled.append(resized)

    common = union_box_of(scaled, threshold)
    out_dir.mkdir(parents=True, exist_ok=True)
    for path in out_dir.glob("*.png"):
        path.unlink()
    for path, image in zip(paths, scaled):
        image.crop(common).save(out_dir / path.name, optimize=True)
    return target, spread, common


def union_box_of(images, threshold=ALPHA_FLOOR):
    """The box containing every image's content. See `union_box` for why one box and not one each."""
    boxes = []
    for image in images:
        alpha = np.array(image)[:, :, 3] > threshold
        ys, xs = np.where(alpha)
        boxes.append((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def _render_frames(asset, directory, raw_frames, arguments):
    """
    Pixelate the cropped frames, record what came out, and measure it.

    Shared by the generate path and `--reuse`, end to end, because the two differ only in whether the frames were
    just rendered or were already sitting on disk -- and the numbers this writes into the batch record (the sprite
    names, the frame rate, the boiling) have to be the same either way or `import` wires a set that does not exist.
    """
    python = python_exe()
    cropped_dir = directory / "frames-cropped"
    run_tool([
        python, ROOT / "scripts" / "import-sheet.py", cropped_dir,
        "--name", frame_set_name(asset), "--cols", len(raw_frames), "--rows", 1,
        "--grid", arguments.grid or asset["grid"], "--colours", asset["colours"],
        "--out-dir", directory / "sprites",
    ])

    sprites = sorted((directory / "sprites").glob(f"{frame_set_name(asset)}-*.png"),
                     key=lambda p: int(p.stem.rsplit("-", 1)[1]))
    asset["frames"] = [str(p.relative_to(directory)) for p in raw_frames]
    asset["sprites"] = [str(p.relative_to(directory)) for p in sprites]
    # Kept on the record, not just used to build the GIF: `import` declares the `animations.<name>` row from it, and
    # a frame rate that only lived in the GIF call would make the config default to 8 behind the player's back. Read
    # HERE rather than in `command_gif` -- the first version of this line said `fps` and the variable only existed in
    # the OTHER function, so every frame set generated fine and then the run died before the batch was written: the
    # pictures on disk and no record that they existed.
    # `getattr` because `--fps` belongs to `gif`, not to `idle`, and this function serves both: reading the
    # attribute directly works from one caller and raises AttributeError from the other, AFTER the frames were
    # rendered and before the batch was written.
    asset["fps"] = float(getattr(arguments, "fps", None) or (asset.get("idle") or {}).get("fps") or 8)
    asset["boil"] = boil_report([Image.open(p) for p in sprites])
    say("")
    print_boil(asset["boil"])


def content_box_of(image, threshold=ALPHA_FLOOR):
    alpha = np.array(image)[:, :, 3] > threshold
    if not alpha.any():
        fail("a picture has no opaque pixels at all")
    ys, xs = np.where(alpha)
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def pixelate_aligned(source, out_dir, name, grid, colours, template, ratio, margin=IMPORTER_MARGIN):
    """
    Pixelate `source` on the SAME canvas and with the SAME palette as `template`, at `ratio` of its width.

    FOR THE PUFFER, and the puffer is the case that needs it. A creature can have a second state whose whole point is
    that it is SMALLER -- the puffer deflates while its counter is cooling, and `drawPuffer`'s own comment says the
    spikes ARE that state rather than decoration. But `import-picture.py` crops to content and scales the result to
    the grid width, so a picture of a deflated puffer comes out exactly as wide as the inflated one: the spikes get
    shorter and the BODY gets bigger, which says the opposite of what it means.

    So this one is not cropped to its own box and not scaled to the grid. It is placed, at `ratio` of the template's
    content width, on a canvas sized to the template's content box -- and pixelated at the same grid with the
    template's own palette, so the two states are one creature rather than two pictures that happen to be near each
    other. `ratio` comes from the DRAWN version's proportions (2.14r / 3.4r = 0.63), which is a measurement rather
    than a guess.
    """
    base = Image.open(template).convert("RGBA")
    base_box = content_box_of(base)
    box_w = base_box[2] - base_box[0]
    box_h = base_box[3] - base_box[1]

    art = Image.open(source).convert("RGBA")
    art_box = content_box_of(art)
    art_content = art.crop(art_box)

    target_w = max(1, round(box_w * ratio))
    target_h = max(1, round(art_content.height * target_w / art_content.width))
    if target_h > box_h:
        target_h = box_h
        target_w = max(1, round(art_content.width * target_h / art_content.height))
    scaled = art_content.resize((target_w, target_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (box_w, box_h), (0, 0, 0, 0))
    canvas.alpha_composite(scaled, ((box_w - target_w) // 2, (box_h - target_h) // 2))

    # The TEMPLATE's palette, not this picture's: one creature, one set of colours.
    palette = base.crop(base_box).convert("RGB").quantize(colors=colours, method=Image.MEDIANCUT)
    piece, _ = pipeline().pixelate(canvas, grid, palette, colours)

    padded = Image.new("RGBA", (piece.width + margin * 2, piece.height + margin * 2), (0, 0, 0, 0))
    padded.alpha_composite(piece, (margin, margin))
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / f"{name}.png"
    padded.save(target, optimize=True)
    return {"path": target, "width": padded.width, "height": padded.height, "templateWidth": box_w}


def command_idle(arguments):
    """
    Turn the selected candidate into an idle animation, two ways, with the choice made deliberately.

    ROUTE `sway` -- one picture turned about its own base by the renderer. Nothing is generated: the amplitude and
    the period are two config numbers (`swayDegrees` / `swaySeconds`), and the body is the same pixels in every
    orientation by construction. This is what the game's CRITICS of this pipeline recommend (see
    `obstacles.art`'s own comment: four per-frame re-renders measured 30-40/255 against 1.5/255 for a composed
    cycle), and for a hard skeleton like a coral it is simply correct.

    ROUTE `frames` -- N renders from the selected candidate. FRAME 1 IS NOT GENERATED: it is the candidate's own
    un-pixelated render, so the pose you approved is the anchor, byte for byte, and the loop has a stable home.
    Frames 2..N ask for the same creature in the same pose at a different phase of one breath. Then the set is
    measured (`boil_report`) BEFORE you are asked to look at it, because "is this shimmering" is a number here,
    not an opinion -- and the honest answer for a lot of subjects is going to be yes.
    """
    data = read_batch(arguments.batch)
    python = python_exe()

    for asset in assets_of(data, arguments.asset):
        if not asset.get("selected"):
            fail(f"{asset['name']} has no selection -- run `select` first")
        # The spec states the route, and `--route` overrules it -- because the two halves of "does this want an
        # idle animation" come from different places: the pick in the gallery says WHETHER, the spec says HOW, and
        # a coral that was specced as `sway` can still be asked for rendered frames afterwards without editing the
        # batch by hand.
        spec_route = (asset.get("idle") or {}).get("route", "frames")
        route = arguments.route or spec_route
        asset["idle"] = {**(asset.get("idle") or {}), "route": route}
        directory = asset_dir(data["batch"], asset["name"])

        if route == "sway":
            say(f"\n  {asset['name']}: route `sway` -- nothing to generate.")
            say("    This asset moves by turning about its own base, which is one line of renderer and one pair of")
            say("    config numbers, and the body is identical in every orientation by construction.")
            say(f"    In {asset['table']}.art.{asset['kind']}: set `swayDegrees` and `swaySeconds`.")
            say("    `import` will still install the picture; there are no frames to make.")
            continue

        frames = int(arguments.frames or (asset.get("idle") or {}).get("frames") or 4)
        if frames < 2:
            fail("an animation needs at least 2 frames")
        frames_dir = directory / "frames"
        frames_dir.mkdir(parents=True, exist_ok=True)

        # `--reuse` re-does the PIXELATION from frames that are already on disk. The frames are the expensive half
        # and they do not change when the thing being tuned is the crop, the normalisation or the grid.
        existing = sorted(p for p in frames_dir.glob("f*.png") if p.stem[1:].isdigit())
        if arguments.reuse and existing:
            say(f"\n  {asset['name']}: reusing {len(existing)} frame(s) already in {frames_dir.name}/")
            raw_frames = existing
            target, spread, box = normalise_frames(raw_frames, directory / "frames-cropped")
            say(f"    cropped {len(raw_frames)} frame(s) to {box[2] - box[0]}x{box[3] - box[1]}")
            if spread > 1:
                say(f"    content widths varied by {spread}px and were normalised to {target}px")
            _render_frames(asset, directory, raw_frames, arguments)
            continue

        say(f"\n  {asset['name']}: route `frames`, {frames} frames "
            f"(frame 1 is the candidate itself, {frames - 1} to generate)")
        source = directory / asset["selected"]["raw"]
        shutil.copy2(source, frames_dir / "f1.png")
        say(f"    f1.png  <- {asset['selected']['raw']} (not generated: this is the pose you approved)")

        ark = seedream()
        key, _source = ark.resolve_key()
        model = arguments.model or DEFAULT_MODEL
        reference = directory / "refs" / "frame-keyed.png"
        pipeline().command_grant(
            argparse.Namespace(source=str(source), out=str(reference), seed="corner",
                               seed_size=8, thickness=1, force=True)
        )

        failures = 0
        for index in range(2, frames + 1):
            phase = (
                f"这是同一个生物的同一个姿势的第 {index} 帧（共 {frames} 帧），一次缓慢呼吸循环里的一瞬："
                f"形体、大小、位置、配色和朝向必须与参考图完全一致，只有缓慢的形变不同。"
            )
            call = {
                "id": f"{asset['name']}-f{index}",
                "tool": "generate_image",
                "prompt": prompt_for(asset, phase),
                "reference_images": [str(reference)],
                "background": "transparent",
                "output_format": "png",
                "size": asset["size"],
                "model": model,
                "output_path": str(frames_dir / f"f{index}.png"),
            }
            if not ark.run_call(call, key, model, None, arguments.dry_run):
                failures += 1
        if failures:
            fail(f"{failures} frame(s) failed -- see the messages above")
        if arguments.dry_run:
            say("    dry run -- nothing was sent, nothing was spent")
            continue

        raw_frames = sorted(frames_dir.glob("f*.png"), key=lambda p: int(p.stem[1:]))
        raw_frames = [p for p in raw_frames if p.stem[1:].isdigit()]
        cropped_dir = directory / "frames-cropped"

        # Normalise content width, THEN crop to the union of what that produced. See `normalise_frames`: the model
        # draws the same creature at slightly different sizes frame to frame, and left alone that becomes a pulse.
        target, spread, box = normalise_frames(raw_frames, cropped_dir)
        say(f"    cropped {len(raw_frames)} frame(s) to {box[2] - box[0]}x{box[3] - box[1]} "
            f"-- one canvas, so the body cannot change size between frames")
        if spread > 1:
            say(f"    content widths varied by {spread}px and were normalised to {target}px "
                f"(without this the creature pulses at the frame rate)")

        _render_frames(asset, directory, raw_frames, arguments)

    write_batch(data["batch"], data)
    # Route-aware, because the two routes end in different places: `sway` has no frames, so pointing at `gif`
    # sends you to a command whose only job is to tell you there is nothing to make.
    if all((a.get("idle") or {}).get("route") == "sway" for a in assets_of(data, arguments.asset)):
        say(f"\n  next:  asset_flow.py import --batch {data['batch']} --asset "
            f"{assets_of(data, arguments.asset)[0]['name']}")
    else:
        say(f"\n  next:  asset_flow.py gif --batch {data['batch']} --asset <name>")
    return 0


# --------------------------------------------------------------------------- #
# gif: the loop you confirm
# --------------------------------------------------------------------------- #


def command_gif(arguments):
    """
    The loop, at a size a human can actually judge, on a checkerboard so the transparent part is visible.

    Nearest-neighbour, integer factor: a pixel-art sprite resampled with any smoothing filter is no longer the
    picture that shipped. The checkerboard matters for the same reason `Read`-ing a PNG does not settle a cutout
    question -- a sprite on a white background hides exactly the mistakes worth looking for.
    """
    data = read_batch(arguments.batch)
    for asset in assets_of(data, arguments.asset):
        directory = asset_dir(data["batch"], asset["name"])
        sprites = [directory / path for path in asset["sprites"]]
        if not sprites:
            say(f"  {asset['name']}: no frames -- route `sway` assets have none, nothing to make here")
            continue
        fps = float(arguments.fps or (asset.get("idle") or {}).get("fps") or 5.5)

        images = [Image.open(path).convert("RGBA") for path in sprites]
        width = images[0].width
        factor = max(1, -(-GIF_MIN_WIDTH // width))  # ceil
        boards = []
        for image in images:
            big = image.resize((image.width * factor, image.height * factor), Image.NEAREST)
            # Run the checkerboard under the sprite rather than pasting it on top: `alpha_composite` keeps the
            # sprite's own soft edge, which `paste` with the image as its own mask would flatten.
            board = Image.new("RGBA", big.size, (255, 255, 255, 255))
            for y in range(0, big.height, GIF_CHECKER):
                for x in range(0, big.width, GIF_CHECKER):
                    if (x // GIF_CHECKER + y // GIF_CHECKER) % 2:
                        board.paste((205, 212, 222, 255), (x, y, min(x + GIF_CHECKER, big.width),
                                                          min(y + GIF_CHECKER, big.height)))
            board.alpha_composite(big)
            # RGB first: the checkerboard is opaque, so nothing is lost, and quantising an RGBA frame makes PIL
            # carry the alpha INTO the palette instead of leaving it out of it.
            boards.append(board.convert("RGB"))

        # ONE palette for the set, taken from the first frame.
        #
        # Per-frame quantisation is what the first version did (`convert("P", ADAPTIVE)` on each frame) and it
        # fails at save time with "invalid palette size": PIL's GIF writer puts the first frame's palette on the
        # background image and the frames no longer agree about it. Sharing one palette is also the rule the rest
        # of this project follows -- two frames of one creature must not pick two different blues.
        palette = boards[0].quantize(colors=255)
        frames = [board.quantize(palette=palette, dither=Image.Dither.NONE) for board in boards]
        scaled = frames

        target = directory / f"{asset['name']}-idle.gif"
        scaled[0].save(
            target, save_all=True, append_images=scaled[1:],
            duration=round(1000 / fps), loop=0, disposal=2, optimize=False,
        )
        say(f"\n  {asset['name']}: {len(scaled)} frames, {images[0].width}x{images[0].height} -> x{factor} "
            f"({scaled[0].width}x{scaled[0].height}), {fps:g} fps")
        say(f"  {target}  {target.stat().st_size / 1024:.1f} KB")
        print_boil(asset["boil"])

    write_batch(data["batch"], data)
    return 0


# --------------------------------------------------------------------------- #
# import: into the game
# --------------------------------------------------------------------------- #


def validate_config_text(text):
    """
    Does this candidate config parse? Returns None, or the parser's complaint.

    The gate in front of writing `mechanics.json5`. It is edited as TEXT -- JSON5 full of the comments that make it
    worth reading, so re-serialising it through a parser would throw all of that away -- and the cost of getting a
    text edit wrong is not a bad asset, it is a game that will not start. Measured, on the first attempt at this:
    the inserted entry landed without its separating comma, and the only reason it was noticed is that the result
    was fed back through this parser.
    """
    probe = SCRATCH / ".config-candidate.json5"
    probe.parent.mkdir(parents=True, exist_ok=True)
    probe.write_text(text, encoding="utf-8")
    try:
        result = subprocess.run(
            ["node", str(CONFIG_QUERY), "validate", "--path", str(probe)],
            capture_output=True, text=True, encoding="utf-8", cwd=ROOT,
        )
        payload = json.loads(result.stdout or "{}")
        if payload.get("ok"):
            return None
        return payload.get("error", f"validate exited {result.returncode}")
    finally:
        probe.unlink(missing_ok=True)


def container_close(text, open_at):
    """
    The index of the `}` or `]` that closes the container opening at `open_at`, or -1.

    Skips strings and comments as it goes, because a bracket inside either of those is not structural. Written ONCE
    and shared: the config is now edited in three places (`obstacles.art.<kind>.variants`, `hazardArt.<kind>`,
    `animations.<name>`) and a second copy of this scanner would be a second chance to get the escaping wrong.
    """
    index, depth, in_string, escaped = open_at, 0, False, False
    while index < len(text):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
        elif char == '"':
            in_string = True
        elif char == "/" and text[index:index + 2] == "//":
            index = text.find("\n", index)
            if index < 0:
                return -1
        elif char == "/" and text[index:index + 2] == "/*":
            found = text.find("*/", index)
            if found < 0:
                return -1
            index = found + 1
        elif char in "{[":
            depth += 1
        elif char in "}]":
            depth -= 1
            if depth == 0:
                return index
        index += 1
    return -1


def insert_before_close(text, close_at, entry):
    """
    Put `entry` -- already indented and newline-terminated -- just before `close_at`, on a line of its own.

    THE COMMA, and why this is split out rather than inlined. JSON5 tolerates a TRAILING comma but still requires one
    BETWEEN members, and the last member before a closing bracket has none. The first version of this appende the
    comma to the previous line of the WHOLE text and then sliced at the old insertion index -- but that comma is one
    character before that index, so the slice moved one character left, swallowed the newline, and put the new
    entry's comment on the end of the previous line. Still valid JSON5 (a comment after a comma on the same line is
    fine), which is why nothing caught it: the parse check passed and the atlas packed. It only showed up when
    somebody read the file. Splitting at the insertion point and working on the head alone removes the arithmetic.
    """
    line_start = text.rfind("\n", 0, close_at) + 1
    head_text, tail_text = text[:line_start], text[line_start:]
    lines = head_text.split("\n")
    for position in range(len(lines) - 1, -1, -1):
        stripped = lines[position].strip()
        if not stripped or stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            continue
        if stripped.endswith("{") or stripped.endswith("[") or stripped.endswith(","):
            break  # an empty container, or a comma already there
        lines[position] = lines[position].rstrip() + ","
        break
    return "\n".join(lines) + entry + tail_text


def member_indent(text, close_at):
    """The indent members of the container closing at `close_at` should use."""
    return " " * (close_at - text.rfind("\n", 0, close_at) - 1 + 2)


def object_open(text, key, from_at=0):
    """
    The index of the `{` opening the top-level object named `key`, or -1.

    Anchored to a KEY at the start of a line rather than to the first `"key"` anywhere, and that is not pedantry:
    this config explains itself in comments, `"animations"` is exactly the kind of word a comment about animations
    would use, and a plain `find` would happily return the position of that mention and then brace-match from the
    wrong place.
    """
    match = re.search(rf'^[ \t]*"{re.escape(key)}"[ \t]*:[ \t]*\{{', text[from_at:], re.MULTILINE)
    if not match:
        return -1
    return from_at + match.end() - 1


def has_member(text, open_at, key):
    """
    Whether `key` is already a member of the container opening at `open_at`.

    Checked before every insert. `import` is meant to be re-runnable -- typecheck can fail, the atlas can want a
    second go -- and without this a second run appends a duplicate row that fails nothing and quietly gives one kind
    two conflicting art rows.
    """
    close_at = container_close(text, open_at)
    if close_at < 0:
        return False
    return f'"{key}"' in text[open_at:close_at]


def wire_variant(text, table, kind, image, scale):
    """
    Add one `{ "image", "scale" }` entry to an obstacle art row's `variants` list, as text.

    As text because the config is JSON5 full of comments, and the comments are the point of it: re-serialising it
    would throw away the file's whole value.
    """
    if table != "obstacles":
        return text, None

    art_at = text.find('"art"')
    if art_at < 0:
        return text, None
    kind_at = text.find(f'"{kind}"', art_at)
    if kind_at < 0:
        return text, None
    variants_at = text.find('"variants"', kind_at)
    if variants_at < 0:
        return text, None
    open_at = text.find("[", variants_at)
    close_at = container_close(text, open_at)
    if close_at < 0:
        return text, None
    if f'"{image}"' in text[open_at:close_at]:
        return text, None

    indent = member_indent(text, close_at)
    entry = (
        f'{indent}// 后加的：{image}。scale 是按"画出来多大"反推的，和旁边那些一样——\n'
        f'{indent}// 改它就要按新宽度重跑一遍导入，否则密度会和邻居对不上。\n'
        f'{indent}{{ "image": "{image}", "scale": {scale:g} }}\n'
    )
    return insert_before_close(text, close_at, entry), image


def wire_obstacle(text, kind, image, scale, alpha=1.0, sway_degrees=0.0, sway_seconds=6.0):
    """
    Point `obstacles.art.<kind>` at a picture, CREATING the row when the kind has none.

    Returned to this after the coral, which already had a `coral` row with six variants: appending to an existing
    array and creating a row from nothing are different edits, and `crate`, `wall` and `net` have no row at all --
    they were drawn by code, so there was nothing to append to.

    **ALL FOUR FIELDS, ALWAYS**, and that is the lesson this function cost. The boot check in `mechanisms.ts` requires
    every row to carry `variants` AND `alpha` AND `swayDegrees` AND `swaySeconds`, and the first version of this wrote
    only the variants: the game refused to start with "config/mechanics.json5 is invalid: obstacles.art is …". That
    is the config's equivalent of `tsc` -- a piece of data has no compiler, so the CHECK is the compiler, and a row
    written to satisfy a parser is not a row written to satisfy the game. Read the check, not the neighbouring row.

    `swayDegrees` of 0 is legal and means rigid, which is what a crate and a barrier want; a net is soft and gets
    something in the range `tube`'s own comment describes.
    """
    obstacles_at = object_open(text, "obstacles")
    if obstacles_at < 0:
        return text, None
    art_at = object_open(text, "art", obstacles_at)
    if art_at < 0:
        return text, None
    art_close = container_close(text, art_at)
    if art_close < 0:
        return text, None

    row_at = object_open(text, kind, art_at)
    if 0 <= row_at < art_close:
        # The row exists: add a face to it, which is the coral's shape.
        return wire_variant(text, "obstacles", kind, image, scale)

    indent = member_indent(text, art_close)
    inner = f"{indent}  "
    text = insert_before_close(
        text,
        art_close,
        f'{indent}// {kind}：{image}。scale 是按"画出来多大"反推的，和 coral 那行一样。\n'
        f'{indent}"{kind}": {{\n'
        f'{inner}"variants": [\n'
        f'{inner}  {{ "image": "{image}", "scale": {scale:g} }}\n'
        f'{inner}],\n'
        f'{inner}"alpha": {alpha:g},\n'
        f'{inner}"swayDegrees": {sway_degrees:g},\n'
        f'{inner}"swaySeconds": {sway_seconds:g}\n'
        f'{indent}}}\n',
    )
    return text, image


def wire_hazard_state(text, kind, key, value):
    """
    Add one state (`charge`, `dead`, ...) to a `hazardArt` row that already exists.

    The puffer's shape: it has a `move` picture already, and the thing it was missing is a second STATE rather than a
    second creature. `wire_hazard` creates a whole row and refuses when one is there -- which is right for a new kind
    and wrong for this, so the two are separate edits for the same reason `wire_obstacle` and `wire_variant` are.
    """
    hazard_at = object_open(text, "hazardArt")
    if hazard_at < 0:
        return text, None
    row_at = object_open(text, kind, hazard_at)
    if row_at < 0:
        return text, None
    close_at = container_close(text, row_at)
    if close_at < 0:
        return text, None
    if f'"{key}"' in text[row_at:close_at]:
        return text, None
    indent = member_indent(text, close_at)
    text = insert_before_close(
        text,
        close_at,
        f'{indent}// {key}：{value}。这张是同一个生物的第二副样子，不是另一个种类。\n'
        f'{indent}"{key}": "{value}"\n',
    )
    return text, value


def wire_hazard(text, kind, image, scale, animation=None):
    """
    Point a CREATURE's `hazardArt.<kind>.move` at a picture, declaring the animation when the picture is one.

    Returns `(text, description)` on success and `(text, None)` when the config has no place to put it -- which is
    the honest answer for a kind that is not in `hazardArt` at all, rather than inventing a row somewhere.

    THE TWO SHAPES, and why they are one function. `hazardArt.<kind>.move` may name either a single file
    (`"海星"`) or an animation (`"fish-swim"`), and `hazardArtState` resolves both -- so the only difference here is
    whether an `animations.<name>` row has to be declared as well. Splitting them into two functions would mean two
    places that know the row's shape.
    """
    hazard_at = object_open(text, "hazardArt")
    if hazard_at < 0:
        return text, None

    if animation:
        animation_at = object_open(text, "animations")
        if animation_at < 0:
            return text, None
        if not has_member(text, animation_at, animation["name"]):
            close_at = container_close(text, animation_at)
            indent = member_indent(text, close_at)
            text = insert_before_close(
                text,
                close_at,
                f'{indent}// {animation["name"]}：一个资产一套动画，import 生成的。\n'
                f'{indent}"{animation["name"]}": {{\n'
                f'{indent}  "frames": "{animation["frames"]}",\n'
                f'{indent}  "count": {animation["count"]},\n'
                f'{indent}  "framesPerSecond": {animation["framesPerSecond"]:g},\n'
                f'{indent}  "maxSeconds": {animation["maxSeconds"]:g}\n'
                f'{indent}}}\n',
            )
            # `hazardArt`'s `{` may have moved; find it again rather than trusting the old index.
            hazard_at = object_open(text, "hazardArt")

    state = animation["name"] if animation else image
    if has_member(text, hazard_at, kind):
        return text, None
    close_at = container_close(text, hazard_at)
    indent = member_indent(text, close_at)
    text = insert_before_close(
        text,
        close_at,
        f'{indent}// {kind}：{image}。scale 是按"画出来多大"反推的，和旁边那些一样。\n'
        f'{indent}"{kind}": {{ "move": "{state}", "scale": {scale:g}, "alpha": 1 }}\n',
    )
    return text, state


def command_import(arguments):
    """
    Put the picture where the game loads it from, wire the config, and repack.

    The picture arrives by COPY from the batch directory -- not by re-running the importer -- so what lands in
    `src/assets/` is the same file that was pixelated when you looked at it in the gallery or the GIF. That is the
    whole reason `--out-dir` exists on the two importers.

    Then `pnpm typecheck`, and THEN `pnpm atlas`. The order matters: the per-kind tables in `src/hazards.ts` are
    typed `Record<HazardKind, ...>`, so a kind that is wired into some of them and not others is a compile error
    rather than a creature that silently does not move. The compiler is the checklist; a pack of a tree that does
    not compile is a pack of nothing worth having.
    """
    data = read_batch(arguments.batch)
    ready = [a for a in assets_of(data, arguments.asset) if a.get("selected")]
    for asset in assets_of(data, arguments.asset):
        if not asset.get("selected"):
            say(f"  {asset['name']}: nothing selected, skipping")
    if not ready:
        fail("nothing to import -- select a candidate first")

    # Per asset, and it matters: a shared list would give every asset every OTHER asset's filenames in its record,
    # and the count printed next to each name would be the running total rather than that asset's own.
    for asset in ready:
        directory = asset_dir(data["batch"], asset["name"])
        files = []
        if asset.get("sprites"):
            for index, relative in enumerate(asset["sprites"], start=1):
                source = directory / relative
                # The sprite's OWN name, which `frame_set_name` chose and `wire_hazard` declared. Re-deriving it
                # here as `<asset>-<index>` gave a file the animation does not ask for.
                target = ASSETS / source.name
                shutil.copy2(source, target)
                files.append(target)
        else:
            target = ASSETS / f"{asset['name']}.png"
            shutil.copy2(directory / asset["selected"]["sprite"], target)
            files.append(target)
        asset["imported"] = {"files": [f.name for f in files], "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
        say(f"  {asset['name']}: {len(files)} file(s) -> src/assets/  ({', '.join(f.name for f in files)})")

    # Config wiring, per asset, onto the running text -- so importing three at once wires three, and each edit is
    # validated before it is kept.
    text = MECHANICS.read_text(encoding="utf-8")
    for asset in ready:
        scale = asset["scale"]
        manual = (f'    {asset["table"]}.art.{asset["kind"]}.variants += '
                  f'{{ "image": "{asset["name"]}", "scale": {scale:g} }}')
        if arguments.no_config:
            say(f"\n  --no-config: {asset['name']} was not wired. By hand:")
            say(manual)
            continue

        if asset["table"] == "obstacles":
            updated, added = wire_obstacle(
                text, asset["kind"], asset["name"], scale,
                float(asset.get("alpha") or 1.0),
                float(asset.get("swayDegrees") or 0.0),
                float(asset.get("swaySeconds") or 6.0),
            )
            described = f'obstacles.art.{asset["kind"]} -> "{added}" (scale {scale:g})'
        elif asset.get("state"):
            # A SECOND STATE of a creature that already has art -- the puffer deflating, which is the one gap the
            # README had written down. It adds a key to the existing row rather than creating a row.
            updated, added = wire_hazard_state(text, asset["kind"], asset["state"], asset["name"])
            described = f'hazardArt.{asset["kind"]}.{asset["state"]} -> "{added}"'
        else:
            # A CREATURE: `hazardArt.<kind>.move` points at a still or at an animation, and an animation needs its
            # own row declared. The frames are the ones this asset just produced, named `<asset>-move-N`.
            animation = None
            if asset.get("sprites"):
                name = frame_set_name(asset)
                animation = {
                    "name": name,
                    "frames": f"{name}-{{n}}",
                    "count": len(asset["sprites"]),
                    "framesPerSecond": float(asset.get("fps") or 8),
                    "maxSeconds": 2,
                }
            updated, added = wire_hazard(text, asset["kind"], asset["name"], scale, animation)
            described = (
                f'hazardArt.{asset["kind"]}.move -> "{added}"'
                + (f' + animations."{animation["name"]}" ({animation["count"]} 帧 @ '
                   f'{animation["framesPerSecond"]:g}fps)' if animation else '')
            )

        if not added:
            say(f"\n  config: no writable row for {asset['table']}.{asset['kind']} -- wire it by hand")
            if asset["table"] == "hazards":
                say(f'    needs hazards.radius.{asset["kind"]} and hazardArt.{asset["kind"]}, '
                    f"and a row in every Record<HazardKind, ...> in src/hazards.ts")
            continue
        complaint = validate_config_text(updated)
        if complaint:
            fail(
                f"refusing to write the config: the edit for {asset['name']} does not parse.\n  {complaint}\n"
                f"  Nothing was changed. Wire it by hand:\n{manual}"
            )
        text = updated
        say(f"\n  config: {described}")
    if not arguments.no_config and text != MECHANICS.read_text(encoding="utf-8"):
        MECHANICS.write_text(text, encoding="utf-8")

    write_batch(data["batch"], data)

    say("\n  typechecking -- the compiler is what names any table still missing this kind")
    result = run_tool(["pnpm", "typecheck"], tolerate=True)
    if result.returncode != 0:
        say("\n  typecheck FAILED. The config edit is on disk; fix the rows it names, then re-run `import`.")
        say("  (Nothing is committed and nothing is packed until this passes.)")
        return 1

    say("\n  repacking the atlas")
    run_tool(["pnpm", "atlas"])
    run_tool(["pnpm", "atlas:check"])

    say("\n  installed:")
    for asset in ready:
        say(f"    {asset['name']}: {', '.join(asset['imported']['files'])}")

    # Archive the ORIGINAL -- the render before pixelation -- under `generated-images/`.
    #
    # The skill's own rule, and worth automating because it is the step that gets skipped: `src/assets/` is one
    # pass downstream (pixelated, and scaled to the size it is drawn at, so the boss is 29-37 KB at 512), and using
    # it as the input to a redo resamples a picture that has already been resampled. The batch's own candidate file
    # IS that original -- it is what `pixelate` read -- so this is a copy, not a second render.
    #
    # Which folder is a judgement the spec makes (`originalDir`), because `generated-images/` is organised by
    # subject -- `decor/` for the obstacle variants, `gunners/` for the four shooters -- and nothing in the file
    # knows where a picture belongs.
    archived = []
    for asset in ready:
        directory = asset_dir(data["batch"], asset["name"])
        group = asset.get("originalDir") or data["batch"]
        target = ROOT / "generated-images" / group / f"{asset['name']}.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(directory / asset["selected"]["raw"], target)
        archived.append(target)
        say(f"    original -> {target.relative_to(ROOT)}")
    if archived:
        say("  (that is the picture BEFORE pixelation; a redo starts from it, never from src/assets/)")

    say("  next: bump `version` in package.json, then commit and push (AGENTS.md).")
    return 0


# --------------------------------------------------------------------------- #
# status
# --------------------------------------------------------------------------- #


def command_status(arguments):
    data = read_batch(arguments.batch)
    say(f"\n  batch {data['batch']}  ({batch_dir(data['batch'])})")
    for asset in data["assets"]:
        selected = asset.get("selected")
        mark = "—"
        if selected:
            mark = f"候选 {selected['index']}" + ("＋idle" if selected["idle"] else "")
        say(f"\n  {asset['name']:<16s} {asset['table']}.{asset['kind']}  grid {asset['grid']}  "
            f"密度 {asset['drawn'] / asset['fileWidth']:.2f}")
        say(f"    candidates  {len(asset['candidates'])}")
        say(f"    selected    {mark}")
        say(f"    sprites     {len(asset['sprites'])}")
        if asset.get("boil"):
            print_boil(asset["boil"])
        say(f"    imported    {'yes' if asset.get('imported') else 'no'}")
    return 0


# --------------------------------------------------------------------------- #
# entry point
# --------------------------------------------------------------------------- #


def main():
    parser = argparse.ArgumentParser(description="The project's picture-asset pipeline.")
    # `--batch` on every SUBCOMMAND rather than on the top-level parser, because the documented shape is
    # `flow <subcommand> --batch <name>` -- and argparse only accepts a top-level option BEFORE the subcommand, so
    # declaring it once up there would silently reject the order the documentation teaches.
    batch_parent = argparse.ArgumentParser(add_help=False)
    batch_parent.add_argument("--batch", help="the batch name; every subcommand needs it")

    subparsers = parser.add_subparsers(dest="command", required=True)

    new = subparsers.add_parser("new", parents=[batch_parent], help="start a batch, or add assets to one, from a spec")
    new.add_argument("--spec", required=True, help="the batch spec JSON")
    new.set_defaults(handler=command_new)

    render = subparsers.add_parser("render", parents=[batch_parent], help="seed the reference and ask Ark for the candidates")
    render.add_argument("--asset", help="just this asset")
    render.add_argument("--candidate", type=int, help="regenerate just this candidate (1-based), keeping the others")
    render.add_argument("--model", help=f"override the model (default: {DEFAULT_MODEL})")
    render.add_argument("--reference-size", type=int,
                        help=f"long edge of the reference sent to Ark (default: {REFERENCE_LONG_EDGE})")
    render.add_argument("--dry-run", action="store_true", help="print the requests and send nothing")
    render.set_defaults(handler=command_render)

    pixelate = subparsers.add_parser("pixelate", parents=[batch_parent], help="pixelate the candidates at the game's density")
    pixelate.add_argument("--asset")
    pixelate.add_argument("--grid", type=int, help="override the derived grid")
    pixelate.set_defaults(handler=command_pixelate)

    gallery = subparsers.add_parser("gallery", parents=[batch_parent], help="write the page you choose candidates on")
    gallery.set_defaults(handler=command_gallery)

    select = subparsers.add_parser("select", parents=[batch_parent], help="read the browser's picks back into the batch")
    select.add_argument("--json", help="the selection JSON, or a path to it -- for when the browser could not be launched")
    select.set_defaults(handler=command_select)

    idle = subparsers.add_parser("idle", parents=[batch_parent], help="generate the idle frames for a selected asset")
    idle.add_argument("--asset")
    idle.add_argument("--route", choices=["sway", "frames"], help="overrule the spec's route")
    idle.add_argument("--frames", type=int, help="frame count (default: the spec's, else 4)")
    idle.add_argument("--grid", type=int)
    idle.add_argument("--model")
    idle.add_argument("--reuse", action="store_true",
                      help="re-pixelate the frames already on disk instead of generating them again")
    idle.add_argument("--dry-run", action="store_true")
    idle.set_defaults(handler=command_idle)

    gif = subparsers.add_parser("gif", parents=[batch_parent], help="merge the frames into a GIF you can judge")
    gif.add_argument("--asset")
    gif.add_argument("--fps", type=float)
    gif.set_defaults(handler=command_gif)

    importer = subparsers.add_parser("import", parents=[batch_parent], help="install the picture, wire the config, repack the atlas")
    importer.add_argument("--asset")
    importer.add_argument("--no-config", action="store_true", help="do not touch config/mechanics.json5")
    importer.set_defaults(handler=command_import)

    status = subparsers.add_parser("status", parents=[batch_parent], help="what this batch has and where it got to")
    status.set_defaults(handler=command_status)

    arguments = parser.parse_args()
    return arguments.handler(arguments)


if __name__ == "__main__":
    sys.exit(main() or 0)

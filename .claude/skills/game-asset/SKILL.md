---
name: game-asset
description: Generate and ship art for 冒泡大作战 / Bubble Battle - call the Seedream image API (transparency, interactive editing by coordinate, layer decomposition), then seed transparency, pixelate and anchor-align the frames, import into src/assets/ and repack the atlas. Use when adding or redoing creature, prop, pickup, background or HUD art (an idle/walk/attack animation, sprite frames, a sprite sheet, a transparent PNG asset, a TexturePacker atlas JSON), when asked to generate or regenerate a picture with Seedream / Doubao / Ark, or to re-pixelate, re-align, resize or re-pack existing frames, or when a new creature needs art wired into config/mechanics.json5.
---

# Game asset pipeline

The pipeline that produced every picture in `src/assets/`: transparency, pixelation onto the game's grid,
anchor alignment, packing, and a check that decodes the result back to pixels. It is subject-agnostic —
nothing in it knows whether it is drawing a crab or a bullet.

It was written and run under a different harness (dsh), where the image model was a host tool. It is not a host
tool here — it is an HTTP API — so the way in which the first step runs has changed. Read the next section before
following any step below.

## Generating the render, and the key it needs

The model is **Volcengine Ark** (Doubao Seedream), called over HTTP:

```
POST https://ark.cn-beijing.volces.com/api/v3/images/generations
Authorization: Bearer $ARK_API_KEY
```

`reference/seedream.md` is the request reference — model IDs, parameters, sizes, input constraints, limits — and
`reference/api-notes.md` is what this pipeline measured against the live endpoint.

**It needs `ARK_API_KEY`, and that is not set in this environment.** Checked 2026-10-09: not in the environment,
not in `~/.dsh/.env`, and nothing in this repo reads it. So as things stand this skill cannot generate a picture,
and the honest move is to ask the owner to export a key or to supply the render. Never invent a key, and never
claim to have generated an image you did not.

With the key exported, generation is a `curl` (curl is present here) or a Python call, and the loop is:

1. **Choose the model**: `doubao-seedream-5-0-pro-260628` for quality, `doubao-seedream-5-0-flash-260915` for
   speed and price. Only these two have transparent output, interactive editing and layer decomposition; 4.5 and
   4.0 are JPEG-only with no transparency mode at all, so their only route to an RGBA frame is a local key —
   which the rule below says is the worse one.
2. **Generate the reference** with a clean flat background — pure black for anything that glows.
3. **Seed it** with `grant` (see the rule below): Ark refuses to produce transparency from a fully opaque input.
4. **Write the frame spec, then generate.** Put the per-frame prompts in JSON *first*, so they are reviewable
   before anything is paid for and re-runnable afterwards — the same reference and the same subject wording on
   every frame, with only the phase description differing. `<pipeline> plan --spec frames.spec.json --out
   frames.plan.json` generates nothing: it resolves the spec into the exact request body per frame and refuses
   early when the reference is missing or has no alpha channel. Then one request per frame.
5. **Pixelate, align, verify**, then import.

That reference has the rest of it: the resolution tiers per model and the aspect ratios they map to, the prompt
budget (≤ 300 Chinese characters), passing a local file as `data:image/png;base64,…`, and the 24-hour expiry on
every returned URL.

Two capabilities of 5.0 pro/flash are worth reaching for, because they do what prompts do badly:

- **Interactive editing** — write the location as a normalized coordinate (`0–999`) in the prompt:
  `把图1 <bbox>120 180 640 760</bbox> 区域替换成花园`. This is how to say "the thing *there*" rather than "the
  creature on the left", which the model keeps misreading.
- **Layer decomposition** — one picture into a base plus up to 16 transparent layers, each with the box and
  z-order needed to put it back. That is the shape of a parallax backdrop. It is a *generation*, not a
  segmentation: the layers are redrawn, so it is not a lossless split of the input.

Two smaller substitutions for things the old harness provided:

- **`read_image`** (how the dsh Web UI showed a picture) does not exist here. Use the **Read** tool on a PNG —
  it renders the image. Read the **`-checker`** file when there is one: transparency is invisible on a white
  background, which is where a broken cutout hides.
- **The loading snippet in step 5 of the original skill is wrong for this project.** It uses `fetch` +
  `AnimatedSprite` + `animation.json`. TGBA loads pictures through `src/assets.ts` (`assetTextureNow(name)`,
  `loadAnimationTextures(animation)`) out of a packed atlas, and the animation is declared in
  `config/mechanics.json5`, not in a JSON that ships beside the art. See "Import into TGBA" below.

## Where the pipeline lives

```
.claude/skills/game-asset/scripts/asset_pipeline.py    the pipeline (self-contained copy)
.claude/skills/game-asset/scripts/run.ps1              finds a Python with Pillow and forwards every argument
.claude/skills/game-asset/reference/seedream.md        the Ark API as documented (request, params, limits)
.claude/skills/game-asset/reference/api-notes.md       the Ark API as measured by this pipeline
```

`refs/asset_pipeline.py` is the project's other copy, and the two were **byte-identical at migration**
(`md5 e918726bf7aac64202dbe8008c8fff91`, 2026-10-09). They are deliberately both kept so this skill can be copied
to another project on its own — which means an edit to one is a silent divergence until someone notices. If you
change either, run `md5sum` on both.

Which copy a script picks up is worth knowing before you edit: `.scratch/import-tuna-sheet.py` and
`.scratch/pixelate-*.py` carry the path **hardcoded absolutely** —
`PIPELINE = Path(r"D:\TGBA\refs\asset_pipeline.py")` — while `scripts/import-sheet.py` resolves it relative to the
repo root. So the skill's copy is used by exactly one caller (this skill); everything in the repo goes to `refs/`,
and the hardcoded ones break if the repo moves.

## Running it

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .claude\skills\game-asset\scripts\run.ps1 <subcommand> [args]
```

Without `pwsh`, the same file runs under `powershell -ExecutionPolicy Bypass -File ...`.

Subcommands: `grant`, `key`, `plan`, `sheet`, `atlas`, `verify`. `run.ps1 --help` lists them. Below,
`<pipeline>` stands for that whole invocation, so `<pipeline> verify --dir sheet` means the command above with
`verify --dir sheet` appended.

The wrapper exists because **`python` on PATH on this machine is the Windows Store stub** — it exits without
running anything, which reads as "the script is broken". It probes, in order: `$DSH_PYTHON`, the newest
`$DSH_HOME\dsh-runtimes\<runtime>\dependencies\python\python.exe`, then `python.exe` on PATH — taking the first
that can `import PIL`. `scripts/pack-atlas.mjs` probes the same way for the same reason.

**The pipeline is not the only thing that needs that interpreter.** `scripts/import-sheet.py` and
`scripts/compose-swim-tail.py` import PIL and numpy too, so running them with a bare `python` gets the stub. Ask
the wrapper for the path once and pass it along:

```powershell
$py = pwsh -NoProfile -File .claude\skills\game-asset\scripts\run.ps1 python
& $py scripts\import-sheet.py <sheet.png> --name <名字> --cols 2 --rows 2
```

## The rule that shapes everything

Ark cannot make a transparent background from text, and it cannot make one from a fully opaque image either.
Measured against the live API when the pipeline was built:

| Request | Result |
|---|---|
| text-to-image + `background: "transparent"` | **HTTP 400** `requires exactly one input image` |
| image-to-image + completely opaque reference | **HTTP 400** `requires a PNG input with at least one transparent pixel` |
| image-to-image + a reference with **one** transparent pixel | works, and the model cuts the subject out itself |

So transparency has to be **seeded**, and one pixel is enough: a 1×1 transparent corner produced the same
silhouette as a careful local cutout. Do not spend effort segmenting the reference — `grant` writes 64
transparent pixels into a corner and stops there. The vendor documentation states the same thing as three
constraints: `background` applies to image-to-image only, to exactly **one** input image, and that image must
already carry an alpha channel; transparent mode is PNG-only, so `output_format: "jpeg"` beside it is an error
(and a jpeg *input* is too). See `reference/seedream.md — Transparency`.

```powershell
<pipeline> grant raw\reference.png -o keyed\reference.png
```

Reach for `key` instead only when you need alpha **you** control:

```powershell
<pipeline> key raw\reference.png -o keyed\reference.png    # --mode luminance | edge | auto
```

`--mode luminance` keys alpha from brightness (emissive subject on near-black). `--mode edge` flood-fills from
the border (flat or gradient backdrop). `--mode auto` (default) picks from the border colour. For hard-edged
sprites and glow subjects the model's own cutout is better — a local luminance key measured 18.4% partial alpha
against the model's 7.6%, the extra partial alpha being the failure mode: the body's dark parts go
nearly transparent and the creature washes out.

## Pixelate, align, verify

This is the part to get right, and where the numbers are:

```powershell
<pipeline> sheet --frames frames --out sheet --grid 192 --anchor top
<pipeline> atlas --dir sheet --name slime --animation idle --fps 8
<pipeline> verify --dir sheet
```

**`--grid` is not a taste knob in this project.** Every picture in TGBA is drawn at **1.4 screen pixels per
texel** (`TARGET_TEXEL_PX` in `scripts/import-sheet.py`), so the grid is *the width the game draws the thing at,
divided by 1.4*. Getting this wrong is what makes one creature look finer or coarser than its neighbours.
`sheet` also downsamples alpha separately and re-attaches it: letting the BOX filter average RGBA smears the
transparent edge into a grey halo.

Alignment translates each frame so its opaque bounding box sits on a fixed anchor — `--anchor top|center|bottom`,
`--anchor-x center|left|right`. Models draw each frame at its own scale and position; without this the sprite
swims. Measured on one 4-frame set when the pipeline was built: content tops differed by 27px and centres by
79px before, 0px and 0.5px after. It only translates, so the motion itself survives. `--scale content-width`
additionally normalises silhouette width, for when a size difference is a render inconsistency rather than motion.

**`atlas` is for a standalone asset, not for this game.** TGBA packs with `pnpm atlas` (see below) because the
game loads one atlas of everything, not one per creature. Use the pipeline's `atlas` only when producing an asset
for somewhere else.

**Always run `verify`.** A wrong atlas is silent in the engine — the JSON parses, PixiJS does not throw, and the
frames are misplaced. `verify` decodes every rect back to pixels and compares it to the sprite file, then checks
for overlapping rects, rects outside the texture, a `meta.size` that disagrees with the texture, and duplicate
frames.

## Import into TGBA

### A sprite sheet the owner drew

```powershell
& $py scripts\import-sheet.py sheet.png --name <名字> --cols 2 --rows 2
```

`scripts/import-sheet.py` is the project's front door for drawn sheets. It finds the frames by **connected
components**, not by cutting the image into `cols × rows` — a mechanical cut clips fins whenever the drawings are
not on an exact grid (`--cols`/`--rows` only sort the blobs into reading order). It then pixelates with the
project's own `pixelate()` at the grid the density calls for, with **one palette shared by every frame** (a
palette per frame would let two frames of one creature pick two different blues), aligns on the **head** in whole
texels, ignores stray noise components, and writes `src/assets/<名字>-1..N.png`.

Two gotchas, both real:

- **The default grid is the TUNA's.** With no `--grid` and no `--drawn`, the script reads
  `hazards.radius.tuna` × `hazardArt.tuna.scale` out of `config/mechanics.json5` — the kind name `"tuna"` is
  hardcoded in the regex. For any other creature pass `--drawn <width in screen px>` (or `--grid`) explicitly,
  and read `hazards.radius.<kind>` × `hazardArt.<kind>.scale` × 412 yourself.
- **`--name` defaults to `金枪鱼-游动`.** Forgetting it writes over the tuna's frames.

### A swim cycle where only the tail moves

```powershell
& $py scripts\compose-swim-tail.py sheet.png --out <目录> [--amplitude 15] [--body-frame 2]
& $py scripts\import-sheet.py <目录> --cols 4 --rows 1        # the four frames are already frame-sized
```

The other route, with the opposite trade-off: the body is not redrawn, so it is **byte-identical in every frame**
(no boiling, nothing to align), and the tail is a rotation about the peduncle, so the amplitude is one number.
What you give up is that the tail is a rotation of one drawing rather than a second pose for it. The frames are
read in reading order and the SECOND is used as the body; the peduncle is measured as the waist where the
silhouette stops thinning, not as the narrowest column — the tip of a crescent fin is thinner still. Prompting
cannot deliver "only the tail moves": four renders of the same reference measured 30–73% of the *body's* pixels
different, each frame carrying its own dithering pattern.

### Wire it into the game

1. **Picture**: `src/assets/<名>.png`. A name written in config never carries an extension, so replacing the file
   with a `.webp` of the same stem needs no code change.
2. **Size**: `hazards.radius.<kind>` in `config/mechanics.json5` is the collision radius **and** the drawn size.
   `hazardArt.<kind>.scale` multiplies only what is drawn, never what is hit. Changing `radius` changes the
   pixelation grid — re-derive it and re-run the import.
3. **State → art**: `hazardArt.<kind>` maps states to pictures (`front`, `move`, `charge`, `dead`, `scale`,
   `alpha`).
4. **Multi-frame states**: declare `animations.<id>` and point `hazardArt` at **that name** instead of a file
   (`"move": "tuna-swim"`). `frames` is either a numbered template with `count` (`"水母-待机-{n}"`, numbering from
   1) or an explicit list. `framesPerSecond` and `maxSeconds` are both limits and **the shorter one wins** —
   the rate says how it should read, the ceiling stops a 4-frame sheet at 0.5 fps from looking frozen. `once:
   true` plays through and holds the last frame; absent means loop.
5. **Place it**: `config/levels/<level>.json5`, `spawns: [{ at, kind, … }]`.
6. **Repack**: `pnpm atlas`, then `pnpm atlas:check` to confirm nothing is stale.

**The compiler is the checklist.** The per-kind tables in `src/hazards.ts` are typed `Record<HazardKind, …>`
(`KIND_TUNING`, `CREATURES`, `CONTACT_EFFECTS`, `CREATURE_DRAWING`), so a new kind that is wired into some of them
and not others is a `pnpm typecheck` error rather than a creature that silently does not move. Add the kind first
and let `tsc` name every place that needs a row.

`pnpm atlas` writes `src/assets/atlas/atlas-1.webp` + `.json` and **commits them**, because the deploy runs
`pnpm exec vite build` on a clean Node runner and a Python packer on that path is a Python dependency in front of
every deploy. The price is staleness — replace a picture, forget to repack, and the game keeps showing the old
one with nothing to say so. `pnpm atlas:check` compares every source's size and hash against the manifests and
names the ones that are behind. It is deliberately not part of `vite build`.

## Keep the original; the intermediates are disposable

**The render before pixelation is the thing worth keeping, not `src/assets/`.** `src/assets/` is one pass
downstream — pixelated, and scaled to the size it is drawn at (the boss is 29–37 KB at 512) — so using it as the
input to a redo resamples a picture that has already been resampled. That is how the first jellyfish went soft.

Originals live in `generated-images/`, and **only** originals do: `before-pixel-pass/`,
`boss-512-before-pixelation/`, `tuna-sheet/raw.png`, `tuna/reference.png`. Everything else — candidate grids,
checker previews, packed sheets, GIFs, probes — is an intermediate and belongs deleted; the scripts that make
them (`scripts/import-sheet.py`, `.scratch/pixelate-*.py`) are what makes that safe. Add an original when you add
art, and clean up after yourself. README's "原图" section is the long version, including the two pictures that no
longer have one.

## Reporting to the user

State the numbers the tools printed: canvas size, frame count, file size, decoded bytes, the grid and the screen
pixels per texel it implies, and the anchor-check result. Then **show the picture**: Read the `-checker` PNG, and
the level's own screenshot if you changed how something looks in play.

If you generated anything, say which model and which size you asked for, and **save every returned image to disk
before doing anything else** — the URLs expire in 24 hours.

Then commit — bump `version` in `package.json` in the same commit and push to `origin main`, per `AGENTS.md`.

## Traps worth remembering

**Pipeline side — every one of these was a real bug here:**

- **`Image.paste(frame, pos, frame)` is not a copy.** Passing an image as its own mask makes PIL composite it; on
  PIL 12.3 that rewrote 36,234 of a 204×205 frame's pixels while the sizes still matched, so it was invisible.
  Assemble with a plain paste and re-read what you wrote to confirm it round-trips byte-identically.
- **Downsample alpha separately**, or a transparent edge becomes a grey halo.
- **Watch for stray files entering the frame set.** A re-run can pick up the previous run's atlas texture as an
  extra "frame". When the directory has an `animation.json`, treat its frame list as authoritative.
- **Alignment is translation only.** If frames still look wrong after it, the cause is a size difference (use
  `--scale content-width`) or the model drew a different creature (regenerate).
- **Two routes to a swim cycle, and they are not interchangeable.** Per-frame renders keep the artist's own poses
  and boil; a composed tail-only cycle is perfectly stable and has one pose rotated. Pick deliberately — the tuna
  has been through both.

**API side:**

- **Download immediately.** Every generated URL is deleted after 24 hours, and there is no second chance.
- **A tier is a class, not a dimension.** `size: "2K"` came back 1584×2816 for a 9:16 prompt. Read the size you
  actually got, and ask for the aspect ratio in the prompt rather than assuming the tier set it.
- **The model ID's date suffix is required.** `doubao-seedream-5-0-flash` is a 404; `…-260915` is the model.
- **One frame per call.** Batch generation (`sequential_image_generation`) does not exist on 5.0 pro/flash — the
  only models with transparency — so a frame set is N requests and N decisions, not one.
- **Aspect ratio.** Pick the frame shape in the prompt and keep it consistent; the pipeline crops to content, so
  a drifting aspect ratio becomes visible drift.

`reference/seedream.md` is the API as documented — every request parameter, the size tables, the input
constraints, interactive editing, layer decomposition and the IPM limits. `reference/api-notes.md` is the API as
measured, and wins where the two disagree: the model-ID rules, the three transparency refusals, and the numbers
behind every default above.

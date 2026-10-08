---
name: game-asset
description: Turn a render that already exists into a shippable sprite for 冒泡大作战 / Bubble Battle - seed transparency, write the frame spec, pixelate and anchor-align the frames, then import into src/assets/ and repack the atlas. Use when adding or redoing creature, prop, pickup or HUD art (an idle/walk/attack animation, sprite frames, a sprite sheet, a transparent PNG asset, a TexturePacker atlas JSON), or when asked to re-pixelate, re-align, resize or re-pack existing frames, or when a new creature needs art wired into config/mechanics.json5.
---

# Game asset pipeline

The pipeline that produced every picture in `src/assets/`: transparency, pixelation onto the game's grid,
anchor alignment, packing, and a check that decodes the result back to pixels. It is subject-agnostic —
nothing in it knows whether it is drawing a crab or a bullet.

It was written and run under a different harness (dsh), where the image model was a host tool. **Read the next
section before following any step below**, because that tool does not exist here.

## What can and cannot run here

| Step | Tool | Here? |
|---|---|---|
| 1. Generate the reference render | `generate_image` (Volcengine Ark / Doubao Seedream) | **No** — a dsh host tool, not present in this environment, and nothing in this repo calls Ark |
| 2. Seed transparency (`grant` / `key`) | `scripts/asset_pipeline.py` | yes |
| 3. Write the frame spec, resolve the plan (`plan`) | `scripts/asset_pipeline.py` | `plan` yes; the `generate_image` calls it prints are step 1's problem |
| 4. Pixelate, align, verify (`sheet`, `atlas`, `verify`) | `scripts/asset_pipeline.py` | yes |
| 5. Import into this game | `scripts/import-sheet.py`, `scripts/compose-swim-tail.py`, `pnpm atlas` | yes |

So the runnable half is **"a render already exists, make it shippable"**. The render comes from outside: The
owner draws it, or it is generated elsewhere. Do not claim to have generated an image.

Two smaller substitutions:

- **`read_image`** (how the dsh Web UI showed a picture) does not exist either. Use the **Read** tool on a PNG —
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
.claude/skills/game-asset/reference/api-notes.md       the measured API behaviour behind every default
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
transparent pixels into a corner and stops there.

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

Then commit — bump `version` in `package.json` in the same commit and push to `origin main`, per `AGENTS.md`.

## Traps worth remembering

Every one of these was a real bug in this pipeline:

- **`Image.paste(frame, pos, frame)` is not a copy.** Passing an image as its own mask makes PIL composite it; on
  PIL 12.3 that rewrote 36,234 of a 204×205 frame's pixels while the sizes still matched, so it was invisible.
  Assemble with a plain paste and re-read what you wrote to confirm it round-trips byte-identically.
- **Downsample alpha separately**, or a transparent edge becomes a grey halo.
- **Watch for stray files entering the frame set.** A re-run can pick up the previous run's atlas texture as an
  extra "frame". When the directory has an `animation.json`, treat its frame list as authoritative.
- **Alignment is translation only.** If frames still look wrong after it, the cause is a size difference (use
  `--scale content-width`) or the model drew a different creature (regenerate).
- **Aspect ratio.** Pick the frame shape in the prompt and keep it consistent; the pipeline crops to content, so
  a drifting aspect ratio becomes visible drift.
- **Two routes to a swim cycle, and they are not interchangeable.** Per-frame renders keep the artist's own poses
  and boil; a composed tail-only cycle is perfectly stable and has one pose rotated. Pick deliberately — the tuna
  has been through both.

`reference/api-notes.md` has the full measured API behaviour, the model-ID rules (the version suffix is
mandatory), the per-model capability matrix, and the numbers behind every default above.

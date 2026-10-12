---
name: game-asset
description: Generate and ship art for 冒泡大作战 / Bubble Battle. The pipeline (`asset_flow.py`) goes from a real reference photograph to a wired-in game asset — find and screen a reference image, ask the Seedream API for three candidates, pixelate them at the game's density, decide about an idle animation, and import. The substrate under it (`asset_pipeline.py`) does the Seedream image API itself (transparency, interactive editing by coordinate, layer decomposition), transparency seeding, pixelation, anchor alignment and atlas packing. Use when adding or redoing creature, prop, pickup, background or HUD art (an idle/walk/attack animation, sprite frames, a sprite sheet, a transparent PNG asset, a TexturePacker atlas JSON), when asked to pick a reference photo or generate/review candidate art, when asked to generate or regenerate a picture with Seedream / Doubao / Ark, to re-pixelate, re-align, resize or re-pack existing frames, or when a new creature needs art wired into config/mechanics.json5.
---

# Game asset pipeline

**Two layers, and the order matters.** `asset_flow.py` is the PIPELINE — the whole procedure from "find a real
reference photograph" to "the picture is in the game and the config knows about it", as one command per step.
`asset_pipeline.py` underneath it is the SUBSTRATE — transparency seeding, the pixelation itself, alignment, atlas
packing, verification — and it is deliberately subject-agnostic: nothing in it knows whether it is drawing a crab
or a bullet. Read "The pipeline" first; everything after it is the substrate and the measurements behind it.

## The pipeline (`asset_flow.py`)

It exists because the four-gunner batch was done BY HAND and the procedure was worth keeping: a photograph from
Wikimedia, `grant`, Seedream flash, a grid derived from `obstacles.radius`, `import-picture.py`, a config row. That
is now six commands with a JSON file holding the state between them.

```powershell
$run = ".claude\skills\game-asset\scripts\run.ps1"
pwsh -NoProfile -ExecutionPolicy Bypass -File $run flow <subcommand> --batch <name> [options]
```

`run.ps1` reaches both scripts: `flow …` goes to `asset_flow.py`, anything else to `asset_pipeline.py`, so every
command documented further down still works exactly as written.

### The state, and why it is a file

`.scratch/asset-pipeline/<batch>/batch.json` is the whole of the pipeline's memory — the derived numbers, the
candidates, what was picked, whether it wants an idle animation, what was imported. One record per asset, and a
batch holds SEVERAL assets, because "generate a lot of them at once and let me pick quickly" is the request this
was built for. Every step re-reads it, so "regenerate candidate 3" or "that one does want an idle after all" is
one command rather than a re-run from the top. `.scratch/**` is gitignored: this is working state.

### The six steps

```powershell
# 1. the spec, written first so the prompts are reviewable before anything is paid for
& $run flow new --spec .scratch/asset-pipeline/<batch>.spec.json

# 2. seed the reference and ask Ark for three candidates  (--dry-run sends nothing)
& $run flow render --batch <batch> [--dry-run] [--candidate 2]

# 3. pixelate each candidate at the game's density
& $run flow pixelate --batch <batch>

# 4. look at them, pick one, say whether it wants an idle animation
& $run flow gallery --batch <batch>
node .claude\skills\game-asset\scripts\gallery-driver.mjs <batch>/gallery.html <batch>/selection.json
& $run flow select --batch <batch>

# 5a. no idle: straight in
& $run flow import --batch <batch> --asset <name>

# 5b. idle: frames, a GIF to confirm, then in
& $run flow idle --batch <batch> --asset <name> [--frames 4]
& $run flow gif  --batch <batch> --asset <name>
& $run flow import --batch <batch> --asset <name>

& $run flow status --batch <batch>        # where it got to
```

### What `import` wires, and the three shapes it has to know

`import` edits `config/mechanics.json5` as TEXT — it is JSON5 full of the comments that make it worth reading, so
re-serialising it would throw all of that away — and the three things it has to write are three different edits:

| what | where | note |
|---|---|---|
| a face for an obstacle that already has a row | `obstacles.art.<kind>.variants` | append one `{ image, scale }` (the coral's shape) |
| a WHOLE row for an obstacle that has none | `obstacles.art.<kind>` | `crate`, `wall` and `net` were drawn by code, so there was nothing to append to |
| a creature | `hazardArt.<kind>.move` (+ `animations.<name>`) | `move` may name a still OR an animation; an animation needs its own row declared |
| **a BOSS** | `hazardArt.<boss-kind>`, never `hazardArt.boss` | see below — the one row here whose WRONG key looks like a no-op rather than a mistake |
| **a creature with SEVERAL animations** | `hazardArt.<kind>.<clip>` for each clip | `move`/`attack`/`dead`; the row already exists, so the edit REPLACES three values and declares three animations |

**A CREATURE CAN HAVE SEVERAL ANIMATIONS, AND THE SPEC SAYS SO WITH `clips`.** An asset with no `clips` gets one,
`move`, built from the old `idle` block — which is every asset made before the bosses. A boss needs three, and they
are three different KINDS of animation rather than three lengths of one: an idle loop, the swing its attack is timed
against (the release frame is a FRAME of that swing — `hazards.bosses.<kind>.attackSprayFrame`), and a death that
plays once and holds. `clips_of(asset)` is the one place that knows the shape.

- **They are ONE asset, not three**, and that is the whole point: three assets would each pick their own candidate
  from their own render, so a creature's idle and its death would be two slightly different animals. Frame 1 of
  EVERY clip is the selected candidate itself (ungenerated), so all of them begin and end on the approved picture.
- **Every clip is normalised in ONE pass**, so all of a creature's frames land on one canvas at one scale. Per clip
  would give each its own median width, and an attack whose claws are spread has a wider median than an idle — so
  the creature would be drawn a few percent larger for the duration of the swing.
- **`--clip <name>` regenerates ONE clip, and it BREAKS that sharing**, so a following `--reuse` over all the clips
  is what puts them back on one canvas. Not hypothetical: a transient Ark 500 mid-run left a boss with its first clip
  unrendered, and regenerating just the missing clips gave three clip-specific canvases until a `--reuse` pass
  measured the three median content widths (1165 / 1162 / 1152) and locked them together.
- **`--frames` is refused for a multi-clip asset** (one length cannot serve three), and **`--asset` takes ONE exact
  name** — a comma-separated list is a `no asset 'a,b,c'` error, so a batch is a shell loop.

**THE PAGE THAT PICKS CANDIDATES LETS ONE ASSET HOLD TWO PICKS.** It removed a pick only when the KEY matched
exactly (`name#index`), so clicking candidate 1 and then candidate 3 of one creature left both in `selection.json` —
and the answer then depended on which one `select` happened to write last. It now drops every pick for that NAME
before pushing, so a second click replaces the first. Found by a real selection file with two picks for the jellyfish
and two for the shark.

**AND `new` MUST MERGE A CLIP, NOT REPLACE IT.** The spec owns a clip's INPUTS (how many frames, how fast, what each
frame is asked for); `_render_frames` writes what came OUT into the same dicts (`sprites`, `boil`, `fps`, `name`).
Replacing the list wholesale un-recorded a set of frames that were on disk and already imported — re-running `new`
after editing any other line of the spec silently emptied them. Recoverable by looking at the disk and re-measuring,
which is how it was repaired, but nothing should have needed repairing.

**All three fail silently**, which is why they are worth a table. The picture installs, the atlas packs, typecheck
passes, and the game draws the code version because a name does not match or a row does not exist. The brace
matching, the comment/string skipping, and the separating comma that the last member before a closing bracket does
not have are `container_close` / `insert_before_close`, written once and shared. `object_open` anchors to a KEY AT
THE START OF A LINE, because this config explains itself in comments and `"animations"` is exactly the word such a
comment would use — a plain `find` would happily return the position of that mention and brace-match from the wrong
place.

**A BOSS'S PICTURE GOES ON A BOSS'S KIND, AND `hazardArt.boss` IS NOW A TOMBSTONE.** The boss used to be one kind
(`boss`) and is now six, one per level (`boss-crab` … `boss-eye`, `BOSS_KINDS` in `src/hazards.ts`), with a full
dossier each in `hazards.bosses.<kind>`. What makes this trap-shaped rather than merely new: writing a boss's frames
into `hazardArt.boss` **is a silent no-op**, because no level names that kind any more — every check passes, the
atlas packs, and the game goes on drawing the old crab. Adding a boss's frames means editing ITS row:
`hazardArt.<boss-kind>.move`, **and `hazards.bosses.<boss-kind>`** if the picture is a different size (the dossier's
`radiusRatio` is what the grid is derived from, the same way `hazards.radius.<kind>` is for a creature). The six
existing art rows all point at `boss-idle` / `boss-attack` / `boss-dead`, which is what makes them a one-line change
each when the real frames land.

**And the split's own check is worth copying: prove the refactor drew the same picture before you trust the new
rows.** Six dossiers were generated from the old one and asserted equal field by field; then one boss of each kind
was painted through the real painter with `deterministic`, a fixed position and a pinned `phase`, screenshotted, and
hashed — **eight pictures, one hash** (the six, plus the old kind, plus the old kind again from `git stash`ed
pre-split code). A refactor that cannot say "and nothing changed" in one number is a refactor with an unknown number
of bugs in it.

**THE BOOT CHECK IS THE CONFIG'S COMPILER, and a row written to satisfy the parser is not a row written to satisfy
the game.** `obstacles.art.<kind>` requires `variants` AND `alpha` AND `swayDegrees` AND `swaySeconds`
(`mechanisms.ts` checks it at boot). `wire_obstacle`'s first version wrote only the variants — it parsed, it
typechecked, the atlas packed, and then the game refused to start with
`config/mechanics.json5 is invalid: obstacles.art is …`. Data has no compiler, so the CHECK is the compiler: read the
check, not the neighbouring row. (A second, cosmetic half of the same edit: emitting `],` with nothing after it in an
object is a legal JSON5 trailing comma AND looks like a mistake — the alpha line owns that comma.)

**Frame names are load-bearing in the same silent way.** `idle` writes `<asset>-move-1..N` for a creature and the
animation it declares asks for `<asset>-move-{n}`; the atlas looks a frame up BY FILE NAME, so a mismatch is a
picture the game never finds with nothing failing anywhere. Both derive from `frame_set_name()` so they cannot
disagree.

**Normalise the frames' content width before pixelating them.** `import-sheet.py` scales every frame to the same
grid width, which is right when the frames share a canvas and wrong when the MODEL drew the creature wider in some
of them. Measured on the crab: content widths came out 35, 32, 35, 32 — a two-frame pulse reading as the creature
swelling and shrinking at the frame rate, which is not what a leg motion says. It was VISIBLE before it was
measured and the number only said how big it was. Normalising drops the crab's frame-to-frame difference from 23.7
to 8.2 — most of what looked like boiling was the size pulse. `normalise_frames` scales about each frame's own
content centre, then takes the union box again from the SCALED frames.

**Boiling and stillness are the two ways generated frame sets fail, and they need different fixes.** Of three
creatures: the bomb fish measured 2.4–3.7/255 (four frames of a uniform dark-red ball come out near-identical — an
"animation" that does not animate), the crab 7.7–33.3 (legs and claws repaint every frame), the jellyfish ~16
(tentacles ripple, which reads as motion). Measure all PAIRS, not frame 1 against the rest: one crab pair was 7.7
while another was 33.3, and averaging over pairs starting at frame 1 hides which transition the eye will catch.

**A SECOND STATE OF A CREATURE IS NOT A SECOND CREATURE.** The puffer deflates while its counter cools —
`drawPuffer` says the spikes ARE that state — and a picture of a deflated puffer goes through
`import-picture.py` like any other, which crops it to its own content box and scales that to the grid width. The
result is a puffer EXACTLY as wide as the inflated one with shorter spikes and a bigger body: it says the opposite
of what it means. `pixelate_aligned` is the way out — same canvas as the base picture, same palette, placed at
`ratio` of the base's content width. The ratio is the DRAWN version's own proportion, measured not guessed:
`(2*0.72 + 2*0.35) / (2*0.95 + 2*0.75) = 0.63`. A spec says `state: "charge"` (which wires a KEY onto the
existing `hazardArt` row rather than creating one) and `alignTo: "<base asset>"`, and the base has to be imported
first because the template is the SHIPPED file, not the raw render.

**Give a second state a POSE RULE, and check what it is keyed on.** `poseOnWindup` knows about `h.charge` only, and
the puffer has no charge — its window is `counterRest > 0` (the seconds in which shooting it is free, which is a
different thing from a wind-up that is about to become an attack). `POSE_RULES.puffer = poseOnCounterRest` is the
rule it needs; a `charge` picture with no rule is a picture the game never shows, and `hazardArtPose` is exported
so the rule can be asked rather than assumed.

### The three numbers, and the check that keeps them honest

Every picture in TGBA is drawn at **1.4 screen pixels per texel**, so:

```
drawn      = 2 x radius x 412 x scale      radius from config/mechanics.json5, scale from the art row
file width = round(drawn / 1.4)
grid       = file width - 2 x margin       margin is the IMPORTER's own MARGIN_TEXELS (2)
```

`--grid` takes the third. **Passing `--drawn` instead is a trap**: the importers treat it as "content width", so
the file comes out `drawn/1.4 + 2*margin` wide and the density lands at 1.66 rather than 1.4. `asset_flow.py`
always computes the grid and always states it.

**And it checks the answer against the neighbours, which is the part that actually matters.** Measured on the first
run: the formula gave **1.39** for a new coral, while the six corals already in `src/assets/` sit at **1.32–1.34** —
they were imported before the `- 2 x margin` correction and are ~5% coarser. So the pipeline printed:

```
  WARNING: 1.39 is outside that range -- this one will look finer than the pictures it stands next to
```

That is the honest report: the formula is the documented rule and the shipped art predates it. Decide deliberately
(`--grid` overrides) rather than discovering it in the level.

### Idle animations, two routes, and the number that picks between them

`idle --route` comes from the spec. **`sway` generates nothing**: the picture is turned about its own base by the
renderer, `swayDegrees` and `swaySeconds` are the two config numbers, and the body is the same pixels in every
orientation. For a coral or an urchin that is not a compromise, it is correct — and `obstacles.art` in the config
already argues the case in its own comments (four per-frame re-renders measured 30–40/255 against 1.5/255 for a
composed cycle).

**`frames` generates N-1 pictures, not N.** Frame 1 is the candidate's own un-pixelated render, copied, so the pose
that was approved is the anchor byte for byte and the loop has a stable home. Frames 2..N ask for the same creature
in the same pose at a different phase of one breath.

Then the set is MEASURED before anyone is asked to look at it. `boil_report` compares only pixels that are opaque in
both frames and reports the mean |dRGB| — the unit `reference/api-notes.md` established, where 30.7–39.5 was
rejected on an octopus and a composed cycle measures 1.0–2.1. Over 20 and the GIF says so. It does not decide; a
creature whose body is supposed to move can still be right. It exists so the decision is made on a number.

### What is deliberately NOT in `asset_pipeline.py`

**Nothing.** The skill's copy of `asset_pipeline.py` and `refs/`'s copy are kept byte-identical on purpose — a
skill that can be copied to another project on its own — so an edit to one is a silent divergence until someone
notices. `asset_flow.py` imports it instead and calls `pixelate()`, `content_box()` and the whole `grant` command
through their own entry points. It also imports `scripts/seedream.py` for the Ark half. **`md5sum` both after any
change to either.** (The hash recorded below was already stale when this was written: both copies are
`7f4c4feacf674f29dc0baf19930ca02f`, not the `e918726b…` from the migration.)

## Traps this build paid for

Every one of these is a real failure that happened while the pipeline was being written, not a precaution.

**PowerShell, one line.** `run.ps1 flow --help` died with `invalid choice: '-'` while every multi-argument call
worked. `$args[1..1]` returns a SCALAR when there is exactly one trailing argument, and splatting a scalar string
enumerates its CHARACTERS — so argparse received `-`, `-`, `h`, … Wrapping the slice in `@()` keeps it a collection.

**JSON5 needs the comma.** The config is edited as TEXT (JSON5 full of the comments that make it worth reading, so
re-serialising it would throw all of that away). Inserting a `variants` entry before the closing `]` produced two
adjacent objects with no separator — valid to the eye, `invalid character '{'` to the parser. `wire_variant` now
adds the comma, and **`import` re-parses the edited config through the same `json5` the game's tooling uses and
refuses to write if it does not parse.** A bad asset is a bad asset; a config that does not parse is a game that
does not start.

**The browser has to be closed over CDP, not killed.** Killing the Chrome launcher leaves its renderer children
orphaned, and from a sandboxed shell they could not be killed afterwards (`taskkill` reported "no running instance"
while `Get-CimInstance` still listed them; three survived every attempt). `Browser.close` is in-band, takes the
whole browser, and needs no privileges.

**The driver must own its own Chrome.** Loopback in this environment is per-process: the driver reaches the browser
it spawned, and a second process cannot reach the driver's port at all. That is fine for the real flow and it means
the click path can only be tested from inside — `.scratch/asset-pipeline/driver-selftest.mjs` does exactly that,
dispatching real mouse events at the button's real coordinates. It found two bugs: the clicked button never lit up
(`pick.idle` is a boolean, `dataset.pick` is the string `"idle"`), and the driver could attach before the page's
script had run.

**Downscale the reference, THEN seed it.** A 3872x2592 photograph is a 15.3 MB seeded PNG — ~20 MB base64'd, sent
once per candidate, and worth nothing when the output is 1K. `prepare_reference` resizes to 1536 on the long edge
first. **The order is the trick**: `grant` writes an 8x8 block of alpha-0 as the permission signal Ark needs, and
resampling afterwards would blend that edge and leave the corner at alpha 3 instead of 0.

**FIVE telegraphs live in `draw*` bodies that a picture replaces, not four.** The crab's launch arc and its sand
puffs, the bomb fish's arming ring, the zapper's discharge ring (whose radius IS the hitbox radius, so losing it
does not lose a flourish — it makes the picture a lie), the net's tear (a real gap in the mesh grid, which the
obstacle art branch can only tint darker, and which then reads as "this is a wall and the game is broken"), and the
TORPEDO's turn. Each is a named painter now, called from its own `draw*` at the point it always was — the z-orders
differ and two of them go under the body — and from `paintTelegraph` in the art branch, last, over the sprite.

The torpedo is the one worth reading twice, because the plan for it changed. It was going to be a SECOND PICTURE on
the `charge` slot plus a pose rule, which would have needed the pipeline to learn "one asset, two candidate sets" —
and the refactor that extracted the first four made the better answer obvious: a state a picture can only express by
swapping the whole picture is a state that goes stale the moment the body art changes, and the red light is drawn at
a fixed offset in the body's own proportions, so where it sits does not depend on where the artist put the nose.

**COMPOSITION is the axis to check first, and no metric measures it.** The first real coral was pixelated, put in a
gallery, picked, and imported — and only then did the line-up against its neighbours show the actual mistake: every
coral already in `src/assets/` is a little SCENE (a coral plus its rock-and-sand base plus a couple of companions),
and all three candidates were lone coral bushes on transparency. Measured, the new sprite's bottom tenth of columns
was **30% filled against 65–88%** for the five it would stand next to. Meanwhile its palette (40 distinct RGB, the
cap held), its density (1.39) and its edge frequency (67–72% against 67–81%) were all *in range* — which is exactly
why it took a line-up to catch. The cause was the shared prompt template: `背景纯色…没有任何其他物体` is right for a
creature and exactly wrong for an obstacle whose variants are scenes. `composition` is now a spec field with that as
its default, and **the gallery prints a strip of the existing siblings at game size next to each asset's
candidates**, because a candidate shown alone has nothing to be compared against.

**And the OPPOSITE of that lesson has a case too.** `crate`, `wall` and `net` are man-made squares that fill a
`2r x 2r` box with no base at all — the code versions draw them flush to the square, so their art says
`没有底座、没有沙石、没有背景场景`. Matching the neighbours means matching what the neighbours ARE, and for these
three that is a bare object, not a vignette. The composition for each was written from what its `draw*` actually
draws, not from the coral.

**Two earlier conclusions from that same run, both partly wrong, both worth keeping as method.** Looking at the
candidates I said they "look like a shrunken photograph"; the numbers said otherwise (palette capped at 40, edge
frequency inside the shipped range) and I said the subject was merely too busy. Also wrong — the density was never
the problem. The lesson is the order of the two checks: **measure first, then look at the line-up**; a visual
impression of "this looks wrong" is worth acting on, but not worth *naming a cause* for until something has been
counted.

**Aspect is asked for in WORDS.** `size: "1K"` is a class, not a dimension — measured on this run, a `1K` request
came back **1312x880** with no aspect in the prompt, and **1024x1024** once `正方形构图（1:1）` was in it. The spec's
`aspect` field existed and was read by nothing until `ASPECT_WORDS` was written.

**Wikimedia rate-limits this egress hard.** The Commons API returns `403 Too Many Reqs` and `upload.wikimedia.org`
returns `429` after a handful of requests; downloads need retries with 20–60 s backoff and will silently give up.
Filenames come from the category page via `WebFetch`; the file itself is at
`upload.wikimedia.org/wikipedia/commons/<md5[0]>/<md5[0:2]>/<name>`, where the md5 is of the underscored filename.

**`pnpm` is not on PATH, and `DSH_PYTHON` has to be passed down.** `shutil.which('pnpm')` returns `None` and
`subprocess.run(['pnpm', …])` raises `FileNotFoundError` — a confusing way to learn that the tool which created
`node_modules/` is unreachable from Python. `corepack pnpm …` is the route that works. And `pnpm atlas` fails with
"No Python with Pillow found. Tried: python3, python, py" **even though `python -c "import PIL"` works from the
same shell** — `scripts/pack-atlas.mjs`'s own probe does not find it, and the `DSH_PYTHON` its own error message
names is what fixes it. `run_tool` sets both, so `asset_flow.py` never hits either. (`pnpm atlas:check` reported
`current: 1 page(s), 77 pictures, 288.7 KB` once `DSH_PYTHON` was set.)

## The substrate
 
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

**It needs `ARK_API_KEY`, which lives in `.env.local` at the repo root** — gitignored by the `*.local` rule, and
verified working 2026-10-09 against the model list, where `doubao-seedream-5-0-pro-260628` and
`…-5-0-flash-260915` are both live. **This repository is public**, so the key never goes in a tracked file, is
never printed, and is never sent anywhere but Ark. If it is missing, ask the owner for one rather than inventing
it; and never claim to have generated an image you did not.

`scripts/seedream.py` is the runner — the half of the seam that the old harness used to provide:

```powershell
$py = pwsh -NoProfile -File .claude\skills\game-asset\scripts\run.ps1 python   # see the note on pwsh below
& $py .claude\skills\game-asset\scripts\asset_pipeline.py plan --spec frames.spec.json --out frames.plan.json
& $py scripts\seedream.py --plan frames.plan.json --dry-run     # print the requests, send nothing
& $py scripts\seedream.py --plan frames.plan.json               # send them
```

It reads the plan's `calls[]` verbatim, sends one request per frame, downloads each result to its `output_path`,
and exits non-zero if any frame failed — a missing frame otherwise looks exactly like a frame the pipeline has
not reached yet. `--dry-run` costs nothing and is the right first move. `--model` overrides the model for the
whole run. `--only <frame-id>` regenerates a single frame rather than the set.

The loop is:

1. **Choose the model**: `doubao-seedream-5-0-pro-260628` for quality, `doubao-seedream-5-0-flash-260915` for
   speed and price. Only these two have transparent output, interactive editing and layer decomposition; 4.5 and
   4.0 are JPEG-only with no transparency mode at all, so their only route to an RGBA frame is a local key —
   which the rule below says is the worse one.
2. **Generate the reference** with a clean flat background — pure black for anything that glows.
3. **Seed it** with `grant` (see the rule below): Ark refuses to produce transparency from a fully opaque input.
4. **Write the frame spec, then generate.** Put the per-frame prompts in JSON *first*, so they are reviewable
   before anything is paid for and re-runnable afterwards — the same reference and the same subject wording on
   every frame, with only the phase description differing. `plan` generates nothing: it resolves the spec into
   the exact request per frame and refuses early when the reference is missing or has no alpha channel. Then
   `scripts/seedream.py` sends them.
5. **Pixelate, align, verify**, then import.

Measured on a real run of the above (2026-10-09, flash, `1K`, one frame from a granted 512×512 reference): 9
seconds, one image, 4096 tokens, 1024×1024 back. Corners at alpha 0 and 84.9% of the frame transparent, so the
transparency path works end to end. Note that the model renders smooth — the prompt asked for pixel art and got
none of it, exactly as the traps below say. Step 5 is what pixelates.

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

scripts/seedream.py                                    sends a plan's calls to Ark and downloads the results
scripts/import-sheet.py, scripts/compose-swim-tail.py  the project's own importers
scripts/import-picture.py                              one still picture, at the project's density
.env.local                                             ARK_API_KEY. Gitignored. Never commit its contents.
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

**`pwsh` is not reliably on PATH on this machine**, so the line above can fail with `command not found` even
though PowerShell 7.6 is installed — its App Execution Alias sits in a versioned subdirectory
(`…\WindowsApps\Microsoft.PowerShell_8wekyb3d8bbwe\pwsh.exe`) instead of in `WindowsApps` itself, which is what
a PATH lookup expects. Checked 2026-10-09; Windows PowerShell 5.1 is at
`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe` and works. If neither resolves, skip the wrapper
entirely: it only finds a Python with Pillow and forwards its arguments, and the three-file probe order is
written out three paragraphs down — call `asset_pipeline.py` with that interpreter directly.

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

### A picture that does not animate

```powershell
& $py scripts\import-picture.py 珊瑚1.png --name 珊瑚 --drawn 111
```

Scenery, a prop, a backdrop element: one image, no alignment, no shared palette across frames because there are no
frames. `import-sheet.py` will take a single picture, but it writes `珊瑚-1.png` — a name that implies a second
frame that is never coming — and it aligns on the head, which a coral does not have.

**Neither `--drawn` nor `--grid` has a default, and that is deliberate**: the grid is the width the game draws the
thing at, divided by 1.4, and the width comes from the config
(`2 × radius × 412 × scale`, from `hazards.radius` or `obstacles.radius`). State it. `import-sheet.py` reads the
TUNA's numbers out of the config when given neither, which is the trap this one exists without.

**If it needs to move and it has no tail**, do not reach for frames — reach for a rotation about the bottom. That
is what `obstacles.art`'s `swayDegrees`/`swaySeconds` are: one picture, turned about its own base, with the
amplitude and the period as two config numbers. The body is then the same pixels in every orientation by
construction, which is the same argument the tail composition makes, and it is one line of renderer instead of a
frame set that boils.

### A swim cycle where only the tail moves

```powershell
& $py scripts\compose-swim-tail.py picture.png --out <目录> [--amplitude 15]
& $py scripts\import-sheet.py <目录> --cols 4 --rows 1        # the four frames are already frame-sized
```

The other route, with the opposite trade-off: the body is not redrawn, so it is **byte-identical in every frame**
(no boiling, nothing to align), and the tail is a rotation about the peduncle, so the amplitude is one number.
What you give up is that the tail is a rotation of one drawing rather than a second pose for it. The peduncle is
measured as the waist where the silhouette stops thinning, not as the narrowest column — the tip of a crescent
fin is thinner still.

Three things about that pair of commands that cost time to find:

- **It takes ONE picture, not a sheet**, despite the docstring. `--body-frame`, `--cols` and `--rows` are
  declared and then never read, so passing them changes nothing.
- **The directory is the handoff, and it only works because `import-sheet.py` accepts one.** It used to
  `Image.open()` its argument, so following the command the composer prints ended in `PermissionError` on
  Windows. The directory path also pixelates the frames on the canvas they SHARE rather than cropping each to
  its own content box — a swinging tail changes the content box (measured on a whale: 983 / 982 / 974 / 958),
  and cropping each frame to its own box made `pixelate()` scale them differently, so the body came out a
  different size frame to frame. That one cost 1752 differing body pixels before it was found.
- **`--amplitude` is the only knob that decides whether you can SEE it.** At the default 15 the sweep is
  ±14.1°, which on a small creature is a couple of texels. The octopus needed 28 before its arm read as moving.

Prompting cannot deliver "only the tail moves": four renders of the same reference measured 30–73% of the
*body's* pixels different, each frame carrying its own dithering pattern. Measured again, differently, on the
octopus — see `reference/api-notes.md`, which has the number and the way to measure it.

**A subject with no tail cannot use this route**, and it will not say so. The octopus has eight arms and no
peduncle; the composer found a "waist" at x=844 of 1024 and rotated the rightmost 180px, which is a cut through
the animal, not a hinge. Look at what it produces before importing it — the waist it picks is a measurement, not
a judgement.

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

Two art-row fields that are easy to miss, because neither is animation frames:

- **`spin`** (radians per second) turns the sprite about its own centre, for a creature whose picture is a radial
  thing — an urchin is a ball of spikes and the rotation IS its animation. It is off the creature's own clock, so
  a row of them is not in lockstep. Without it a radial sprite reads as frozen.
- **`attackSeconds`** is how long a SINGLE-PICTURE `attack` stands. An `attack` that names an `animations.<id>`
  already knows its own length; a picture does not, so a kind that shows one has to say. Pick it as a fraction of
  the thing's cadence — the eel's discharge is half the gap between its shots, so the lightning flashes and goes
  out rather than becoming the creature's normal face.

And for scenery, `obstacles.art.<kind>` takes **`variants`**, a list of `{image, scale}` that one obstacle kind
picks from by its own id. That is how a level gets a reef rather than one coral repeated: same collision, same
health, several faces. Give each variant the `scale` that goes with its own picture — the widths are what the
world sees, and a thicket where every plant is the same size looks printed.

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

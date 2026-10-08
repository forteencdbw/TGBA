# Ark image API — measured behaviour

Everything here was measured against the live endpoint
(`https://ark.cn-beijing.volces.com/api/v3/images/generations`) with a real key,
not read off documentation. Where a number appears, it came from a run.

## Transparency: three rules

```
text-to-image + background:"transparent"
  -> HTTP 400  InvalidParameter: transparent background requires exactly one input image

image-to-image + a fully opaque input + background:"transparent"
  -> HTTP 400  InvalidParameter: transparent background requires a PNG input with
               at least one transparent pixel
     (same for black, white and green backgrounds -- the refusal is about alpha, not colour)

image-to-image + one input carrying any transparent pixel + background:"transparent"
  -> 200, RGBA, ~78-89% of the frame fully transparent
```

Also enforced:

- `background: "transparent"` with `output_format: "jpeg"` is rejected — transparent
  mode is PNG-only.
- Under `layer_decomposition`, `output_format` controls only the base image; layers
  are always PNG.

### One transparent pixel is enough

The model cuts the subject out itself; the input alpha is only a permission
signal. Evidence, on the same opaque crate render:

| Input alpha | Output content box |
|---|---|
| a rectangle inset 60px on all sides (shape unrelated to the subject) | (135,156,897,887) |
| a careful local cutout of the subject | (137,156,896,888) |
| a 1×1 transparent pixel | (134,156,898,894) |
| an 8×8 corner | (135,156,886,897) |
| a 1px border | (135,156,897,887) |

All five produce the subject's silhouette, not the seed's shape.

### The subject is opaque but almost never exactly 255

Measured 2026-10-09 on a real `doubao-seedream-5-0-flash-260915` cutout (1K, one frame, granted 512×512
reference): the frame came back 1024×1024 with corners at alpha 0 and **84.9% of it transparent**, and the
subject covering 15.1% of the frame. Of those subject pixels, **86.0% were alpha ≥ 250 but only 19.3% were
exactly 255**.

So the body is opaque and the remainder is edge softness, not a translucent sprite — but a check written as
`alpha == 255` under-reports the subject by more than 4x. Threshold at 250, or use `content_box`'s own
threshold, which is what all of this pipeline's alignment and cropping already do.

### The model's cutout beats a local luminance key on emissive subjects

| Route | Fully transparent | Partial | Fully opaque |
|---|---|---|---|
| model cutout (seeded 8×8) | 69.8% | 7.60% | 22.6% |
| local luminance key | 79.0% | 18.44% | 2.5% |

The local key's higher partial-alpha share is the failure: brightness-derived
alpha renders the body's dark parts nearly transparent, so the creature washes
out. The model's version keeps it. Prefer `grant` unless you specifically need
alpha the model would not produce.

## Per-frame renders boil, and here is the number for it

Four frames of one subject, generated one call each, are four complete re-renders. Measured 2026-10-09 on an
octopus (flash, `1K`, one 1024x1024 RGBA reference), after pixelation onto the game's grid with one shared
40-colour palette:

| | mean \|dRGB\| | pixels differing by >32 levels |
|---|---|---|
| the four generated frames | **30.7 - 39.5 / 255** | **38 - 58%** |
| a composed tail cycle (tuna, shark), shipped | 1.0 - 2.1 / 255 | 1.3 - 2.2% |

The generated set was rejected on those numbers. What makes them decisive is the second measurement: the
differences are not concentrated in the part that should move. The octopus's MANTLE -- the one region that must
hold still -- differed on 55-73% of its own area, as much as the arms did. So this is not "the artist drew four
poses", it is "the creature shimmers", and no amount of alignment or palette work removes it, because every
pixel was repainted.

Before rejecting a set on a hunch, measure it this way: compare only pixels that are opaque in BOTH frames, and
report the mean absolute RGB difference rather than counting unequal pixels. Exact inequality says 100% differ
on these frames, including the fully transparent corners, which is true and useless.

## Model IDs carry a version suffix

```
doubao-seedream-5-0-flash          404  InvalidEndpointOrModel.NotFound
doubao-seedream-5-0-flash-260915   200
```

Enumerate what an account can see:

```powershell
$key = "<ARK_API_KEY>"
(Invoke-WebRequest -Uri "https://ark.cn-beijing.volces.com/api/v3/models" `
  -Headers @{ Authorization = "Bearer $key" } -UseBasicParsing).Content |
  ConvertFrom-Json | Select-Object -ExpandProperty data |
  Where-Object { $_.id -match 'seedream' } | Select-Object status, id
```

`status: "Shutdown"` is retired; `"Retiring"` still works; absent status is live.
A 404 for a plausible-looking ID almost always means a missing date suffix.

### In the model list is NOT the same as activated on the account

Measured 2026-10-09, on the account this repo's key belongs to:

```
doubao-seedream-5-0-pro-260628   listed live in /api/v3/models
POST with that model          -> 404 ModelNotOpen
   "Your account 2132701805 has not activated the model doubao-seedream-5-0-pro-260628.
    Please activate the model service in the Ark Console."
doubao-seedream-5-0-flash-260915 -> 200
```

So the model list is a catalogue, not a licence. `scripts/seedream.py` echoes Ark's error body for exactly this
reason -- the refusal names the model and the account, and it is the only place that says so. Ask before assuming
a live model is usable; flash was the one that worked.

## What each model supports

| Feature | 5.0 pro | 5.0 flash | 5.0 lite | 4.5 | 4.0 |
|---|---|---|---|---|---|
| transparent background | yes | yes | — | — | — |
| layer decomposition | yes | yes | — | — | — |
| `optimize_prompt_options.mode: "fast"` | yes | — | — | — | — |
| `sequential_image_generation` (batch) | — | — | yes | yes | yes |
| `stream: true` | — | — | yes | yes | yes |
| `tools: [{type:"web_search"}]` | — | — | yes | — | — |

A `sequence` request against a model without it is rejected (HTTP 400), which is
why the pipeline generates one frame per call.

## Size

`size` takes a tier (`1K`, `1.5K`, `2K`, `3K`, `4K`, `auto`) or explicit pixels
(`2048x2048`), never both. The legal tiers and the pixel bounds are per model:

| Model | Tiers | Explicit pixels |
|---|---|---|
| 5.0 pro / flash | `1K`, `1.5K`, `2K` (default `2K`) | total pixels 921600 .. 4624220 |
| 5.0 lite | `2K`, `3K`, `4K` | total pixels 3686400 .. 16777216 |
| 4.5 | `2K`, `4K` | total pixels 3686400 .. 16777216 |
| 4.0 | `1K`, `2K`, `4K` | total pixels 921600 .. 16777216 |

The tier is a **class, not a dimension**: `size: "2K"` returned a 1584×2816 PNG.
Never assume the tier equals pixels — read the actual size.

## Reference images

- Formats: JPEG, PNG, WebP, BMP, TIFF, GIF, HEIC/HEIF. Up to 10 references on
  5.0 pro/flash, 14 on the others.
- A single reference: ratio 1/16..16, each side > 14px, ≤ 30MB, 196 ..
  36,000,000 total pixels.
- Local paths are read and sent as `data:` URIs. DSH's attachment store keeps
  normalized images under a content hash with **no file extension**, so the
  pipeline sniffs magic bytes when a path has none.

## Response handling

`response_format: "url"` returns a link that **expires after 24 hours**, so every
generated image is written to disk. `b64_json` avoids the extra download but
inflates the JSON; the pipeline uses `url` and downloads.

A per-image failure inside a successful batch arrives as `data[i].error` with the
other images intact. `usage.generated_images` counts only successes, and billing
follows it.

## PixiJS atlas constraints

- The atlas JSON is the TexturePacker **Hash** shape (an object keyed by frame
  name) with `meta.image` and `meta.size`. That is what the Spritesheet parser
  reads.
- `sourceSize` and `spriteSourceSize` are what re-register a trimmed frame onto
  its full logical frame. Dropping them reintroduces the drift alignment removes.
- `rotated` and `pivot` are not read for a static sprite atlas; the pipeline omits
  them. `pivot` belongs to the sprite, not the texture.
- Padding between packed frames prevents sampling bleed from a neighbouring frame.

## Size measurements

Jellyfish atlas, 4 frames, 346×178, RGBA:

| Encoding | Bytes | Pixel-exact |
|---|---|---|
| PNG (optimize, compress_level 9) | 85,335 | yes |
| **lossless WebP (quality 100, method 6)** | **45,078** | yes |
| lossy WebP q92 method 6 | 47,001 | no |
| lossy WebP q85 method 6 | 41,369 | no |
| padded to 512×256, PNG | 87,936 | yes (512 KB decoded vs 241 KB) |

Lossy WebP is not worth it here: at q92 it is *larger* than lossless, and at q85
it saves 8% for real artefacts. Power-of-two padding costs 3% more bytes and
doubles decoded memory, so it is opt-in only.

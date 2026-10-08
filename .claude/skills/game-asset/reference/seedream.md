# Seedream on Ark — the API, as documented

This is what Volcengine *documents*. `api-notes.md` is what this pipeline *measured*, and it stays the
authority wherever the two disagree — where a number there is prefixed with a measurement, a run produced it.

Source, distilled 2026-10-09 from three vendor documents the owner supplied:

- `图片生成教程.md` — the general Image generation API guide (text-to-image, image-to-image, multi-reference,
  group output, output spec, limits)
- `Doubao Seedream 5.0 pro  flash 教程.md` — the 5.0 pro/flash guide (interactive editing, layer decomposition,
  transparency, limits)
- `Doubao Seedream 5.0 pro  flash 实现交互编辑指南.md` — the interactive editing guide (normalized coordinates)

Published versions: `seedream-4-0-5-0`, `seedream-5-0-pro`, `seedream-5-0-pro-editing-guide`, `image-generation-api`.

## The call

```
POST https://ark.cn-beijing.volces.com/api/v3/images/generations
Authorization: Bearer $ARK_API_KEY
Content-Type: application/json
```

```bash
curl https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "doubao-seedream-5-0-pro-260628",
    "prompt": "…",
    "image": "data:image/png;base64,…",
    "size": "2K",
    "output_format": "png",
    "response_format": "url",
    "watermark": false
  }'
```

Python and Java SDKs exist (`pip install arkruntime`, `volcengine-python-sdk[ark]`); the HTTP call above is the
whole of what the pipeline needs, so no SDK is installed here.

## Model IDs

The date suffix is part of the ID. A plausible ID without it is a 404 — see `api-notes.md`.

| Model | ID | Resolution tiers |
|---|---|---|
| Seedream 5.0 pro | `doubao-seedream-5-0-pro-260628` | `1K`, `1.5K`, `2K` |
| Seedream 5.0 flash | `doubao-seedream-5-0-flash-260915` | `1K`, `1.5K`, `2K` |
| Seedream 5.0 lite | `doubao-seedream-5-0-260128` (alias `doubao-seedream-5-0-lite-260128`) | `2K`, `3K`, `4K` |
| Seedream 4.5 | `doubao-seedream-4-5-251128` | `2K`, `4K` |
| Seedream 4.0 | `doubao-seedream-4-0-250828` | `1K`, `2K`, `4K` |

**The two 5.0 models are the ones to use here**, because they are the only ones with **transparency** and the two
only ones with **interactive editing** and **layer decomposition**:

| Feature | 5.0 pro | 5.0 flash | 5.0 lite | 4.5 | 4.0 |
|---|---|---|---|---|---|
| transparency (`background`) | yes | yes | — | — | — |
| interactive editing (coords) | yes | yes | — | — | — |
| layer decomposition | yes | yes | — | — | — |
| text-to-group / image-to-group | — | — | yes | yes | yes |
| streaming output | — | — | yes | yes | yes |
| web search | — | — | yes | — | — |
| `optimize_prompt_options.mode: "fast"` | yes | — | — | — | yes |
| output formats | png, jpeg | png, jpeg | png, jpeg | jpeg | jpeg |

pro vs flash is quality vs latency and price, not capability: both do everything in the top three rows.
4.5 and 4.0 are JPEG-only with no transparency mode, so the only way to an RGBA frame from them is a local key —
see `api-notes.md` for why the model's own cutout is the better one.

## Parameters

| Param | Values | Notes |
|---|---|---|
| `model` | an ID above | required |
| `prompt` | text | ≤ 300 Chinese characters / 600 English words, or the model starts dropping detail |
| `image` | string or array | URL, or `data:image/<fmt>;base64,…` — **the format tag must be lowercase** |
| `size` | a tier, or `WxH` | never both; see Size below |
| `output_format` | `png`, `jpeg` | default `jpeg` on 4.x, transparent mode forces `png` |
| `response_format` | `url`, `b64_json` | `url` expires in 24h |
| `watermark` | `true`, `false` | `true` stamps "AI生成" in the bottom-right |
| `background` | `transparent`, `opaque` (default) | image-to-image only, see below |
| `layer_decomposition` | `true` | see Layer decomposition |
| `optimize_prompt_options.mode` | `standard`, `fast` | `fast` is pro/4.0 only; costs image quality |
| `sequential_image_generation` | `auto`, `disabled` | with `sequential_image_generation_options.max_images` |
| `stream` | `true`, `false` | group generation streams partial results |
| `tools` | `[{"type":"web_search"}]` | lite only |

## Transparency

`background: "transparent"` gives RGBA, and it is **image-to-image only, with exactly one input image that
already has an alpha channel**. The three rules, with the measured refusals, are in `api-notes.md — it is the
whole reason step 2 of the pipeline (`grant`) exists: an opaque render has to be seeded with one transparent
pixel before the API will agree to produce transparency at all.

Two more, from the vendor doc:

- Transparent mode outputs PNG; setting `output_format: "jpeg"` alongside it is an error.
- Passing a format without an alpha channel (jpeg) as the *input* is an error.

## Size

`size` is either a tier or explicit pixels, never mixed. The tier is a **class, not a dimension** — `2K` on pro
returned 1584×2816 for a 9:16 prompt, which is the number `api-notes.md` measured independently.

Aspect ratio is asked for **in the prompt**, in words; the tier only sets the class. pro at 1K/1.5K/2K, for the
shapes worth asking for:

| Ratio | 1K | 1.5K | 2K |
|---|---|---|---|
| 1:1 | 1024×1024 | 1536×1536 | 2048×2048 |
| 3:4 | 864×1152 | 1344×1792 | 1776×2368 |
| 9:16 | 800×1424 | 1152×2048 | 1584×2816 |
| 16:9 | 1424×800 | 2048×1152 | 2816×1584 |
| 3:2 | 1248×832 | 1872×1248 | 2496×1664 |

Explicit pixels, constrained by total pixels and ratio:

| Model | Total pixels | Ratio (w/h) |
|---|---|---|
| 5.0 pro / flash | 921,600 … 4,624,220 | 1/16 … 16 |

`1.5K` and `1K` cost the same on pro, and 1.5K looks better — there is no reason to ask for 1K.

## Input constraints

| | Image generation | Layer decomposition |
|---|---|---|
| Formats | jpeg, png, webp, bmp, tiff, gif, heic, heif | png, jpeg |
| Total pixels | 196 … 36,000,000 | 262,144 … 36,000,000 |
| Each side | > 14 px | — |
| Ratio | 1/16 … 16 | 1/16 … 16 |
| Size | ≤ 30 MB | ≤ 30 MB |
| Count | ≤ 10 references (pro/flash) | 1 |

`data:` URIs are the route for a local file. URL inputs expire and are not a place to keep anything.

## Response

```json
{ "model": "…", "created": 1784696685,
  "data": [ { "url": "…", "size": "2048x2048", "output_format": "png", "z_index": 0 } ],
  "usage": { "input_images": 1, "generated_images": 8, "total_tokens": 23107 } }
```

A per-image failure inside a successful batch arrives as `data[i].error` with the other images intact; bill and
count on `usage.generated_images`. `api-notes.md` covers that and the 24-hour expiry.

## Interactive editing (5.0 pro / flash)

Instead of describing a location in words, put a **normalized coordinate** in the prompt. The image is divided
into 1000 parts on each axis: top-left `0,0`, bottom-right `999,999`.

```
<point>x y</point>            one point; the model decides the extent
<bbox>x1 y1 x2 y2</bbox>      top-left and bottom-right; you decide the extent
```

`x = round(x_px / width * 1000)`, `y = round(y_px / height * 1000)`, where `width`/`height` are the image's
displayed size and the pixel coordinates are relative to the image's own top-left. With several reference
images, the prompt names them `图1`, `图2` … in the order they are submitted:

```
把图1 <point>520 460</point> 位置换成皇冠
把图1 <bbox>120 180 640 760</bbox> 区域替换成花园
将图1 <bbox>179 283 796 986</bbox> 的主体放到图2 <bbox>118 331 933 871</bbox> 位置
```

Shape marks (doodles, boxes, arrows) also work — the model reads them off the picture and the prompt says to
remove them: *"根据手绘草图对图像进行编辑…移除所有草图线条。保持构图不变。"*

This is the precise way to say "the thing at this spot" — worth reaching for when a prompt like "the creature
on the left" keeps being misread.

## Layer decomposition (5.0 pro / flash)

`layer_decomposition: true` splits one picture into **one base image plus up to 16 layers**, each a transparent
PNG, with the geometry needed to put it back:

```json
{ "model": "doubao-seedream-5-0-pro-260628",
  "image": "<the single picture to split>",
  "size": "2K",
  "layer_decomposition": true,
  "watermark": false }
```

`prompt` is optional: omit it and the model picks the salient elements itself; describe them to choose ("拆出人物、
标题文字和右下角装饰图标"); or give `<bbox>` coordinates to name exactly which areas to split out.

Each layer in `data` carries `z_index` (base is `0`, layers increase), `bounding_box.absolute` (pixels in the
base's coordinate space) and `bounding_box.normalized` (0–999, for any canvas size), plus `name` and
`description`. Reassemble by drawing `z_index` 0 first and then the layers in increasing order at their boxes.

Constraints worth knowing: single input image, png/jpeg only, `size` is a **tier only** (`auto` is the default
and keeps each piece at its original size and ratio), and `output_format` governs the base only — layers are
always PNG. A request reserves 17 IPM (16 layers + base) against the 500 IPM account limit.

**Why this matters here**: TGBA's backdrops and parallax layers are exactly this shape of problem — one
illustration that wants to be a base plus separately-movable pieces. Note that the split is a *generation*, not
a segmentation: the layers are redrawn, so a split is not a lossless decomposition of the input.

**It does not split one animal into its parts.** Measured 2026-10-09 on a single octopus on transparency
(flash, `1K`, no prompt): two pieces came back — the empty base at `z_index` 0, and one layer holding

> 完整的像素风格橙色章鱼本体，包含头部、所有触手、吸盘和黄色眼睛，无多余背景元素
> ("the whole pixel-art orange octopus, head, all tentacles, suckers and yellow eye, no extra background")

So the model returned the creature whole and found nothing to separate. Ask it for a creature's arms as their
own layer and you get an empty question: decomposition separates a SUBJECT from its SURROUNDINGS, which is what
it is for (posters, thumbnails, collage). It is not rigging. For "only this part moves", compose it
geometrically from one drawing instead — that is what `compose-swim-tail.py` does.

## Limits

- **IPM 500** per model version per minute, counted in generated pictures. Exceeding it errors.
- **Image URLs live 24 hours.** Download and save.
- Group generation: references + outputs ≤ 15 on lite.

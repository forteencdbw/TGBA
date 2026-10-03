# 01 — 汉字被截掉上半部分（"开阔水域"只看得见下半截）

Status: resolved

## What was wrong

Every Chinese string in the game was drawn with the top of its glyphs cut off. Thin top strokes vanished
entirely, so a character read as its own bottom half — the level pills (`开阔水域`), the note under them, the
HUD subline, the codex cards and the settings panel were all affected. Latin text was unaffected, which is why it
went unnoticed for so long: the debug readout, the version line and every number looked perfectly fine.

Reproduced at `devicePixelRatio` 1 on this machine (a 1080p-class desktop), in the dev server **and** on the
deployed Pages build. At DPR 2 the same code rendered correctly, which is exactly the kind of bug a phone-shaped
test project hides.

## Root cause

Pixi's canvas-text path measures the line box from the **first** family in `fontFamily` — it measures the ink of
`|ÉqÅM` — while Chinese glyphs are drawn by whichever fallback font supplies them. The old stack was

```
ui-monospace, "SF Mono", Menlo, Consolas, monospace
```

which has no Chinese at all, so Chromium fell back to a **full-width monospace CJK face** for the Chinese runs.
That face's em box is about 1.13em wide, and its glyphs reach ~0.93em above the baseline, while Consolas'
measured ascent is 0.93em of a 1em box. The Chinese ink therefore overflowed the text canvas, which is sized from
the Latin metrics: the top ~2–3 px of every character was outside the texture and simply not drawn.

Measured, at a 15 px font size:

| font stack | Pixi line box | Chinese ink drawn |
| --- | --- | --- |
| mono first (old) | 13.0 px | 11.0 px (cut) |
| a CJK face first (new) | 14.5 px | 13.5 px (whole) |

Things that do **not** fix it, all verified against the real game: `TextStyle.padding` (2/4/6/8/12),
`lineHeight`, `resolution` 1/2/3, `letterSpacing` 0, and putting a CJK face *after* the Latin ones (the metrics
still come from the Latin face).

## Fix

A `text` group in `config/mechanics.json5`:

- `text.fontFamily` — `Microsoft YaHei, PingFang SC, Hiragino Sans GB, Noto Sans SC, sans-serif`. The CJK face is
  first **on purpose**: the family that measures the line box has to be the family that draws the characters.
- `text.monoFontFamily` — the old monospace stack, used only by the debug readout. Its lines align their values
  into columns with spaces, which only reads as columns in a monospace face, and it is pure ASCII so it never
  touches the CJK fallback.

`makeLabel` (HUD, codex, touch buttons), `mk` (menu) and `mkText` (settings) all take the configured family;
`Hud`'s debug readout passes `monoFontFamily`.

## Comments

- 2026-10: found while investigating "左上角的日志只显示了一半". The `padding` lever is the documented Pixi remedy
  for cropped glyphs and it does **not** work here — the crop is the fallback font's taller em box, not a missing
  padding. Changing the family is the fix; the whole UI now renders in a sans CJK face instead of a monospace one,
  which is a visible but deliberate styling change.

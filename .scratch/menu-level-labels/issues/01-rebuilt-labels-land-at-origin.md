# 01 — Picking a level sent the pill names to the top-left corner of the canvas

Status: resolved

## What was wrong

Tap the level pill of the level that is already selected and both pill names jump to the canvas origin: the row
of pills goes blank while `开阔水域` and `暗礁水道` are drawn on top of each other in the top-left corner (which
is easy to mistake for a debug readout, since the debug readout lives there in a level).

## Root cause

`Menu.setLevels` and `Menu.setTypes` rebuild their labels from scratch -- the NUMBER of buttons is part of the
layout -- and `setLevels` left the newly built labels where they were constructed, at `(0, 0)`. Placement lived
only in `Menu.layout`, so the labels were put right on the next resize and nowhere else.

At boot that is invisible: `refreshLevelMenu()` runs in the `Game` constructor and the `layout()` at the end of
it places the labels. A level PICK is the path with no layout after it, and that is the reported bug:

```
this.progress.select(levelId) -> refreshLevelMenu() -> menu.setLevels(entries)   // labels built at (0,0)
```

Measured: `开阔水域 @ 411,386` and `暗礁水道 @ 498,386` before the press; both `@ 0,0` after it.

## Fix

The placement loops moved out of `layout` into `placeTypeLabels()` / `placeLevelLabels()`, which `layout`,
`setTypes` and `setLevels` all call. The rects come from the last real layout, so a rebuild before the first
layout places nothing and the layout that follows still does the work.

## Comments

- 2026-10: reported together with the clipped Chinese glyphs (see `.scratch/cjk-text-clipping/`), because the
  stray text in the corner looked like the same "half-drawn readout". It is a separate bug: the glyph fix changed
  what the floating text looked like, not where it was.

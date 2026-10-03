# 02 — Three clipped things in the top-left corner

Status: resolved

## What the screenshot showed

The owner marked three things on a screenshot of level 1:

  red rectangle, top-left   a line of text with only half of it on screen
  red circle, top-left      a big number, also cut in half by the left edge
  yellow rectangle, left    the stage labels (鱼群 / 气泡潮 / 爆发) down the left edge, to be deleted

## What they were

The two clipped things turned out to be the same class of bug, and both were PRE-EXISTING -- the screenshot did not
create them, it made them visible:

  the clipped line     the run banner. It had an anchor of 0.5 and no x or y at all, so it has always been drawn at the
                       canvas origin with its left half off the screen. It took a run with a lot of banners to be
                       noticed. Now centred (`x = screenW / 2`), wrapped at 92% of the width, `align: center`, and
                       placed at 56 design px: inside the HUD block, under the stage line, rather than floating over the
                       debug readout.
  the big number       the depth HEADLINE label. The previous change deleted its text assignment and its layout, but
                       left the label in the display list, so it rendered whatever it was constructed with -- "500",
                       clipped to "0" at the origin. Deleted outright: a readout removed from the layout but left as a
                       child is exactly the kind of thing that comes back as a bug report about a stray number.
  the stage labels     three small yellow words pinned down the left edge, naming sections of the level the player is in
                       the middle of. Deleted, with `hud.landmarkInset` and the `Hud` constructor's landmark parameter.
                       `Level.landmarks` itself stays: it is what fires the level's ANNOUNCEMENTS, which say the same
                       words at the moment they happen, where the player is looking.

The general lesson, worth stating because it produced all three: **deleting a readout means deleting the display
object**, not just the code that filled it in.

## Measured (1007x1336, the screenshot's shape)

    banner position         x = 504 (centred on a 1007px canvas), y = 178 -> then 56 design px; text fully visible
    headline               no longer exists as a display object
    stage labels           no longer exist; the left edge is empty water
    screenshot             分数 at the top-left, the stage line and the centred banner under it, nothing clipped

`pnpm build` green. No Playwright run, per AGENTS.md.

Version 1.0.37 -> 1.0.38.

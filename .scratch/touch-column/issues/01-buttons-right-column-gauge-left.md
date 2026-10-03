# 01 — All the touch buttons in one right-hand column, and the gauge on the left

Status: resolved

## What was asked

Every skill button in a single vertical column on the far right; the progress bar moved to the left.

## What it is now

`touch.layout` places every button the type has on one axis at the right edge of the lane, stacked bottom-up in a
fixed order: **skill** (which is also the type's HOLD -- the suction field or the charge wind-up) at the bottom
where a thumb rests, then **spit** or **burst**, then **compress** on top and smaller. A type that lacks a control
leaves its slot EMPTY rather than shifting the others up, so "spit is the middle one" is true in every run that has
one, and muscle memory survives a bubble swap.

Why one column: movement is a drag from anywhere, so the left and the middle of the screen are the steering area.
Spending both bottom corners on buttons, as the two-corner layout did, left the player steering in the gap between
them. One edge keeps the steering area whole, the buttons never sit under the bubble, and their positions never
move.

The gauge moved to the LEFT because the whole right edge is now the button column -- two pieces of screen furniture
competing for one strip is how a thumb grabs the wrong thing. Its landmark labels (鱼群 / 气泡潮 / 爆发) read
INWARD from the bar and their anchor flips with the side, so a left-hand gauge cannot push them out of the lane. The
debug readout shifted right of the bar for the same reason.

## New config

    touch.buttonRadius            38    design pixels
    touch.buttonMaxRadiusRatio    0.13  ceiling as a fraction of the lane width
    touch.rightInset              12
    touch.bottomInset             22
    touch.buttonGap               10    edge to edge, so the column grows taller rather than fatter

    hud.gaugeSide                 left  'left' | 'right' -- flip it and the labels follow
    hud.gaugeEdgeInset            14
    hud.gaugeWidth                9

The gauge's side is a config value rather than an edit, because "which edge" is exactly the kind of decision that
changes again.

## A pre-existing bug this found

The buttons were sized from `viewport.scale` -- pixels per WORLD METRE -- which is the mistake the HUD had already
been cured of. On a short window that number is large for the opposite reason a wide one makes it large: a 915x412
landscape phone resolves it to 2.49, so the buttons came out at 95px radius and the column ran off the top of the
screen (the compress button sat at y = -147). `e2e/layout.spec.ts` never saw it because its three viewports were all
portrait or big.

Fixed by deriving `designScale(canvasWidth, canvasHeight)` INSIDE `TouchControls.layout`, so there is no parameter
to pass wrong -- the same shape as the HUD's fix. The spec grew the landscape and small-phone cases that would have
caught it.

## Measured

Checked on five canvas shapes x both bubble types: one column (every button on the same x), no two buttons
overlapping, none outside the lane or the canvas, and the gauge on the left of the lane every time.

    phone 412x915       3 buttons (devour) / 2 (angry), column, in bounds
    phone 360x640       same
    landscape 915x412   same  <- the case that used to push the column off screen
    desktop 1280x800    same
    wide 2560x1440      same

## Comments

- 2026-10: requested as "将所有的技能按钮，都竖向排列在最右边，将进度条放左边".

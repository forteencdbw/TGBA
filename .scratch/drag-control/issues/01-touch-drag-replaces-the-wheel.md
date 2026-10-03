# 01 — Movement control for phones: the wheel out, an anywhere-drag in

Status: resolved

## What was asked

Drop the on-screen thumb wheel. Instead: touching and dragging ANYWHERE on the screen moves the bubble by the
same distance the finger moved, in the same direction, as a displacement relative to the bubble's own position --
never snapping the bubble under the finger. No acceleration; when the finger stops, the bubble stays exactly where
it is on screen.

## What it is now

`src/touch.ts` claims the first pointer that is not on a button as the steering finger and turns each movement into
a displacement in the two fractions the player already stores its position in -- lane widths across, window heights
up -- so `laneWidthPx` and `canvasHeightPx` are the whole of the conversion. `Input` carries it on its own channel
(`addDrag` / `consumeDrag`) rather than in `axisX`/`axisY`, because a distance is not a speed: the keyboard's axes
go through a ramp, a coast and the stage/suction multipliers, and every one of those would break "the bubble moves
exactly as far as the finger". `Player.update` consumes the displacement in its first sub-step and applies it as a
position.

Movement is therefore the only control with no `ControlId` and no geometry: it needs no button, so there is nothing
for a type to ask for or leave out.

## Measured on the running game (Pixel-7-shaped page, 412x915, lane 412px)

| Question | Result |
| --- | --- |
| finger (40, -30)px -> bubble | dx 0.097087 = 40/412, dscreenY 0.032787 = 30/915 (exact 1:1) |
| press with no movement | dx 0, dscreenY 0 -- no snap, no jitter |
| release, 500ms later (level still scrolling) | drift 0 on both axes |
| press on the spit button | steering false, no steering pointer claimed |
| press far away (95% x) | bubble stays at 0.200 -- not pulled to the finger |
| finger down but still | counts as steering, so a trash bag is still torn off by a struggling player |

## Consequences, recorded rather than hidden

- The stage / suction / overload speed multipliers no longer apply to TOUCH (they still do to the keyboard):
  a distance cannot be scaled without breaking the 1:1 promise. `movement.drag.penaltiesApply` turns them back on
  for anyone who prefers "bigger is slower" to strict 1:1.
- Aim for the two aiming verbs (spit, charge slam) now comes from the drag's offset from the point the finger
  landed: a direction the player can hold while barely moving, rather than the last few pixels of travel. The
  charge's aim still locks when the input is released; the spit still defaults to straight up with no aim.
- `mech.movement.wheel` is gone (six keys), replaced by `movement.drag.sensitivity` and
  `movement.drag.penaltiesApply`.
- `e2e/wheel.spec.ts` is gone, replaced by `e2e/drag.spec.ts`, which asserts the contract above. The charge-aim
  gesture and one screenshot capture were rewritten with it.

## Comments

- 2026-10: requested as "去掉轮盘…气泡相对自己位置的相对位移". Implemented as asked, 1:1 by default.

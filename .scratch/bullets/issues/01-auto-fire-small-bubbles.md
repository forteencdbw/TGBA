# 01 — The bubble's own gun: small-bubble bullets that drive a creature off

Status: resolved

## What was asked

The player's bubble fires small bubbles continuously by default, no button. They are ordinary bullets, an
independent thing rather than the spit verb. They take hit points off a fish. A fish whose hit points reach zero
does not die -- it moves quickly off the screen. Fish hit points and bullet damage must be configurable.

## What it is

`src/bullets.ts`: a `BulletField` that owns the cadence, the flight, the collision and the painting, in the same
shape as `HazardField` and `ObstacleField`. `main.ts` supplies only the muzzle (the bubble's rim) and whether the
gun is armed this frame.

Two things it deliberately is NOT:

- Not the spit verb. A spat hazard is ammunition (it costs a stomach slot, keeps the creature's identity and
  knocks things around); these are a rate of fire. One system for both would have made "how much do I have" and
  "how often do I shoot" the same knob.
- Not lethal. `HazardField.hit` takes hit points off and, at zero, sets `fleeing` -- a state that replaces the
  creature's own motion (`advance`), and with it the chase, the bait reaction, the feeding and the suction pull.

## Config

    bullets.perSecond          4      rounds per second; 0 turns the gun off entirely
    bullets.damage             1      hit points per hit
    bullets.speedPerSecond     1.6    lane widths per second, on top of the level's own scroll
    bullets.lifeSeconds        2.2    also the range
    bullets.radiusRatio        0.011  of the lane width
    bullets.colour/alpha/rimColour/rimAlpha
    hazards.health             { fish: 3, everything else: 0 }
    hazards.fleeScreensPerSecond  0.9

`hazards.health` must have a row for every hazard kind, and a missing one is a load error rather than a silent
zero -- a creature immune to the bullets by accident is indistinguishable from one that is immune on purpose,
which is exactly why the on-purpose case has to be written down as a `0`.

`fleeScreensPerSecond` is in SCREEN HEIGHTS per second rather than as a multiple of the current, and the first
attempt (2.2x the current) is why: the current is 25 m/s while a screenful of water is ~800 m tall, so "twice the
current" was a fish that took half a minute to leave -- measured, not guessed.

## Measured on the running game (412x915, lane 361 m)

| Question | Result |
| --- | --- |
| fires on its own | 8 rounds in 2.03 s of GAME time at `perSecond: 4` (3.93/s), 27 in 2.02 s after a live edit to 14 (13.39/s) |
| a fish takes damage | 3 hp -> 1 hp -> 0 hp with `damaged: 2` counted for the non-fatal hits |
| and then leaves | `fleeing: true`, y rising 172 -> 317 -> 481 -> gone from the field in ~0.4 s: about one screen per second |
| an immune kind | jellyfish (`health: 0`): `damaged` and `fled` unchanged, `fleeing` false -- the rounds pass through |
| scenery | a crate in the line of fire: the fish behind it keeps 3/3 hp, `hits` counts the blocked rounds, the crate is not damaged |

Not a single creature was removed from the field by damage: `fled` is the counter that moves, and the creature
leaves the band on its own.

## Also

- `BubbleType.firesBullets` is the per-type switch; both types ship with it on, because the gun is the default.
- Bullets are stopped by obstacles (`ObstacleField.blocks`) but do not damage them: opening scenery stays the
  charge's and the spit's job.
- `Diagnostics` gained `bullets` and `hazards.fled` / `hazards.damaged` / `hazards.fleeing`, and a compact
  `e2e/bullets.spec.ts` records the four promises above.
- Not done: a codex card for the gun, and any hit feedback on a creature that has taken damage but not enough to
  leave. Neither was asked for; both are a line in `codex.ts` and a flash in `paintHazards` when they are wanted.

## Comments

- 2026-10: requested as "气泡默认一直射小泡泡，打在鱼身上掉血，血空了快速离屏（不是杀死），血量和伤害可配置".

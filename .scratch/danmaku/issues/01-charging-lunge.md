# 01 — Bullet-hell pressure: the charging lunge

Status: resolved (half one of two; the enemy gun is the other half)

## What was asked

Create a bullet-hell feel that keeps the player dodging, in two ways: fish that ram the player along a fixed curve, and
enemies that shoot bullets to be dodged. This note covers the first.

## What it is

`charges` in the config, `Hazard.charge` / `Hazard.chargeRest` in `src/hazards.ts`. A creature whose kind is named in
`charges.kinds` and whose distance to the player drops inside `charges.triggerMeters` commits to a lunge:

1. **Wind-up** (`telegraphSeconds`, 0.75s): it holds station and the WHOLE curve plus a ring at the aim point is drawn
   on screen, pulsing. This is the dodge window, and it is the entire fairness of the mechanic.
2. **Commit** (`travelSeconds`, 0.55s): a quadratic Bezier from where it was to where the PLAYER WAS at the instant it
   committed, through a control point pushed perpendicular by `charges.bowRatio` of the distance. The path is
   evaluated from `t`, not accumulated per frame, so it is identical whatever the frame rate did.
3. Then `chargeRest = cooldownSeconds` (2.2s), counted down whether or not it is hunting.

It is a STATE, like `entry` and `flee`, and for the same reason: it has to REPLACE the kind's own motion while it
lasts, or the fish would keep steering on top of the curve and the curve would stop being a curve.

## The two design decisions worth stating

**Aimed at where the player WAS, never corrected.** This is the difference between a pattern to dodge and a homing
attack. Everything the player does during the wind-up counts, and nothing else does -- which is what makes the
telegraph a promise rather than a decoration.

**A curve rather than a straight line.** A straight lunge is answered by "stand aside" at a glance. A bowed one has to
be read for its direction, so "where do I go" stops being a reflex and becomes a judgement. The bow's SIGN comes from
which side of the player the creature is on, so two fish on opposite sides curve apart instead of tracing one line.

## Measured on the running game (412x915, player at volume 1.8 so it cannot eat the fish)

    held still                         1 hit   <- the lunge connects
    dodged a quarter lane in the wind-up  0 hits  <- the window is real
    two lunges from one fish           0.10s and 3.59s = a 3.49s gap, i.e. cooldown + telegraph + travel (3.5)
    path vs the straight line          33m off a 227m charge = 15% = half of bowRatio, which is what a quadratic
                                       Bezier through a perpendicular control point gives

The first attempt at the dodge test measured "held still: 0 hits", which was the test's fault, not the mechanic's: at
volume 3 the devour bubble is big enough to EAT a fish, so the charger was being swallowed instead of hitting. Worth
recording because it is a real interaction: a grown devour bubble answers a lunge by opening its mouth.

## Also

- The telegraph and trail are config colours, and the telegraph pulses so a still line reads as a countdown.
- `charges.kinds` is cross-checked against the real hazard kinds at load: a typo there would otherwise mean nothing
  ever charges, with no symptom on screen.
- The codex derives an "attack method" fact per creature from the config, so the fish's card cannot go stale.
- `hazards.charges` is a monotonic counter, because a lunge is over in under a second and sampling a boolean
  afterwards proves nothing.

## Comments

- 2026-10: requested as "营造出一种类似于子弹弹幕的效果，让玩家不断进行躲避…小鱼直接撞上来（以一个固定的曲线移动）".

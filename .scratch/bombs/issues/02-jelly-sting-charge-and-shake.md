# 02 — Jellyfish contact damage, a charge that starts where it stands, and a blast you can feel

Status: resolved

## What was asked

Three things: the jellyfish should hurt on contact as well; the jellyfish currently moves to a particular spot before
arcing across, and it should jump from where it already is; and the bomb fish's explosion is not obvious enough, so add
a slight screen shake.

## The jellyfish now stings

Its contact used to apply only the slow (`slowFactor` / `slowSeconds`). That made touching a jellyfish strictly better
than touching a fish -- on a creature that is slow, unavoidable and everywhere. It now costs
`hazards.jellyContactDamage` (1) hit points as well, and the slow is what makes the cost hurt: you are wounded AND
clumsy in the second that follows.

Measured: one hit, 0.2 volume (= `volume.hitCost`), and the slow observed while it lasted.

## The charge starts where the creature is

The `side` approach is gone, and so is the `approach` field itself. It had the jellyfish slide out to a flank during
its wind-up so that it would "come in from the side" -- and the owner said exactly what was wrong with it: the creature
visibly travelled to a spot and only then jumped, which reads as two moves rather than one attack.

What makes a lunge come in from the side is the CURVE, not a staging position. The jelly keeps `bowRatio: 0.85`, which
is six times the fish's bow, and now starts from its own coordinates like everything else. The config is one field
smaller and the two chargers differ by numbers rather than by code, which is what a per-kind table is for.

Measured: the lunge's start point is 2m from the creature's own body (the drift of the frame it committed) and 0m from
where it was spawned; it drifts 0m while winding up.

## The blast shakes the screen

`hazards.bombfish.blastShakePixels` (7) and `blastShakeSeconds` (0.3). Two offsets that do not divide each other, so it
reads as a rattle rather than a sway, scaled by what is left of the duration so it ends where it started -- at zero,
because snapping back to centre would be the one part of a shake the eye notices.

It is applied to the STAGE, so the HUD moves with the water: this is not "the sea is moving", it is "that one landed on
you", and the whole screen moving is what makes it read as the screen rather than as a camera. Small on purpose -- it
has to feel like weight, not like a reason to lose track of where you are, because the player is still dodging while it
runs. The amplitude is in design pixels, like every other screen measurement, so it does not grow on a wide window.

Measured: the stage offset peaked around 4px against a 5.3px amplitude (7 design px x the 0.76 design scale; the
sampling interval under-reads a 10Hz rattle) and returned to exactly (0, 0).

## Comments

- 2026-10: requested as "水母现在碰到玩家的气泡也算是伤害。修复问题：水母会先位移到一个特定的位置，再进行弧线的跳转，这里应该是水母就直接从自己当前的位置进行跳转。还有就是爆炸鱼的爆炸效果不够明显，在爆炸的时候加上轻微的抖屏效果。"

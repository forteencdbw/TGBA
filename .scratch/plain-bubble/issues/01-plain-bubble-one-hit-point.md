# 01 — A third bubble type: the plain bubble (no abilities, one hit point)

Status: resolved

## What was asked

A new bubble type: the plain bubble. No special abilities, one hit point, dies when an enemy touches it.

## What it is

A row in `BUBBLE_TYPES` with `controls: ['skill']`, `look: 'plain'`, `swallowsHazards: false`,
`firesBullets: true`, and the new field `hitsToPop: 1`. Everything else the menu, the touch layer, the HUD and the
codex needed came from the list: the menu lays out one button per type (a third of the row each), the touch layer
lays out only the controls named, and the codex generates a card per type and THROWS at load for a type with no
prose -- so `BUBBLE_PROSE.plain` is required, not optional.

## The one-hit rule, and why it is a type property

Hit points in this game are VOLUME: one hit costs `volume.hitCost`, so absorbing bubbles is what buys the right to be
hit again. That is the devour bubble's reward for eating and the volatile bubble's consolation for having no stomach.
Read literally, "one hit point" has to replace that rule, because the volumetric one would quietly give a grown plain
bubble more lives -- the single thing this type is not allowed to have.

So `BubbleType.hitsToPop: number | null` joins `swallowsHazards` on the descriptor: `null` is the volumetric rule
every existing type uses, and a number is a count of hits at ANY size. It is on the type rather than in
`mechanics.json5` because it is not a balance knob -- it is what the character IS, and the module's own docblock
already says a type is a descriptor of a character rather than a preset of the game's rules.

`takeHit` sets the volume to zero and lets the existing pop check do the dying: only the AMOUNT of damage has a
second rule, not the dying. `Diagnostics.hitsSurvived` reports the type's rule first, because reporting
`hitsSurvived(volume)` would have said "6" about a bubble that dies to one touch -- a probe-facing number that lies is
worse than no number.

The consequence, stated rather than hidden: for this type, growing is PURE COST -- a bigger hitbox and a slower
bubble for no survivability. That is coherent (a plain bubble wants to stay small) but it is a real design
consequence, and it is in the config note, the codex card and the README.

## What it kept, and why each

- **The skill button.** `skill` is the button every type has because every type can CARRY a skill, and a carried skill
  is an item the level handed over rather than an ability of the character. Dropping the button would leave a
  collected skill unusable, and a pickup that does nothing is worse than no pickup.
- **The gun.** With one hit point and no verbs, every creature is a lethal obstacle and the only move is to run; the
  gun is what makes distance a resource. It is also the game's default weapon rather than a character's ability, so
  turning it off would not make the type plainer, only different.
- **The growth stages**, for shape and speed. Its colour follows none of them: the other two palettes are state
  readouts (speed tier, anger), and this type has no state worth advertising -- so it is colourless, derived by
  OVERRIDE from the growth stage so its alphas and ring cannot drift out of sync with the other bubble's.

## Measured (412x915)

    types on offer                 ["devour","angry","plain"], and the menu offers the same list
    plain at volume 1.0            1 hit  -> phase burst   (hitsSurvived 1)
    plain at volume 3.0            1 hit  -> phase burst
    plain at volume 6.0            1 hit  -> phase burst
    devour at volume 6.0, same    0 hits -> still playing (it ATE the fish: volume 6.0 -> 6.24)
    codex                         12 bubble entries including bubble:plain, no feature cards for it
    in play                       controls ["skill"], swallowsHazards false, gun armed, hitsSurvived 1

A fish held in contact every frame, at three sizes, kills the plain bubble with exactly one hit at all three; the
same contact on the devour bubble is a meal instead, which is what makes the rule the TYPE's.

## Comments

- 2026-10: requested as "新增一个气泡类型：普通气泡，没有特殊能力，只有一滴血，被敌人碰到了就死亡".

### Follow-up: a bug report -- it could devour, and it grew

Reported: the plain bubble also has the devouring ability, which it should not have; and its volume should not grow
either, absorbing a bubble should only score.

The GROWTH half was real and is fixed by `BubbleType.growsByAbsorbing` (false for the plain bubble). It was absorbed
exactly like the devour bubble: volume up, stage counter up, speed penalty on. That meant it was quietly playing the
devour bubble's game -- eat, grow, survive more hits -- while its whole design is that one touch is fatal at any size;
and since its hit points are a fixed count, growth bought it nothing and cost it a bigger hitbox and a slower bubble.
Now absorbing still removes the bubble and still pays, but pays in `score.absorb` (5) instead of size: no volume, no
stage, no speed change. The HUD says so too -- the state line reads "幼泡 不成长" rather than "0/12", because a
progress bar that can never advance is a promise about something that cannot happen.

The SWALLOWING half did not reproduce, and the measurement is worth recording rather than the claim: with the plain
bubble at the volume CAP (10) and each hazard held in contact on every frame, `canEatHazardForTest` was false for all
nine kinds and `hazards.eaten` stayed at 0 for all nine -- contact dealt damage (or the kind's own effect: the jelly's
slow, the trash bag's grip) instead. `swallowsHazards: false` gates `canSwallow`, which is the single predicate both
the reversal collision and the edibility marker read, so there is no second path into the stomach; and the class of
bug it would be is exactly the one the repo's invariant guards -- nothing swallows without a verb to get it back out,
and this type has no verbs at all.

The most likely reading of what was seen is the absorb itself: a collectable bubble vanishing into the plain bubble
looks exactly like the devour bubble eating, and that WAS the growth bug. If a CREATURE is still seen going inside
it, the kind and the volume would pin it down in one run.

Measured after the fix (six small collectables absorbed, one at a time):

    plain    volume 1 -> 1      stage 幼泡 -> 幼泡   speed 1 -> 1     score 0 -> 30   ledger absorb 6
    devour   volume 1 -> 2.2    stage 幼泡 -> 幼泡   speed 1 -> 1     score 0 -> 0    ledger absorb 0

The devour bubble is deliberately untouched: for a type that grows, growth already IS the reward, and paying twice for
one act is a balance change nobody asked for. `score.absorb` is read only by the branch that cannot pay in size.

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

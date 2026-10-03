# 03 — Two round changes: the fish is softer, and a gun upgrade exists

Status: resolved

## What was asked

Fish hit points to 2, and a new pickup -- an ability upgrade that makes the gun fire two rows of small bubbles at the
same time.

## The fish

`hazards.health.fish` 3 -> 2. One line of config, and the codex no longer states it in prose: every enemy card now
DERIVES a "打跑" fact from `hazards.health`, because the number changes and a hand-written card would not have.

## The upgrade pickup

Four pieces, and the shape of the change is the interesting part:

  `SpawnKind` gained `'upgrade'`, and `src/levels.ts` grew a `PICKUP_KINDS` list. The rules that pickups share --
  arriving with the current, never from a side, and occupying one slot in the water rather than a field -- are now
  asked of that list, so a third pickup inherits all of them.

  `main.ts`'s `skillPickup` became `pickup: { kind, id, x, y }`: one slot that knows what it is. The skill rolls its id
  at collection (unchanged, and for the same reason); the upgrade has nothing to roll.

  `BulletContext` gained `muzzles: {x, y}[]` in place of `muzzleX/muzzleY`, and `spawn` fires one round per muzzle
  every tick. That is what makes the upgrade a STRONGER gun rather than a wider one: alternating rounds between two
  muzzles would look identical and hit exactly as hard. `gunStreams` is per-run state, so the upgrade never survives a
  death -- otherwise dying would be a way to keep a permanent advantage.

  `mech.pickups` is a new table of looks (one row per pickup), because the two must be told apart at a glance in
  peripheral vision and that is exactly the kind of number that gets re-tuned. The upgrade is stacked chevrons rather
  than the skill's diamond: shape is the first thing peripheral vision resolves, and two arrows say "more rows"
  without a word of text.

One upgrade eats itself at the ceiling rather than piling up silently: at `maxStreams` the pickup is still consumed
and the banner says so ("已经是 2 排"), because a pickup that did nothing with no message reads as a bug.

## Measured on the running game (412x915)

    fish                    2 rounds drive one off (health 2, damage 1)
    one row                 4.42 rounds/game-second (config 4)
    two rows                7.66 rounds/game-second (config 8) -- very nearly doubled
    the pickup              consumed on contact, `gunStreams` 1 -> 2, score +50 (the same price as a skill)

## Content

Level 1 places one at 260m, alone and early: it is the only pickup whose effect is visible immediately (the stream
doubles on the spot), so it belongs where the player can connect "something happened" to "I got stronger".

## Comments

- 2026-10: requested as "鱼的血量改为 2，新增可拾取道具：能力升级，拾取后可以同时发射两排小泡泡子弹".

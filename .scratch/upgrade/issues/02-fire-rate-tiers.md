# 02 — The fire-rate upgrade, and the gun's rate becomes a ladder

Status: resolved

## What was asked

A second upgrade -- a speed one: picking it up makes the gun fire faster, one tier per pickup, and the fire rate tops
out at tier three.

## The config shape

`bullets.perSecond` became `bullets.rateTiers: [4, 6, 9]`.

An array rather than a number plus a separate cap, because "how many tiers are there" and "how fast is each tier" are
the SAME fact: adding a tier is adding an entry and deleting one is deleting an entry, so there is no second number to
keep in sync. Three entries IS "tops out at three tiers", and the first entry being 0 is still how the whole weapon is
switched off.

`perSecond` moved from the field's own config read to `BulletContext`, supplied by the caller -- the same shape as
`armed`. The cadence now depends on what the RUN has collected, and "how fast may I shoot right now" is a question
about the run, not about the weapon in general.

## The pickup

`PICKUP_KINDS` gained `'rate'`, `SpawnKind` gained `'rate'`, and `mech.pickups.rate` is the look: one chevron with
speed dashes either side, in warm orange, against the rows upgrade's green double chevron and the skill's purple
diamond. Shape before colour, the same rule as the other two -- a player reading the water in peripheral vision has to
tell "shoots quicker" from "shoots wider" before they can read a word.

The two upgrades are independent multipliers (rows x rate) with independent ceilings, and `rateTier` is per-run state
like `gunStreams`: a permanent upgrade that survived a death would make dying a way to keep an advantage.

At the ceiling the pickup is still consumed and the banner says "已经是最高档（第 3 档）", because a pickup that does
nothing in silence reads as a bug.

## Measured on the running game (412x915)

    tiers                    [4, 6, 9]
    run starts               tier 1, configured 4,  measured 3.60/s
    one rate pickup          tier 2, configured 6,  measured 6.12/s
    two rate pickups         tier 3, configured 9,  measured 9.18/s   <- the ceiling
    three, four, five        tier stays 3, banner reads "已经是最高档（第 3 档）"
    plus a rows upgrade      tier 2 x 2 rows = 12 configured, measured 12.5/s

That last line is the point of two separate pickups: the multipliers really do multiply, and each has its own ceiling.

## Also

Level 1 places one at 520m, deliberately after the rows upgrade at 260m, so the two pickups have their own lines the
player can connect an effect to. The codex gained a card that DERIVES the ladder from the config (so it cannot state a
rate the game does not use), and every place that mentioned `bullets.perSecond` -- two comments, the README's gun
table, the e2e helper's type and the bullets spec -- now reads the ladder's first tier instead.

## Comments

- 2026-10: requested as "新增另一个速度升级，拾取后射速变快，拾取一个提高一档射速，射速最高为三档".

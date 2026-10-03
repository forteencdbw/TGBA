# 03 — The pickup that vanished: one slot became a list

Status: resolved

## What was reported

The fire-rate upgrade's pickup disappears very quickly. Put it at the start of the level.

## What was actually wrong

The reported symptom was real and the diagnosis was one step short of the cause: the pickup was not expiring, it was
being **overwritten**.

`main.ts` had a single pickup SLOT (`this.pickup`), so a level that placed two pickups near each other lost the first
one the moment the second spawned. Level 1 had exactly that arrangement: the rate upgrade at 520m and a skill at 540m,
twenty metres apart, which at the level's scroll speed is **0.8 seconds**. The player sees a pickup vanish with no
explanation, which is why "it disappears quickly" was the honest report of it. The pair at 200m/260m (skill, gun
upgrade) had the same problem, 2.4 seconds apart.

So the fix is the list, and the move is the request:

  `this.pickup` became `this.pickupDrops: { kind, id, x, y }[]`. Each drop moves, is culled and is collected on its own
  -- and the collection loop runs BACKWARDS, because collecting removes from the list. Two drops in reach in the same
  frame both apply (measured), which a single slot could not express at all.

  The rate upgrade moved to `at: 12` -- the very start of level 1, before the first bubbles. As the owner put it, a
  pickup that only sits in the water for a while is worth nothing if it arrives late.

The name matters for the reading of the diff: `pickups` was already the world's drawing layer (a `Graphics` that
everything in the water is painted into), so the list is `pickupDrops`.

## Measured

    two drops 18m apart        both on screen at once (count 2; the old slot reported 1)
    both collected             tier 1 -> 2, score +100 (two pickups x 50), skill granted
    a drop that drifts off     culled on its own, without taking the other one with it

## Also

The spec that injects a pickup was updated to push onto the list (`g.game.pickupDrops.push(...)`) -- it had been
assigning to a `skillPickup` field that the earlier rename had already removed, so it was writing to a property nothing
read. That is exactly the class of thing the specs are not being run to catch right now, and worth naming for when they
are.

The level file's header now says that pickups can coexist, since that is an authoring fact a level writer needs.

## Comments

- 2026-10: requested as "射速升级的拾取物消失得很快，把它放在关卡刚开始吧".

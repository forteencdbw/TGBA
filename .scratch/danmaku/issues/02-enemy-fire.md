# 02 — Bullet-hell pressure: enemy fire

Status: resolved (half two of two; the charging lunge is `01-charging-lunge.md`)

## What was asked

The second way to make the player dodge: enemies that shoot bullets the player has to avoid.

## What it is

`src/enemyBullets.ts` (a field of hostile rounds) + `enemyBullets` in the config + `Hazard.shootTimer`, ticked in
`HazardField.updateShooting` and reported as a `HazardEffect.shot`. `main.ts` turns the orders into rounds, advances
them, and applies the damage through the SAME `takeHit` a collision uses.

Not `src/bullets.ts` with an `enemy` flag. The player's rounds are harmless to their owner, fired from a muzzle the
player carries, and are the reason the player has any reach; enemy rounds hurt the one thing the player IS and exist
to make a piece of water the player must not be standing in. Merged, every method would ask "whose bullet is this".

## The three things that make it fair, all config

  aimed at where the player WAS and never corrected  -> it can be read and stepped out of, rather than homing
  speed is a fraction of a lane per second          -> slower than the player's own lateral speed, so the dodge is
                                                       always physically available, not merely theoretically possible
  a shooter only fires inside `rangeMeters`         -> a round can never arrive from a creature the player cannot see

The table is a SUBSET of the kinds, so an absent row means "no gun" rather than "default gun": a creature that started
shooting because it was missing from the config would be a difficulty change nobody made. A row is validated field by
field, because a missing `perSecond` divides by zero into an infinite cadence and a missing `speedPerSecond` fires a
round that does not move -- both fail as "the game feels broken" rather than as an error.

A creature that is fleeing, still arriving or mid-lunge does not shoot: all three mean "busy", and a fish that lunged
AND fired from inside its own telegraph would be two threats wearing one warning. Firing and being hit are also
PLAYING-phase acts, the same rule the player's own gun follows -- without that, a round landing during the ending
would restart the burst timer and extend the results card under a run that was already over.

## Measured on the running game (412x915)

  standing still, 5s, an eel   4 hits, volume lost exactly 0.8 = 4 x volume.hitCost -- one hit point per round
  the same, with a crate      1 round landed: cover blocks MOST of a stream, not all of it (the shooter moves, the
                              crate has edges), which is what cover should be
  walking sideways            0 hits, 0 rounds landed -- the rounds are slow enough that moving defeats them
  cadence                     jelly 0.76/s (config 0.70), eel 1.3/s (1.1), bombfish 0.6 volleys/s (0.45) with 3
                              rounds each; the excess is the test spawn firing immediately instead of on a random
                              offset, which is why `spawnForTest` zeroes the timer

## A note on the defaults

The shipped numbers are a first guess, not a tuned difficulty. Everything is in `enemyBullets`: `perSecond` is the
pressure knob, deleting a row removes that shooter entirely, and emptying `charges.kinds` removes the lunges. The two
halves are independent, so either can be turned off without touching the other.

## Also

- Rounds are drawn AFTER the scenery so cover never hides what can kill you: scenery blocks them, but drawing them
  behind a crate would make a round about to emerge from its far side invisible until it did -- and this feature's
  contract is that everything lethal is visible before it lands.
- They are drawn as a bright core inside a warm rim, the opposite of the player's pale cold-rimmed bubbles, because
  peripheral vision is the only vision a player has when a wall of them is arriving.
- `enemyBullets` diagnostics report in-flight, fired and hits, so a probe can tell "nothing is shooting" from "the
  rounds are all gone". The counters are monotonic, because a round lives a couple of seconds.

## Comments

- 2026-10: requested as "…另一种方式是敌人也会发射子弹，玩家需要躲避子弹".

### Follow-up: the jellyfish becomes a SIDE charger, loses its gun, and gets a health bar

Requested: the jellyfish is an enemy, it can be driven off by attacks, it does not shoot, it charges in from the side,
and its tentacles should hang down rather than up.

Four changes, three of them config:

  health          `hazards.health.jelly` 0 -> 2. It was immune to the player's gun, which made it scenery with a slow
                  effect; it is a target now, and being shootable is its counterweight for being harder to dodge.
  gun             removed from `enemyBullets.shooters`. A kind absent from that table does not shoot, so this is a
                  deletion rather than a switch.
  lunge           `charges.kinds` became `charges.chargers`, a TABLE keyed by kind, because the interesting part is
                  that two creatures threaten in two directions: `approach: 'dive'` (the fish) or `'side'` (the
                  jelly). A name list could not say that.
  tentacles       a real bug, and the owner spotted it: they were drawn at `y + r * 0.8 .. y + r * 2.3`, and since
                  `toScreenY` is `cy - (worldY - camera.y) * scale`, +y is UP the screen. So the jellyfish was drawn
                  standing on its tentacles. They hang from the underside of the bell now.

`side` is not a teleport. The wind-up spends its time sliding the body to a flank just outside the lane edge, and the
lunge then sweeps ACROSS from there to where the player was -- so the flank is a place the player watched it go, and
the visible telegraph line is the warning. The flank is 4% outside the edge rather than well off it, because a body
that has left the screen reads as the creature having left the game.

Measured (412x915):

  jelly health            2, and the gun drives it off: one non-fatal hit then `fled` -- exactly two hit points
  a jelly alone for 5s    0 rounds fired
  its lunge               start x = 404 with the lane 361 wide, i.e. OFF LANE; 223m of horizontal travel against
                          36m of vertical -- it really does come across rather than down

Also updated: the codex derives its "attack method" line per kind from these tables, so the jelly's card now says it
charges from the side instead of firing, with no prose to keep in sync.

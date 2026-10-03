# 04 — The urchin shoots spikes, and the bomb fish hunts

Status: resolved

## What was asked

The urchin and the bomb fish can both be shot now. The urchin has 15 hit points and fires SPIKES, faster than other
bullets. The bomb fish does NOT shoot; it closes on the player's bubble and, when close enough, starts a three second
countdown and explodes; it has 10 hit points, and if its health reaches zero before it gets close, it explodes where it
is.

## The urchin

`hazards.health.urchin: 15` -- the toughest creature in the game, so driving it off costs TIME, which is the scarcest
thing in a run. It joined `enemyBullets.shooters` with `shape: "spike"` and `speedPerSecond: 0.5`, and the bomb fish
was removed from that table (a kind absent from it does not shoot).

`shape` is a new per-shooter field, copied onto each round at spawn so that editing a row mid-run cannot redraw rounds
already in the water. `bolt` is the pellet-with-a-tail every other shooter uses; `spike` is a long thin diamond drawn
along the velocity. Length rather than size, because a fast round needs a shape that reads as motion: a fast pellet is
a dot that appears, and a needle says which way it is going.

Measured: urchin 0.88 rounds/game-second firing `spike` shapes at 181 m/s against the eel's 108 m/s -- 1.67x faster,
which is the "faster than ordinary bullets" that was asked for.

## The bomb fish

It used to swim down with a lazy weave and pointedly not come for the player, because a temptation has to be avoidable
or the choice to swallow one is made for you. That reasoning still holds for the reversal -- which is still available --
but the creature's role in the water changed. It now hunts: it re-aims at the bubble every frame (deliberately the
opposite of the charge's committed curve -- a bomb that cannot be out-turned, only out-run and out-shot), and inside
`armMeters` it lights a fuse.

Three additions, all in a new `hazards.bombfish` group:

  `blastFuse` on the hazard   a SECOND fuse, and a separate field rather than a reuse of `fuse`, because a bomb fish has
                              three lives -- hunting outside, burning inside a stomach, flying as a grenade -- and they
                              are three different clocks. `fuse` is the crab's launch wind-up; the stomach's runs on the
                              swallowed ITEM in `src/spit.ts`.
  detonations as effects      resolved in `update`, where the player's distance is in hand and where every other
                              consequence becomes an effect. The blast pushes the same `damage` effect a collision
                              would, so it goes through the one damage path the game has -- invulnerability window, hit
                              sound and death all included. A blast that MISSED still reports its radius, so the
                              shockwave is drawn for the one that nearly got you.
  `hit()` on a bomb fish      at zero health the fuse is set to zero instead of the creature fleeing: it goes off where
                              it floats. That is the whole trade of shooting one -- you cannot disarm it, only choose
                              where it happens.

The whole creature's numbers moved into the group, including the two that were already there
(`stomachFuseSeconds`, `grenadeBlastRadiusRatio`), because a reader looking for "how long until the bomb fish goes off"
should not have to know whether that is a stomach number or an ocean one.

It shows its own timing: a ring closes in on the body as the fuse burns, the same language the crab's launch arc uses.

## Measured on the running game (412x915)

  hunting                gap 423m -> 137m over three seconds (it really does close)
  arming + fuse          armed at a 96m gap, fuse ran 2.95s of GAME time (configured 3)
  blast radius           96m against a 119m radius -> damage landed; radius forced to 18m -> 0 hits, 0 volume lost, so
                         the radius is what gates it rather than the proximity
  shot dead at range     never armed (pinned 300m out), died at a 286m gap -- a blast at 286m against a 119m radius
                         did nothing, which is the safe way to defuse one
  volumes                health 15 and 10 as configured

## Comments

- 2026-10: requested as "海胆和炸弹鱼也可以被子弹攻击了，海胆血量为 15，发射的子弹为尖刺，速度比普通的子弹快。炸弹鱼不会发射子弹，但是会一直往玩家的气泡方向靠近，并会在靠近距离足够近时，进入引爆倒计时，三秒后爆炸，炸弹鱼的血量为 10，如果在靠近之前血量就清零了，就原地爆炸。"

# 02 — Every level ends with a boss, and the two distance readouts are gone

Status: resolved

## What was asked

Each level should have a boss, and the level must not end until that boss is defeated. Delete the height progress bar,
and delete the top text showing the metres to the surface.

## Why this is a level-model change rather than a new enemy

The old rule was `if (this.scrolled >= LEVEL.scrollLength) this.reachSurface()`, and the two readouts being deleted were
the two faces of that rule: the gauge was the level's progress and the headline was the distance left. Once a level ends
because something was KILLED, the distance stops being progress -- it keeps counting up and nothing the player does
changes it -- so the readouts were not merely redundant, they were measuring the wrong thing.

The scroll still stops at `scrollLength`, which is what turns the last stretch into an arena the player cannot leave.
Everything else about the old rule is gone.

## The boss is a hazard, deliberately

`HazardKind` gained `'boss'`. That is the whole integration cost: the player's gun already iterates hazards, the
invulnerability window, damage numbers, popups and culling all apply to it unchanged, and "shoot the boss" is the same
code path as "shoot a fish". What is stated explicitly, wherever it matters, is the four ways it differs:

  it does NOT ride the current   every other hazard is carried down at the level's scroll speed, which is what makes the
                                 water feel like water. The boss holds `holdMeters` above the player and patrols
                                 laterally -- the entire reason it is a fight rather than an encounter to outrun.
  zero health means DIED         `hit()` gained a `killed` outcome. Every other creature leaves (the reversal means
                                 nothing is destroyed); a boss has nowhere to leave to, so its death IS the win signal.
                                 Keeping `killed` distinct from `fled` is what stops "I survived that" and "I beat that"
                                 from being the same message.
  it cannot be eaten            `edibleAtTier.boss` is the top tier, which is unreachable by construction.
  it is TINTED per level         `Hazard.tint`, because a boss's colour is the one part of a creature's look that is
                                 level design -- two levels must not look like the same monster.

It also has a hit flash (`hitFlash`), which a small creature does not need: a fish's death is its own confirmation,
while a boss that absorbs ten rounds in a row must say so every single time or the player cannot tell hits from misses.

## Where the numbers live

`config/levels.json5` gains a required `boss` block per level: `at` (when it arrives), `health`, `name`, `colour`. That
is level STRENGTH and level IDENTITY, like a spawn's position. The shared mechanics live in `mechanics.json5` under
`hazards.boss` (hold height, patrol, tracking speed, contact damage, size, colours) and its gun in
`enemyBullets.shooters.boss` (a five-round fan).

`at` must be INSIDE the level, and the loader says so with both numbers in the message: a boss scheduled past
`scrollLength` would never arrive, and the level could never be completed -- a config error that looks exactly like the
game hanging at the end.

## The two deletions, and what replaced them

  the gauge               deleted, along with its three config keys (`gaugeSide`, `gaugeEdgeInset`, `gaugeWidth`). The
                          level's signposts still exist and now anchor to the lane's left edge (`hud.landmarkInset`).
  the depth headline      deleted. Its slot is where the boss bar now sits, and the subline moved up into the space.
  the boss bar            NEW (`hud.bossBar`): the name and a bar across the top, visible only while a boss is alive. Its
                          absence is information -- before the boss arrives and after it dies there must not be a bar
                          sitting at zero -- so it is hidden explicitly when a run resets, or it would hang there through
                          the next birth animation showing the previous level's boss.

The `score.surface` event became `score.boss` (1000): the same "biggest single payout in a run", renamed because the
surface is no longer what earns it.

## Measured on the running game (412x915)

    level 1 boss          arrives at 1315m with health 120, radius 0.11 lane widths, tinted the level's colour
    boss bar               hidden before it arrives; shows the name "深渊灯笼鱼" while it lives
    the level cannot end   held at the boss with the scroll at its end for 5 seconds: phase stayed `playing`
    killing it             phase -> burst (the win ending), ledger `boss: 1`, +1000 score

`pnpm build` green. No Playwright run, per AGENTS.md.

Version 1.0.36 -> 1.0.37.

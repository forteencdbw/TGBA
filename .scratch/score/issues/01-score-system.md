# 01 — A score: what a run is worth, shown in the top-left corner

Status: resolved

## What was asked

A score system, permanently displayed at the top of the screen. Defeating fish, picking up special items and the
like earn points.

## What it is

`src/score.ts`: the EVENTS (`drivenOff`, `skill`, `eaten`, `surface`), their values in the config's `score` group,
a running total and a ledger of counts per event. `Hud` gained a `scoreLabel` in the top-left corner, positioned
from `hud.score`, and `main.ts` calls `award` at the four places the events happen.

A module rather than a number on `Game`: a running total is a variable, a score is a RULE about what counts.
Keeping the rule in one place is what stops it becoming five `this.score += 25` lines scattered through the update
loop, where the only way to answer "what is worth points" is to grep for arithmetic, and where re-pricing an event
means editing gameplay code. The call sites now say what HAPPENED (`award('drivenOff')`) rather than what it is
worth.

The ledger is COUNTS per event, not points per event, so the total can never disagree with the config: a re-priced
event re-prices the run in progress instead of leaving a total made of two different tables.

## Why each event pays

    drivenOff  25   the gun's payoff. Without points, shooting is a way to make the water emptier and nothing else,
                    and the ammo-free weapon has no cost to weigh against it.
    skill      50   a special item. The level's one pure reward, and the only pickup that is a decision to reach
                    for rather than something in the way.
    eaten      40   a creature swallowed. The reversal is the game's signature act and its most dangerous one --
                    the bubble gets bigger and slower for it -- so it pays.
    surface   500   reaching the surface. By far the biggest single payment: everything else is a trickle next to
                    finishing.

Any of them set to 0 takes that event out of the game, and `award` records nothing for an event worth nothing --
an event taken out should read as absent, not as a long list of zeroes.

## Display

Top-left, gold, above the gauge and above the debug readout. The top strip had exactly one free corner: the middle
is the depth headline, the right is the gear, and the left edge from y=110 down is the gauge. Gold because the top
block is the cyan family ("where am I") and the score is a different kind of number.

Position, size, colour and alpha are `hud.score`; the label is only rebuilt when the number moves, because it is
updated every frame and the digits are the point of it.

The session best (`bestScore`) is kept beside `bestClimbed`/`bestVolume` and reported on the results card. It is NOT
saved, which is `progress.ts`'s explicit decision: the save holds which levels are open, and a best is a per-run fact.

## A bug the results card had, found on the way

Adding a line to the card pushed it off both edges of the screen -- the player saw the middle of their own result.
The card was sized only by the WORLD zoom, which says nothing about how wide a line of text may be. It now wraps:
`hud.resultsCard.widthRatio` is a wrap width in screen terms. The size and vertical position moved into the same
config group while I was there, since the card is the screen the player stares at after a run.

Measured: with the wrap, a three-line card on a 412x915 phone renders 331 label-units wide against a 332 limit, and
377.7 screen pixels against 379 available. Before it was 570 label-units -- 650 screen pixels on a 412 pixel screen.

## Measured on the running game (412x915)

    a fresh run        0 points, ledger all zeroes, the readout reads 分数 0
    after a drive-off  25  (ledger drivenOff 1, readout 分数 25)
    after a pickup     75  (+50)
    after a swallow    115 (+40)
    after the surface  615 (+500), best 615, phase burst so the card is up
    a new run          0 points, best still 615

No page errors anywhere in that sequence.

### Follow-up (same request): the score floats up where it was earned

Requested: when the player scores, show the value drifting at the place it was earned -- a special item, for
instance, shows its points where it was picked up -- and have it disappear after three seconds.

`src/scorePopups.ts`: a pooled set of Pixi `Text`s, one per event, carrying the SCREEN position of the event plus an
age. `score.popups` in the config holds the life (3s), the rise, the size, the colour, the point in the life where the
fade starts, and a cap.

**Anchored to the event's screen position, converted ONCE, and that is the interesting decision.** The first version
kept the world position and converted every frame, which is the "correct" thing for something that belongs to the
water -- and it was measured wrong: the current runs at 25 m/s, so over the three seconds of life it drags a screen
object 85px down, while the popup's own rise is 35px up. Net: the number SANK 33px. A number that sinks does not
drift, and the drift is the thing that catches the eye. So the popup is pinned to where the event was at the instant
it happened and rises from there.

The size follows `designScale` (screen furniture), not `viewport.scale` (the water): a number whose job is to be read
must not grow because a metre happens to be worth more pixels on a wide window -- the same bug the buttons had.

Labels are pooled rather than created per event (each Pixi `Text` is a canvas and a texture), and at the cap the
OLDEST popup is retired rather than the new one refused: the newest number is the one the player is looking for.

One popup per creature driven off, at that creature, rather than one per frame's total -- a swarm finished in one
frame is several events and reads as several numbers.

Measured:

    pickup at screen (229, 448), bubble at x=206
    the popup says "+50" at (228.8, 447.1)
    over its life: y 447 -> 441 -> 436 -> 431 -> 425 -> 419 (UP the screen), alpha 1, 1, 0.88, 0.61, 0.27, gone
    driving a fish off floats "+25"
    a new run: 0 popups left

## Comments

- 2026-10: requested as "现在新增积分系统，常驻展示在屏幕顶部，击败小鱼、拾取特殊道具等会获得分数".

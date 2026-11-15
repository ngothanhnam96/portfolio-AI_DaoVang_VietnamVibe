# 01 · Spec

## Goal

An original browser game in the swinging-hook genre, with a Vietnamese setting. It should be
quick to pick up and pleasant to look at, and it should run on a phone with nothing to install.
It is a portfolio piece, so the rules must be provably fair: every level can be passed.

## Game loop

1. On the home screen, pick an open region.
2. A card shows the level, its target, the time limit and any goods you carry.
3. The hook swings. Drop it, hook something, and watch it reel back at a speed set by its
   weight. Money is added when it reaches the winch.
4. When the clock reaches zero, the level is passed if the money earned meets the target.
5. If you passed and more levels remain, Bà Tư's stall opens. Buy goods with your wallet, then
   go on.
6. After the third level, or a failed one, the run ends. The best score is saved and, on a
   win, the next region opens.

## Requirements

| # | Requirement |
|---|-------------|
| R1 | Four regions (Bồng Miêu, Tây Nguyên, Hạ Long, Sa Pa), three levels each, unlocked in order |
| R2 | A pendulum hook; fire on tap, click, Space or ↓; the reel is slower for heavier items |
| R3 | Gold in four sizes, two gems, two rocks, mystery jars, moving crabs carrying pearls, roots and wasp nests |
| R4 | A 60-second timer and a money target per level; targets rise across levels and regions |
| R5 | Levels are generated from a seed: the same seed gives the same field |
| R6 | Every generated level can be passed without power-ups (proved by a bot in the tests) |
| R7 | A between-level shop with six original goods, three offered per visit |
| R8 | Best score, furthest level and unlocked regions are saved; storage failures never break play |
| R9 | Pause and resume, including on tab switch |
| R10 | Works with mouse, touch and keyboard; the layout adapts to phones |
| R11 | No image or audio files and no dependencies: SVG art and WebAudio sound from code |

## Out of scope (for now)

Saving a run halfway, online leaderboards, more than four regions, and localisation beyond Vietnamese UI.

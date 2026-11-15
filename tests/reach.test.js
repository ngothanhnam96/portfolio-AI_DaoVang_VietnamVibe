// The strongest guarantee in the suite: a bot with the player's own inputs
// (fire, cut) and no power-ups passes every level of every region, for many seeds.

import test from "node:test";
import assert from "node:assert/strict";
import { playLevel } from "../src/core/autoplay.js";
import { generateLevel } from "../src/core/level.js";
import { LEVELS_PER_REGION, REGIONS } from "../src/core/regions.js";
import { modsFromPerks } from "../src/core/shop.js";

const SEEDS = Array.from({ length: 12 }, (_, k) => k * 7919 + 1);

for (const region of REGIONS) {
  for (let index = 0; index < LEVELS_PER_REGION; index++) {
    test(`${region.name}, màn ${index + 1}: the target is reachable with the items present`, () => {
      for (const seed of SEEDS) {
        const level = generateLevel(region.id, index, seed);
        const s = playLevel(level);
        assert.ok(s.passed, `seed ${seed}: earned ${s.earned} of ${level.target}`);
        assert.ok(s.earned >= level.target * 1.1, `seed ${seed}: too tight (${s.earned} / ${level.target})`);
      }
    });
  }
}

test("a replay with the same seed and inputs ends with the same money to the coin", () => {
  const level = generateLevel("sapa", 2, 31337);
  const a = playLevel(level);
  const b = playLevel(level);
  assert.equal(a.earned, b.earned);
  assert.deepEqual(a.collected, b.collected);
  assert.equal(a.shots, b.shots);
});

test("power-ups help: tea and rope earn at least as much on the hardest level", () => {
  let plain = 0;
  let boosted = 0;
  for (const seed of SEEDS.slice(0, 6)) {
    const level = generateLevel("sapa", 2, seed);
    plain += playLevel(level).earned;
    boosted += playLevel(level, { mods: modsFromPerks({ tea: true, rope: true, hourglass: true }) }).earned;
  }
  assert.ok(boosted > plain, `${boosted} ≤ ${plain}`);
});

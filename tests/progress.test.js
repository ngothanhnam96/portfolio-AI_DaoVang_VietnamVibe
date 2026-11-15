import test from "node:test";
import assert from "node:assert/strict";
import { isUnlocked, newProgress, recordOf, recordRun, restoreProgress, totalBest } from "../src/core/progress.js";
import { REGION_IDS } from "../src/core/regions.js";
import { createRun, finishLevel, leaveShop } from "../src/core/run.js";

const won = (id, scores) => {
  let run = createRun(id, 1);
  scores.forEach((earned, i) => {
    run = finishLevel(run, { earned, passed: true });
    if (i < scores.length - 1) run = leaveShop(run);
  });
  return run;
};
const lost = (id, earned) => finishLevel(createRun(id, 1), { earned, passed: false });

test("only the first region is open on a new save", () => {
  const p = newProgress();
  assert.deepEqual(REGION_IDS.map((id) => isUnlocked(p, id)), [true, false, false, false]);
  assert.equal(isUnlocked(p, "atlantis"), false);
});

test("clearing a region opens the next one; losing does not", () => {
  let p = recordRun(newProgress(), lost("bongmieu", 400)).progress;
  assert.equal(isUnlocked(p, "taynguyen"), false);
  assert.deepEqual(recordOf(p, "bongmieu"), { best: 400, cleared: false, furthest: 0 });
  p = recordRun(p, won("bongmieu", [700, 900, 1100])).progress;
  assert.equal(isUnlocked(p, "taynguyen"), true);
  assert.equal(isUnlocked(p, "halong"), false);
  assert.deepEqual(recordOf(p, "bongmieu"), { best: 2700, cleared: true, furthest: 3 });
  assert.equal(p.runs, 2);
});

test("best scores only improve and a cleared region stays cleared", () => {
  let out = recordRun(newProgress(), won("bongmieu", [700, 900, 1100]));
  assert.equal(out.newBest, true);
  out = recordRun(out.progress, lost("bongmieu", 300));
  assert.equal(out.newBest, false);
  assert.deepEqual(recordOf(out.progress, "bongmieu"), { best: 2700, cleared: true, furthest: 3 });
  assert.equal(totalBest(out.progress), 2700);
  assert.throws(() => recordRun(newProgress(), createRun("sapa", 1)), "an unfinished run is not recorded");
});

test("save and load: progress survives a JSON round trip exactly", () => {
  let p = recordRun(newProgress(), won("bongmieu", [700, 900, 1100])).progress;
  p = recordRun(p, lost("taynguyen", 650)).progress;
  assert.deepEqual(restoreProgress(JSON.parse(JSON.stringify(p))), p);
});

test("junk in storage is cleaned, unknown regions are dropped", () => {
  for (const junk of [null, 7, "x", [], { regions: "nope" }, { regions: [] }]) {
    assert.deepEqual(restoreProgress(junk), newProgress());
  }
  const p = restoreProgress({ regions: { bongmieu: { best: "2500.7", cleared: "yes", furthest: 9 }, atlantis: { best: 1 } }, runs: -3 });
  assert.deepEqual(p, { regions: { bongmieu: { best: 2500, cleared: false, furthest: 3 } }, runs: 0 });
  assert.equal(isUnlocked(p, "taynguyen"), false, "a string 'yes' does not clear a region");
});

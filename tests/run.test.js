import test from "node:test";
import assert from "node:assert/strict";
import { buy, createRun, finishLevel, leaveShop, levelFor } from "../src/core/run.js";
import { OFFER_SIZE, SHOP_IDS, SHOP_ITEMS, modsFromPerks, offerFor } from "../src/core/shop.js";

test("a run starts on level 1 with an empty wallet", () => {
  const run = createRun("bongmieu", 99);
  assert.equal(run.status, "level");
  assert.equal(run.levelIndex, 0);
  assert.equal(run.wallet, 0);
  assert.equal(levelFor(run).index, 0);
  assert.deepEqual(levelFor(run), levelFor(createRun("bongmieu", 99)), "seeded");
  assert.throws(() => createRun("atlantis", 1));
});

test("passing a level pays the wallet and opens the shop; the last level wins the run", () => {
  let run = createRun("halong", 5);
  run = finishLevel(run, { earned: 1300.4, passed: true });
  assert.equal(run.status, "shop");
  assert.equal(run.levelIndex, 1);
  assert.equal(run.wallet, 1300);
  assert.equal(run.shop.offer.length, OFFER_SIZE);
  run = leaveShop(run);
  run = finishLevel(run, { earned: 1400, passed: true });
  run = leaveShop(run);
  run = finishLevel(run, { earned: 1500, passed: true });
  assert.equal(run.status, "won");
  assert.equal(run.score, 4200);
  assert.deepEqual(run.results.map((r) => r.passed), [true, true, true]);
});

test("failing a level ends the run but keeps the score", () => {
  const run = finishLevel(createRun("sapa", 1), { earned: 700, passed: false });
  assert.equal(run.status, "lost");
  assert.equal(run.score, 700);
  assert.throws(() => finishLevel(run, { earned: 1, passed: true }));
  assert.throws(() => leaveShop(run));
});

test("the shop offers three different goods with prices that rise with the level", () => {
  for (let seed = 0; seed < 50; seed++) {
    const offer = offerFor(seed, 1);
    assert.equal(new Set(offer.map((o) => o.id)).size, OFFER_SIZE);
    for (const o of offer) {
      assert.ok(SHOP_IDS.includes(o.id));
      assert.equal(o.price % 5, 0);
      assert.ok(o.price >= SHOP_ITEMS[o.id].base * 0.85 - 5 && o.price <= SHOP_ITEMS[o.id].base * 1.15 + 5);
    }
    assert.deepEqual(offerFor(seed, 1), offer, "same seed, same stall");
  }
  const avg = (lvl) => {
    let sum = 0;
    for (let seed = 0; seed < 200; seed++) for (const o of offerFor(seed, lvl)) sum += o.price / SHOP_ITEMS[o.id].base;
    return sum;
  };
  assert.ok(avg(2) > avg(1) * 1.2);
});

test("buying: money is taken once, goods are not sold twice, the poor are refused", () => {
  let run = finishLevel(createRun("taynguyen", 3), { earned: 200, passed: true });
  const [cheap, ...rest] = [...run.shop.offer].sort((a, b) => a.price - b.price);
  let out = buy(run, cheap.id);
  assert.ok(out.ok);
  assert.equal(out.run.wallet, 200 - cheap.price);
  assert.equal(out.run.perks[cheap.id], true);
  assert.equal(run.wallet, 200, "the old run is untouched");
  run = out.run;
  out = buy(run, cheap.id);
  assert.deepEqual([out.ok, out.reason], [false, "sold-out"]);
  const missing = SHOP_IDS.find((id) => !run.shop.offer.some((o) => o.id === id));
  assert.equal(buy(run, missing).reason, "not-offered");
  const broke = { ...run, wallet: 0 };
  assert.equal(buy(broke, rest[0].id).reason, "too-poor");
  assert.equal(buy(broke, rest[0].id).run, broke);
  // Perks last one level only.
  run = finishLevel(leaveShop(run), { earned: 900, passed: true });
  assert.deepEqual(run.perks, {});
  assert.equal(buy(leaveShop(run), rest[0].id).reason, "closed");
});

test("perks turn into level modifiers", () => {
  assert.deepEqual(modsFromPerks({}), { strength: 1, extendMul: 1, reveal: false, luck: false, bonusTime: 0, cuts: 0 });
  assert.deepEqual(modsFromPerks({ tea: true, rope: true, lamp: true, charm: true, hourglass: true, scissors: true }), {
    strength: 1.6, extendMul: 1.4, reveal: true, luck: true, bonusTime: 15, cuts: 2,
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { FIELD, HOOK, angleTo, distanceTo, inCone } from "../src/core/hook.js";
import { HIVE_PENALTY, ITEMS, valueOf } from "../src/core/items.js";
import { createLevelState, generateLevel, step, totalValue } from "../src/core/level.js";
import { LEVELS_PER_REGION, REGIONS } from "../src/core/regions.js";

const SEEDS = [1, 2, 3, 42, 2077, 123456789];
const ALL = REGIONS.flatMap((r) => Array.from({ length: LEVELS_PER_REGION }, (_, i) => [r, i]));

test("the same seed always builds the same level; another seed builds another", () => {
  for (const [r, i] of ALL) {
    assert.deepEqual(generateLevel(r.id, i, 7), generateLevel(r.id, i, 7));
    assert.notDeepEqual(generateLevel(r.id, i, 7).items, generateLevel(r.id, i, 8).items);
  }
});

test("every item sits inside the field, below ground, in the swing cone, without overlap", () => {
  for (const [r, i] of ALL) {
    for (const seed of SEEDS) {
      const { items } = generateLevel(r.id, i, seed);
      for (const it of items) {
        const where = `${r.id}#${i} seed ${seed} ${it.type}`;
        assert.ok(inCone(it.x, it.y), `${where} outside the cone`);
        assert.ok(it.y - it.radius > FIELD.ground, `${where} pokes above ground`);
        assert.ok(it.x - (it.range ?? 0) - it.radius >= 0 && it.x + (it.range ?? 0) + it.radius <= FIELD.width, `${where} leaves the field`);
        assert.ok(it.y + it.radius <= FIELD.height, `${where} below the field`);
      }
      for (let a = 0; a < items.length; a++) {
        for (let b = a + 1; b < items.length; b++) {
          const [p, q] = [items[a], items[b]];
          if (p.range || q.range) continue; // lanes are checked by the generator
          assert.ok(Math.hypot(p.x - q.x, p.y - q.y) >= p.radius + q.radius, `${r.id}#${i} seed ${seed}: ${p.type} overlaps ${q.type}`);
        }
      }
      assert.deepEqual(items.map((it) => it.uid), items.map((_, k) => k + 1), "uids are 1..n");
    }
  }
});

test("levels get harder: targets rise within a region and from region to region", () => {
  for (const r of REGIONS) {
    const t = [0, 1, 2].map((i) => generateLevel(r.id, i, 1).target);
    assert.ok(t[0] < t[1] && t[1] < t[2], `${r.id} targets ${t}`);
  }
  const firsts = REGIONS.map((r) => generateLevel(r.id, 0, 1).target);
  for (let k = 1; k < firsts.length; k++) assert.ok(firsts[k] > firsts[k - 1]);
});

test("every level holds well over twice its target in collectible money", () => {
  for (const [r, i] of ALL) {
    for (const seed of SEEDS) {
      const level = generateLevel(r.id, i, seed);
      assert.ok(totalValue(level) >= level.target * 2.2, `${r.id}#${i} seed ${seed}: ${totalValue(level)} < 2.2 × ${level.target}`);
    }
  }
});

test("regions keep their character: crabs in Hạ Long, roots in Sa Pa, no obstacles in Bồng Miêu", () => {
  const types = (id) => new Set(generateLevel(id, 2, 5).items.map((it) => it.type));
  assert.ok(types("halong").has("crab"));
  assert.ok(types("sapa").has("root") && types("sapa").has("ruby"));
  assert.ok(types("taynguyen").has("hive"));
  assert.ok(!types("bongmieu").has("root") && !types("bongmieu").has("hive"));
});

test("bad region or level index throws", () => {
  assert.throws(() => generateLevel("atlantis", 0, 1));
  assert.throws(() => generateLevel("bongmieu", 3, 1));
  assert.throws(() => generateLevel("bongmieu", -1, 1));
});

// A hand-built level makes the simulation easy to reason about.
function lab(items, extra = {}) {
  return { regionId: "bongmieu", index: 0, seed: 0, target: 100, timeLimit: 60, items: items.map((it, k) => ({ uid: k + 1, radius: ITEMS[it.type].radius, ...it })), ...extra };
}

function runUntil(s, done, input = {}) {
  const events = [];
  for (let k = 0; k < 60 * 60 && !done(s, events); k++) events.push(...step(s, 1 / 60, typeof input === "function" ? input(s) : input));
  return events;
}

test("fire straight down, grab a nugget, reel it home and get paid", () => {
  const s = createLevelState(lab([{ type: "gold-m", x: 400, y: 400 }]));
  step(s, 1 / 60, { fire: true });
  assert.equal(s.mode, "extend");
  assert.equal(s.angle, 0, "fires along the angle on screen");
  const events = runUntil(s, (st) => st.mode === "swing" && st.earned > 0);
  assert.deepEqual(events.map((e) => e.type).filter((t) => t !== "end"), ["grab", "collect"]);
  assert.equal(s.earned, 150);
  assert.equal(s.items[0].gone, true);
  assert.equal(s.done, true, "nothing left to dig, so the level ends");
  assert.equal(s.passed, true);
});

test("a heavy boulder comes back slower than a light gem at the same depth", () => {
  const timeFor = (type) => {
    const s = createLevelState(lab([{ type, x: 400, y: 450 }, { type: "gold-s", x: 60, y: 560 }]));
    step(s, 1 / 60, { fire: true });
    runUntil(s, (st) => st.earned > 0);
    return s.t;
  };
  assert.ok(timeFor("rock-l") > 2 * timeFor("jade"));
});

test("a miss reels back empty; roots bounce the hook; wasps cost time", () => {
  let s = createLevelState(lab([{ type: "gold-s", x: 100, y: 560 }]));
  step(s, 1 / 60, { fire: true });
  let events = runUntil(s, (st) => st.mode === "swing");
  assert.ok(events.some((e) => e.type === "miss"));
  assert.equal(s.earned, 0);

  s = createLevelState(lab([{ type: "root", x: 400, y: 300 }, { type: "gold-xl", x: 400, y: 450 }]));
  step(s, 1 / 60, { fire: true });
  events = runUntil(s, (st) => st.mode === "swing");
  assert.equal(events.find((e) => e.type === "bounce")?.item.type, "root");
  assert.ok(!s.items[0].gone && !s.items[1].gone, "the root stays, the gold behind it is safe");

  s = createLevelState(lab([{ type: "hive", x: 400, y: 300 }, { type: "gold-s", x: 60, y: 560 }]));
  const before = s.timeLeft;
  step(s, 1 / 60, { fire: true });
  events = runUntil(s, (st) => st.mode === "swing");
  assert.equal(events.find((e) => e.type === "sting")?.penalty, HIVE_PENALTY);
  assert.ok(s.items[0].gone);
  assert.ok(before - s.timeLeft > HIVE_PENALTY);
});

test("crabs walk their lane, and pay for the pearl they carry", () => {
  const crab = { type: "crab", x: 400, x0: 400, y: 400, range: 80, speed: 1, phase: 0, carries: true };
  const s = createLevelState(lab([crab, { type: "gold-s", x: 60, y: 560 }]));
  const xs = [];
  for (let k = 0; k < 400; k++) {
    step(s, 1 / 60);
    xs.push(s.items[0].x);
  }
  assert.ok(Math.max(...xs) <= 480 + 1e-9 && Math.min(...xs) >= 320 - 1e-9);
  assert.ok(Math.max(...xs) - Math.min(...xs) > 150, "it really walks");
  assert.equal(valueOf(crab), 560);
  assert.equal(valueOf({ ...crab, carries: false }), 60);
});

test("jars: money (doubled by the charm), extra time, or ginger strength", () => {
  const jar = (contents) => ({ type: "jar", x: 400, y: 300, contents });
  assert.equal(valueOf(jar({ kind: "money", value: 200 })), 200);
  assert.equal(valueOf(jar({ kind: "money", value: 200 }), { luck: true }), 400);
  assert.equal(valueOf(jar({ kind: "time", value: 8 }), { luck: true }), 0);

  const s = createLevelState(lab([jar({ kind: "time", value: 8 }), { type: "gold-s", x: 60, y: 560 }]));
  step(s, 1 / 60, { fire: true });
  const ev = runUntil(s, (st, e) => e.some((x) => x.type === "collect"));
  assert.ok(ev.some((e) => e.type === "collect"));
  assert.ok(s.timeLeft > 60 - s.t + 7.9, "eight seconds were added");

  const t = createLevelState(lab([jar({ kind: "strength", value: 1.3 }), { type: "gold-s", x: 60, y: 560 }]));
  step(t, 1 / 60, { fire: true });
  runUntil(t, (st, e) => e.some((x) => x.type === "collect"));
  assert.equal(t.strength, 1.3);
});

test("scissors cut a worthless rock loose and the hook returns at empty speed", () => {
  const s = createLevelState(lab([{ type: "rock-l", x: 400, y: 450 }, { type: "gold-s", x: 60, y: 560 }]), { cuts: 1 });
  step(s, 1 / 60, { fire: true });
  runUntil(s, (st) => st.grabbed);
  const ev = step(s, 1 / 60, { cut: true });
  assert.equal(ev[0].type, "cut");
  assert.equal(s.cuts, 0);
  assert.equal(s.items[0].gone, true);
  runUntil(s, (st) => st.mode === "swing");
  assert.equal(s.earned, 0);
  // No cuts left: the next cut does nothing.
  const s2 = createLevelState(lab([{ type: "rock-l", x: 400, y: 450 }, { type: "gold-s", x: 60, y: 560 }]));
  step(s2, 1 / 60, { fire: true });
  runUntil(s2, (st) => st.grabbed);
  assert.deepEqual(step(s2, 1 / 60, { cut: true }).filter((e) => e.type === "cut"), []);
});

test("the clock ends the level, pass or fail, and a finished level ignores input", () => {
  const s = createLevelState(lab([{ type: "gold-s", x: 60, y: 560 }], { target: 500, timeLimit: 2 }));
  const ev = runUntil(s, (st) => st.done);
  assert.deepEqual(ev.at(-1), { type: "end", passed: false, earned: 0 });
  assert.equal(s.timeLeft, 0);
  assert.deepEqual(step(s, 1 / 60, { fire: true }), []);
  const bonus = createLevelState(lab([{ type: "gold-s", x: 60, y: 560 }], { timeLimit: 2 }), { bonusTime: 15 });
  assert.equal(bonus.timeLeft, 17);
});

test("a huge frame is clamped so the hook never jumps across the field", () => {
  const s = createLevelState(lab([{ type: "gold-s", x: 400, y: 560 }]));
  step(s, 1 / 60, { fire: true });
  step(s, 5);
  assert.ok(s.length <= HOOK.restLength + HOOK.extendSpeed * 0.1 + 1e-9);
});

test("the level state is a copy: playing never changes the generated level", () => {
  const level = generateLevel("halong", 1, 9);
  const frozen = JSON.stringify(level);
  const s = createLevelState(level);
  for (let k = 0; k < 600; k++) step(s, 1 / 60, { fire: k % 90 === 0 });
  assert.equal(JSON.stringify(level), frozen);
  assert.ok(angleTo(400, 500) === 0 && distanceTo(400, 500) === 400);
});

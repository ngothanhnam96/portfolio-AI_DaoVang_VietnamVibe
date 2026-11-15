// Level generation (seeded) and the per-frame simulation. `step` mutates the
// level state in place, since it runs 60 times a second; everything it does
// depends only on the state, dt and the input, so tests can replay it exactly.

import { FIELD, HOOK, firstHit, inCone, outOfField, reelSpeed, swingAngle, tipOf } from "./hook.js";
import { HIVE_PENALTY, ITEMS, isCollectible, kindOf, valueOf, weightOf } from "./items.js";
import { LEVELS_PER_REGION, regionById } from "./regions.js";
import { createRng, hashSeed } from "./rng.js";

export const LEVEL_TIME = 60;
const GAP = 8;

export function targetFor(region, index) {
  return 650 + 200 * region.difficulty + 175 * index;
}

export function countsFor(region, index) {
  const counts = { ...region.mix };
  for (const [type, n] of Object.entries(region.grow)) counts[type] = (counts[type] ?? 0) + n * index;
  return counts;
}

function jarContents(rng) {
  const roll = rng.next();
  if (roll < 0.55) return { kind: "money", value: rng.int(8, 40) * 10 };
  if (roll < 0.8) return { kind: "time", value: 8 };
  return { kind: "strength", value: 1.3 };
}

function fits(candidate, placed) {
  const { x, y, radius, range = 0 } = candidate;
  for (const other of placed) {
    const reach = radius + other.radius + GAP;
    if (range || other.range) {
      // A creature sweeps its whole lane: keep everything else out of it.
      const dy = Math.abs(y - other.y);
      const lo = Math.max(x - range, other.x - (other.range ?? 0));
      const hi = Math.min(x + range, other.x + (other.range ?? 0));
      if (dy < reach && lo - reach < hi) return false;
    } else if (Math.hypot(x - other.x, y - other.y) < reach) return false;
  }
  return true;
}

function place(type, rng, placed) {
  const def = ITEMS[type];
  const [minY, maxY] = def.depth;
  for (let attempt = 0; attempt < 400; attempt++) {
    const item = { type, radius: def.radius, x: Math.round(rng.range(def.radius + 12, FIELD.width - def.radius - 12)), y: Math.round(rng.range(minY, maxY)) };
    if (def.kind === "creature") {
      item.range = rng.int(50, 110);
      item.speed = Number(rng.range(0.6, 1.1).toFixed(2));
      item.phase = Number(rng.range(0, Math.PI * 2).toFixed(2));
      item.carries = rng.next() < 0.75;
      item.x0 = item.x;
      if (item.x - item.range < def.radius || item.x + item.range > FIELD.width - def.radius) continue;
      if (!inCone(item.x - item.range, item.y) || !inCone(item.x + item.range, item.y)) continue;
    }
    if (!inCone(item.x, item.y) || !fits(item, placed)) continue;
    if (def.kind === "jar") item.contents = jarContents(rng);
    return item;
  }
  return null;
}

/** Collectible money in a level, counting jars by what they really hold. */
export function totalValue(level) {
  return level.items.reduce((sum, item) => sum + (isCollectible(item) ? valueOf(item) : 0), 0);
}

export function generateLevel(regionId, index, seed) {
  const region = regionById(regionId);
  if (!Number.isInteger(index) || index < 0 || index >= LEVELS_PER_REGION) throw new Error(`Bad level index: ${index}`);
  const rng = createRng(hashSeed(regionId, index, seed));
  const counts = countsFor(region, index);
  // Biggest first, so the large nuggets always find room.
  const queue = Object.entries(counts)
    .flatMap(([type, n]) => Array.from({ length: n }, () => type))
    .sort((a, b) => ITEMS[b].radius - ITEMS[a].radius || a.localeCompare(b));
  const items = [];
  for (const type of queue) {
    const item = place(type, rng, items);
    if (item) items.push(item);
  }
  const level = { regionId, index, seed, target: targetFor(region, index), timeLimit: LEVEL_TIME, items };
  // Never leave a level short: top up with medium nuggets until the field holds
  // well over twice the target.
  for (let guard = 0; totalValue(level) < level.target * 2.2 && guard < 30; guard++) {
    const extra = place("gold-m", rng, items);
    if (extra) items.push(extra);
  }
  items.forEach((item, i) => (item.uid = i + 1));
  return level;
}

/** Power-ups from the shop become modifiers here (see shop.js `modsFromPerks`). */
export function createLevelState(level, mods = {}) {
  const m = { strength: 1, extendMul: 1, reveal: false, luck: false, bonusTime: 0, cuts: 0, ...mods };
  return {
    level,
    target: level.target,
    items: level.items.map((item) => ({ ...item, contents: item.contents ? { ...item.contents } : undefined, gone: false, grabbed: false })),
    t: 0,
    timeLeft: level.timeLimit + m.bonusTime,
    phase: 0,
    angle: 0,
    mode: "swing",
    length: HOOK.restLength,
    grabbed: null,
    earned: 0,
    strength: m.strength,
    extendMul: m.extendMul,
    reveal: m.reveal,
    luck: m.luck,
    cuts: m.cuts,
    shots: 0,
    collected: [],
    done: false,
    passed: false,
  };
}

export const tipOfState = (s) => tipOf(s.angle, s.length);
export const remaining = (s) => s.items.filter((item) => !item.gone && isCollectible(item));

function hang(s) {
  const tip = tipOfState(s);
  const drop = s.grabbed.radius * 0.7;
  s.grabbed.x = tip.x + drop * Math.sin(s.angle);
  s.grabbed.y = tip.y + drop * Math.cos(s.angle);
}

function contact(s, item, events) {
  const kind = kindOf(item);
  s.mode = "reel";
  if (item.type === "root") {
    events.push({ type: "bounce", item });
  } else if (item.type === "hive") {
    item.gone = true;
    s.timeLeft -= HIVE_PENALTY;
    events.push({ type: "sting", item, penalty: HIVE_PENALTY });
  } else {
    item.grabbed = true;
    s.grabbed = item;
    hang(s);
    events.push({ type: "grab", item, kind });
  }
}

function collect(s, events) {
  const item = s.grabbed;
  const value = valueOf(item, s);
  item.gone = true;
  item.grabbed = false;
  s.grabbed = null;
  s.earned += value;
  s.collected.push({ type: item.type, value });
  if (item.contents?.kind === "time") s.timeLeft += item.contents.value;
  if (item.contents?.kind === "strength") s.strength *= item.contents.value;
  events.push({ type: "collect", item, value, contents: item.contents });
}

function finish(s, events) {
  s.done = true;
  s.passed = s.earned >= s.target;
  events.push({ type: "end", passed: s.passed, earned: s.earned });
}

/** Advance the level by dt seconds. Input: { fire, cut }. Returns the events that happened. */
export function step(s, dt, input = {}) {
  const events = [];
  if (s.done) return events;
  dt = Math.min(Math.max(dt, 0), 0.1);
  s.t += dt;

  for (const item of s.items) {
    if (item.range && !item.gone && !item.grabbed) {
      item.x = item.x0 + item.range * Math.sin(item.speed * s.t + item.phase);
    }
  }

  if (s.mode === "swing") {
    // Fire along the angle the player is looking at, before this frame's swing.
    if (input.fire) {
      s.mode = "extend";
      s.shots += 1;
      events.push({ type: "fire" });
    } else {
      s.phase += HOOK.omega * dt;
      s.angle = swingAngle(s.phase);
    }
  } else if (s.mode === "extend") {
    const to = s.length + HOOK.extendSpeed * s.extendMul * dt;
    const hit = firstHit(s.angle, s.items, s.length, to);
    if (hit) {
      s.length = hit.length;
      contact(s, hit.item, events);
    } else {
      s.length = to;
      if (outOfField(tipOfState(s))) {
        s.mode = "reel";
        events.push({ type: "miss" });
      }
    }
  } else if (s.mode === "reel") {
    if (input.cut && s.grabbed && s.cuts > 0) {
      s.cuts -= 1;
      const item = s.grabbed;
      item.gone = true;
      item.grabbed = false;
      s.grabbed = null;
      events.push({ type: "cut", item });
    }
    s.length -= reelSpeed(s.grabbed ? weightOf(s.grabbed) : 0, s.strength) * dt;
    if (s.length <= HOOK.restLength) {
      s.length = HOOK.restLength;
      if (s.grabbed) collect(s, events);
      s.mode = "swing";
    } else if (s.grabbed) {
      hang(s);
    }
  }

  s.timeLeft -= dt;
  if (s.timeLeft <= 0) {
    s.timeLeft = 0;
    finish(s, events);
  } else if (s.mode === "swing" && remaining(s).length === 0) {
    finish(s, events);
  }
  return events;
}

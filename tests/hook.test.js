import test from "node:test";
import assert from "node:assert/strict";
import { FIELD, HOOK, angleTo, firstHit, inCone, outOfField, reelSpeed, reelTime, swingAngle, tipOf, touches } from "../src/core/hook.js";
import { ITEMS } from "../src/core/items.js";

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test("the hook swings like a pendulum between ±70°", () => {
  close(swingAngle(0), 0);
  close(swingAngle(Math.PI / 2), HOOK.amplitude);
  close(swingAngle(-Math.PI / 2), -HOOK.amplitude);
  for (let p = 0; p < 20; p += 0.37) assert.ok(Math.abs(swingAngle(p)) <= HOOK.amplitude + 1e-12);
});

test("the tip hangs straight down at angle 0 and swings right for positive angles", () => {
  assert.deepEqual(tipOf(0, 200), { x: FIELD.anchorX, y: FIELD.anchorY + 200 });
  const right = tipOf(Math.PI / 6, 200);
  close(right.x, FIELD.anchorX + 100);
  assert.ok(right.y > FIELD.anchorY);
  close(angleTo(right.x, right.y), Math.PI / 6);
  assert.ok(tipOf(-0.5, 100).x < FIELD.anchorX);
});

test("touch is a circle test against the item radius plus the hook tip", () => {
  const item = { x: 300, y: 300, radius: 20 };
  assert.ok(touches({ x: 300 + 20 + HOOK.tipRadius, y: 300 }, item));
  assert.ok(!touches({ x: 300 + 20 + HOOK.tipRadius + 0.5, y: 300 }, item));
  assert.ok(touches({ x: 300, y: 300 }, item));
});

test("the field ends at the sides and the bottom, not the top", () => {
  assert.ok(outOfField({ x: -1, y: 300 }));
  assert.ok(outOfField({ x: FIELD.width + 1, y: 300 }));
  assert.ok(outOfField({ x: 400, y: FIELD.height + 1 }));
  assert.ok(!outOfField({ x: 400, y: 599 }));
});

test("the swing cone excludes the far top corners and the sky", () => {
  assert.ok(inCone(400, 500));
  assert.ok(!inCone(20, 190), "top-left corner is beyond 70°");
  assert.ok(!inCone(400, 120), "above the ground line");
});

test("firstHit finds the nearest item along the ray and never tunnels through a small gem", () => {
  const near = { x: 400, y: 260, radius: 10 };
  const far = { x: 400, y: 450, radius: 30 };
  assert.equal(firstHit(0, [far, near], HOOK.restLength).item, near);
  // A ruby (radius 9) placed between march steps is still caught.
  const ruby = { x: 400, y: FIELD.anchorY + 301, radius: ITEMS.ruby.radius };
  assert.equal(firstHit(0, [ruby], HOOK.restLength)?.item, ruby);
  // Gone and grabbed items are ignored; a clear ray returns null.
  assert.equal(firstHit(0, [{ ...near, gone: true }, { ...far, grabbed: true }], HOOK.restLength), null);
  assert.equal(firstHit(1.1, [near, far], HOOK.restLength), null);
  // `to` caps the march.
  assert.equal(firstHit(0, [far], HOOK.restLength, 200), null);
});

test("reel speed falls with weight and rises with strength", () => {
  assert.equal(reelSpeed(0), HOOK.reelBase);
  const order = ["jade", "gold-s", "jar", "gold-m", "rock-s", "gold-l", "gold-xl", "rock-l"];
  const speeds = order.map((t) => reelSpeed(ITEMS[t].weight));
  for (let i = 1; i < speeds.length; i++) assert.ok(speeds[i] <= speeds[i - 1], `${order[i]} is not slower than ${order[i - 1]}`);
  assert.ok(reelSpeed(30, 1.6) > reelSpeed(30, 1));
  assert.equal(reelSpeed(-5), HOOK.reelBase, "negative weight is treated as empty");
});

test("reel times by weight: a gold boulder takes about four times a gem's trip", () => {
  const d = 400;
  const gem = reelTime(d, ITEMS.jade.weight);
  const boulder = reelTime(d, ITEMS["gold-xl"].weight);
  close(gem, (d - HOOK.restLength) / (HOOK.reelBase / 1.1), 1e-9);
  close(boulder, (d - HOOK.restLength) / (HOOK.reelBase / 4), 1e-9);
  assert.ok(boulder / gem > 3.5 && boulder / gem < 4);
  assert.equal(reelTime(HOOK.restLength, 30), 0);
});

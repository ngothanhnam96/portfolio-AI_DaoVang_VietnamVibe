// A simple bot that plays with the same inputs a player has. The tests use it
// to prove every level can be passed without power-ups; `?demo` in the URL lets
// it play on screen.

import { HOOK, angleTo, distanceTo, firstHit, reelSpeed } from "./hook.js";
import { kindOf, valueOf, weightOf } from "./items.js";
import { createLevelState, remaining, step } from "./level.js";

const JAR_GUESS = 120;
const PERIOD = (2 * Math.PI) / HOOK.omega;

function scoreOf(s, item, length) {
  const value = kindOf(item) === "jar" && !s.reveal ? JAR_GUESS : valueOf(item, s);
  const seconds = 0.6 + length / (HOOK.extendSpeed * s.extendMul) + length / reelSpeed(weightOf(item), s.strength);
  return value / seconds;
}

function bestReachable(s) {
  let best = 0;
  for (const item of remaining(s)) {
    const hit = firstHit(angleTo(item.x, item.y), s.items, HOOK.restLength);
    if (hit?.item === item) best = Math.max(best, scoreOf(s, item, distanceTo(item.x, item.y)));
  }
  return best;
}

export function createBot() {
  let best = null;
  let waited = 0;
  return function decide(s, dt = 1 / 60) {
    if (s.mode === "reel") return { cut: Boolean(s.grabbed && s.cuts > 0 && kindOf(s.grabbed) === "rock") };
    if (s.mode !== "swing") return {};
    if (best === null) {
      best = bestReachable(s);
      waited = 0;
    }
    waited += dt;
    const hit = firstHit(s.angle, s.items, HOOK.restLength);
    if (!hit || kindOf(hit.item) === "obstacle") return {};
    const patience = waited / PERIOD;
    const need = patience > 3 ? 0 : patience > 1.5 ? best * 0.4 : best * 0.75;
    if (scoreOf(s, hit.item, hit.length) < need) return {};
    best = null;
    return { fire: true };
  };
}

/** Play a whole level with the bot at a fixed frame rate; returns the final state. */
export function playLevel(level, { mods = {}, dt = 1 / 60 } = {}) {
  const s = createLevelState(level, mods);
  const decide = createBot();
  for (let frames = 0; !s.done && frames < 1e6; frames++) step(s, dt, decide(s, dt));
  return s;
}

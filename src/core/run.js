// A run is one trip through a region: three levels with the shop in between.
// Runs are plain data and every function returns a new run.

import { generateLevel } from "./level.js";
import { LEVELS_PER_REGION, regionById } from "./regions.js";
import { hashSeed } from "./rng.js";
import { offerFor } from "./shop.js";

export function createRun(regionId, seed) {
  regionById(regionId);
  return { regionId, seed: seed >>> 0, levelIndex: 0, wallet: 0, score: 0, perks: {}, shop: null, status: "level", results: [] };
}

export function levelFor(run) {
  return generateLevel(run.regionId, run.levelIndex, hashSeed(run.seed, run.levelIndex));
}

export function finishLevel(run, { earned, passed }) {
  if (run.status !== "level") throw new Error(`Cannot finish a level while ${run.status}`);
  earned = Math.max(0, Math.round(earned));
  const results = [...run.results, { index: run.levelIndex, earned, passed }];
  const base = { ...run, results, wallet: run.wallet + earned, score: run.score + earned, perks: {} };
  if (!passed) return { ...base, status: "lost" };
  if (run.levelIndex >= LEVELS_PER_REGION - 1) return { ...base, status: "won" };
  const next = run.levelIndex + 1;
  return { ...base, levelIndex: next, status: "shop", shop: { offer: offerFor(run.seed, next), bought: [] } };
}

/** Buy one good. Returns { ok, run, reason }; the run is unchanged when it fails. */
export function buy(run, id) {
  if (run.status !== "shop") return { ok: false, run, reason: "closed" };
  const offer = run.shop.offer.find((o) => o.id === id);
  if (!offer) return { ok: false, run, reason: "not-offered" };
  if (run.shop.bought.includes(id)) return { ok: false, run, reason: "sold-out" };
  if (run.wallet < offer.price) return { ok: false, run, reason: "too-poor" };
  return {
    ok: true,
    reason: null,
    run: {
      ...run,
      wallet: run.wallet - offer.price,
      perks: { ...run.perks, [id]: true },
      shop: { ...run.shop, bought: [...run.shop.bought, id] },
    },
  };
}

export function leaveShop(run) {
  if (run.status !== "shop") throw new Error(`Not in the shop (${run.status})`);
  return { ...run, status: "level", shop: null };
}

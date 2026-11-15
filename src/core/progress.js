// Saved progress: best score per region, how far each region got, and which
// regions are open. A region opens once the one before it is cleared.

import { LEVELS_PER_REGION, REGION_IDS } from "./regions.js";

export const newProgress = () => ({ regions: {}, runs: 0 });

const blank = () => ({ best: 0, cleared: false, furthest: 0 });

export function recordOf(progress, regionId) {
  return progress.regions[regionId] ?? blank();
}

/** Record a finished run (won or lost). Returns { progress, newBest }. */
export function recordRun(progress, run) {
  if (run.status !== "won" && run.status !== "lost") throw new Error("Only finished runs are recorded");
  const old = recordOf(progress, run.regionId);
  const passedLevels = run.results.filter((r) => r.passed).length;
  const next = {
    best: Math.max(old.best, run.score),
    cleared: old.cleared || run.status === "won",
    furthest: Math.max(old.furthest, passedLevels),
  };
  return {
    progress: { ...progress, runs: progress.runs + 1, regions: { ...progress.regions, [run.regionId]: next } },
    newBest: run.score > old.best,
  };
}

export function isUnlocked(progress, regionId, ids = REGION_IDS) {
  const i = ids.indexOf(regionId);
  if (i < 0) return false;
  return i === 0 || recordOf(progress, ids[i - 1]).cleared;
}

export const totalBest = (progress) => Object.values(progress.regions).reduce((sum, r) => sum + r.best, 0);

/** Clean whatever came out of storage; unknown regions and bad numbers are dropped. */
export function restoreProgress(raw, ids = REGION_IDS) {
  const p = newProgress();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return p;
  const regions = raw.regions && typeof raw.regions === "object" && !Array.isArray(raw.regions) ? raw.regions : {};
  for (const id of ids) {
    const r = regions[id];
    if (!r || typeof r !== "object") continue;
    const best = Math.floor(Number(r.best));
    const furthest = Math.floor(Number(r.furthest));
    p.regions[id] = {
      best: Number.isFinite(best) && best > 0 ? best : 0,
      cleared: r.cleared === true,
      furthest: Number.isFinite(furthest) ? Math.min(LEVELS_PER_REGION, Math.max(0, furthest)) : 0,
    };
  }
  const runs = Math.floor(Number(raw.runs));
  p.runs = Number.isFinite(runs) && runs > 0 ? runs : 0;
  return p;
}

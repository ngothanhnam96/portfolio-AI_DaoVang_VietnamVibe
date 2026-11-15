// Everything the hook can touch. `weight` slows the reel (see hook.js), `depth`
// is the band of the field (y, in field units) where the generator may put it.

export const ITEMS = Object.freeze({
  "gold-s": { name: "Vàng cám", kind: "gold", value: 50, weight: 2, radius: 11, depth: [195, 560] },
  "gold-m": { name: "Vàng cục", kind: "gold", value: 150, weight: 6, radius: 19, depth: [220, 560] },
  "gold-l": { name: "Vàng khối", kind: "gold", value: 320, weight: 15, radius: 29, depth: [300, 555] },
  "gold-xl": { name: "Vàng tảng", kind: "gold", value: 650, weight: 30, radius: 41, depth: [380, 550] },
  jade: { name: "Ngọc bích", kind: "gem", value: 450, weight: 1, radius: 10, depth: [330, 570] },
  ruby: { name: "Hồng ngọc", kind: "gem", value: 700, weight: 1, radius: 9, depth: [430, 575] },
  "rock-s": { name: "Đá cuội", kind: "rock", value: 15, weight: 11, radius: 17, depth: [200, 560] },
  "rock-l": { name: "Đá tảng", kind: "rock", value: 35, weight: 32, radius: 33, depth: [260, 555] },
  jar: { name: "Hũ sành", kind: "jar", value: 0, weight: 5, radius: 16, depth: [240, 560] },
  crab: { name: "Cua đá", kind: "creature", value: 60, weight: 3, radius: 15, depth: [260, 560] },
  root: { name: "Rễ cây", kind: "obstacle", value: 0, weight: 0, radius: 22, depth: [210, 470] },
  hive: { name: "Tổ ong đất", kind: "obstacle", value: 0, weight: 0, radius: 16, depth: [220, 520] },
});

/** The pearl a crab carries on its back. */
export const PEARL = Object.freeze({ name: "Ngọc trai", value: 500 });

/** Seconds lost when the hook pokes a ground-wasp nest. */
export const HIVE_PENALTY = 5;

export const kindOf = (item) => ITEMS[item.type].kind;
export const isObstacle = (item) => kindOf(item) === "obstacle";
export const isCollectible = (item) => !isObstacle(item);
export const weightOf = (item) => ITEMS[item.type].weight;

/** Money an item pays when it reaches the winch. Jars pay only if they hold money. */
export function valueOf(item, { luck = false } = {}) {
  const def = ITEMS[item.type];
  if (def.kind === "jar") return item.contents?.kind === "money" ? item.contents.value * (luck ? 2 : 1) : 0;
  if (def.kind === "creature") return def.value + (item.carries ? PEARL.value : 0);
  return def.value;
}

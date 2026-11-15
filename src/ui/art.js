// All artwork is SVG built from code: four region backdrops, every item, the
// bamboo winch with Mai, the hook and Bà Tư's shoulder-pole stall. Backdrops
// take an id prefix so several can sit in one page (home cards + the stage).
// Items use flat fills and no ids, so any number of them can be drawn.

import { FIELD } from "../core/hook.js";
import { ITEMS } from "../core/items.js";

const f = (n) => Number(n.toFixed(1));

function jitter(i, seed) {
  const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/** A smooth, lumpy closed shape of radius ~r, the same for the same seed. */
export function blobPath(r, seed = 1, points = 9, rough = 0.22) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 - rough + rough * jitter(i, seed));
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  const mid = (p, q) => `${f((p[0] + q[0]) / 2)} ${f((p[1] + q[1]) / 2)}`;
  let d = `M${mid(pts[points - 1], pts[0])}`;
  for (let i = 0; i < points; i++) {
    const p = pts[i];
    d += ` Q${f(p[0])} ${f(p[1])} ${mid(p, pts[(i + 1) % points])}`;
  }
  return `${d} Z`;
}

// ── Items ────────────────────────────────────────────────────────────────

function gold(r, seed) {
  const sparkle = r > 25
    ? `<path d="M${f(r * 0.35)} ${f(-r * 0.75)} l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#fffbe6" class="sparkle"/>`
    : "";
  return `<path d="${blobPath(r, seed)}" fill="#f2bf3a" stroke="#8f6210" stroke-width="2"/>`
    + `<path d="${blobPath(r * 0.58, seed + 3)}" fill="#ffdc6e" transform="translate(${f(-r * 0.15)} ${f(-r * 0.2)})"/>`
    + `<ellipse cx="${f(-r * 0.38)}" cy="${f(-r * 0.36)}" rx="${f(r * 0.2)}" ry="${f(r * 0.11)}" fill="#fff6d0" transform="rotate(-30)"/>`
    + sparkle;
}

function jade(r) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    return `${f(Math.cos(a) * r)},${f(Math.sin(a) * r)}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="#2fae74" stroke="#0f5a39" stroke-width="2"/>`
    + `<polygon points="0,${f(-r * 0.55)} ${f(r * 0.48)},0 0,${f(r * 0.55)} ${f(-r * 0.48)},0" fill="#7fe0b0" opacity=".75"/>`
    + `<circle cx="${f(-r * 0.3)}" cy="${f(-r * 0.35)}" r="${f(r * 0.16)}" fill="#e9fff4"/>`;
}

function ruby(r) {
  return `<path d="M0 ${f(-r)} L${f(r)} ${f(-r * 0.25)} L${f(r * 0.55)} ${f(r)} L${f(-r * 0.55)} ${f(r)} L${f(-r)} ${f(-r * 0.25)} Z" fill="#d82a55" stroke="#6d0a24" stroke-width="2"/>`
    + `<path d="M0 ${f(-r)} L${f(r * 0.35)} ${f(-r * 0.1)} L0 ${f(r)} L${f(-r * 0.35)} ${f(-r * 0.1)} Z" fill="#ff7095" opacity=".7"/>`
    + `<circle cx="${f(-r * 0.4)}" cy="${f(-r * 0.35)}" r="${f(r * 0.17)}" fill="#ffe3ea"/>`;
}

function rock(r, seed) {
  return `<path d="${blobPath(r, seed, 8, 0.28)}" fill="#8b857a" stroke="#4b463f" stroke-width="2"/>`
    + `<path d="${blobPath(r * 0.5, seed + 5, 7)}" fill="#a39d91" transform="translate(${f(-r * 0.2)} ${f(-r * 0.25)})"/>`
    + `<path d="M${f(r * 0.1)} ${f(-r * 0.2)} l${f(r * 0.2)} ${f(r * 0.25)} l${f(-r * 0.1)} ${f(r * 0.3)}" stroke="#4b463f" stroke-width="1.6" fill="none"/>`;
}

function jar(r, contents, reveal) {
  let tag = "?";
  if (reveal && contents) tag = contents.kind === "money" ? String(contents.value) : contents.kind === "time" ? "+8s" : "Trà";
  const size = tag.length > 2 ? f(r * 0.5) : f(r * 0.8);
  return `<path d="M${f(-r * 0.45)} ${f(-r * 0.95)} h${f(r * 0.9)} l${f(r * 0.12)} ${f(r * 0.28)} q${f(r * 0.6)} ${f(r * 0.25)} ${f(r * 0.48)} ${f(r * 0.9)} q-${f(r * 0.08)} ${f(r * 0.7)} -${f(r * 1.05)} ${f(r * 0.72)} q-${f(r * 0.97)} 0 -${f(r * 1.05)} -${f(r * 0.72)} q-${f(r * 0.12)} -${f(r * 0.65)} ${f(r * 0.48)} -${f(r * 0.9)} Z" fill="#b5602c" stroke="#5a2a0e" stroke-width="2"/>`
    + `<rect x="${f(-r * 0.55)}" y="${f(-r * 1.05)}" width="${f(r * 1.1)}" height="${f(r * 0.22)}" rx="2" fill="#7a3a14"/>`
    + `<path d="M${f(-r * 0.75)} ${f(r * 0.05)} q${f(r * 0.75)} ${f(r * 0.3)} ${f(r * 1.5)} 0" stroke="#e8a46a" stroke-width="2" fill="none"/>`
    + `<text class="jar-tag" y="${f(r * 0.45)}" font-size="${size}" text-anchor="middle" fill="#fff4dc" font-weight="700">${tag}</text>`;
}

function crab(r, carries) {
  const legs = [-1, 1].flatMap((side) => [0, 1, 2].map((k) => {
    const y = f(-r * 0.1 + k * r * 0.28);
    return `<path d="M${f(side * r * 0.7)} ${y} l${f(side * r * 0.45)} ${f(r * 0.15)} l${f(side * r * 0.12)} ${f(r * 0.35)}" stroke="#9b2f12" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  })).join("");
  const claws = [-1, 1].map((side) =>
    `<path d="M${f(side * r * 0.6)} ${f(-r * 0.35)} q${f(side * r * 0.3)} -${f(r * 0.55)} ${f(side * r * 0.6)} -${f(r * 0.55)}" stroke="#c4441c" stroke-width="3" fill="none"/>`
    + `<circle cx="${f(side * r * 1.2)}" cy="${f(-r * 0.95)}" r="${f(r * 0.3)}" fill="#e2602e" stroke="#9b2f12" stroke-width="1.5"/>`).join("");
  const pearl = carries
    ? `<circle cx="0" cy="${f(-r * 0.75)}" r="${f(r * 0.42)}" fill="#f6f1e6" stroke="#b9b0a0" stroke-width="1.5"/><circle cx="${f(-r * 0.15)}" cy="${f(-r * 0.9)}" r="${f(r * 0.12)}" fill="#ffffff"/>`
    : "";
  return legs + claws
    + `<ellipse rx="${f(r * 0.85)}" ry="${f(r * 0.6)}" fill="#e2602e" stroke="#9b2f12" stroke-width="2"/>`
    + `<circle cx="${f(-r * 0.3)}" cy="${f(-r * 0.45)}" r="2.6" fill="#1b1410"/><circle cx="${f(r * 0.3)}" cy="${f(-r * 0.45)}" r="2.6" fill="#1b1410"/>`
    + pearl;
}

function root(r) {
  const arms = [0, 1, 2, 3, 4, 5].map((k) => {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    return `<path d="M0 0 Q${f(x * 0.4 + y * 0.3)} ${f(y * 0.4 - x * 0.3)} ${f(x)} ${f(y)}" stroke="#6e4a26" stroke-width="${k % 2 ? 4 : 6}" fill="none" stroke-linecap="round"/>`;
  }).join("");
  return arms + `<circle r="${f(r * 0.3)}" fill="#7d5530" stroke="#43290f" stroke-width="2"/>`;
}

function hive(r) {
  const wasp = (x, y) => `<g transform="translate(${x} ${y})"><ellipse rx="3.4" ry="2.2" fill="#f2c230"/><path d="M-1 -2.2 v4.4 M1.2 -2.2 v4.4" stroke="#1d1a14" stroke-width="1.1"/><ellipse cx="0" cy="-2.8" rx="2.2" ry="1.4" fill="#e6f2ff" opacity=".85"/></g>`;
  return `<ellipse cy="${f(r * 0.45)}" rx="${f(r)}" ry="${f(r * 0.5)}" fill="#7d6343"/>`
    + `<ellipse cy="${f(r * 0.05)}" rx="${f(r * 0.85)}" ry="${f(r * 0.45)}" fill="#957652"/>`
    + `<ellipse cy="${f(-r * 0.35)}" rx="${f(r * 0.6)}" ry="${f(r * 0.38)}" fill="#a98a63"/>`
    + `<ellipse cy="${f(r * 0.2)}" rx="${f(r * 0.22)}" ry="${f(r * 0.16)}" fill="#2a1d10"/>`
    + wasp(f(r * 0.9), f(-r * 0.7)) + wasp(f(-r * 0.95), f(-r * 0.3));
}

/** Markup for one item, centred on 0,0. */
export function itemSvg(item, { reveal = false } = {}) {
  const def = ITEMS[item.type];
  if (!def) throw new Error(`No art for ${item.type}`);
  const r = def.radius;
  const seed = item.uid ?? 1;
  let body;
  switch (item.type) {
    case "gold-s": case "gold-m": case "gold-l": case "gold-xl": body = gold(r, seed); break;
    case "jade": body = jade(r); break;
    case "ruby": body = ruby(r); break;
    case "rock-s": case "rock-l": body = rock(r, seed); break;
    case "jar": body = jar(r, item.contents, reveal); break;
    case "crab": body = crab(r, item.carries); break;
    case "root": body = root(r); break;
    case "hive": body = hive(r); break;
    default: throw new Error(`No art for ${item.type}`);
  }
  return `<g class="item item-${item.type}">${body}</g>`;
}

// ── Hook, winch and characters ──────────────────────────────────────────

export function hookSvg() {
  return `<g class="hook-art"><rect x="-5" y="-6" width="10" height="9" rx="2" fill="#c9a55a" stroke="#6e5420" stroke-width="1.5"/>`
    + `<path d="M0 2 L-10 13 Q-13 20 -6 22 M0 2 L10 13 Q13 20 6 22 M0 2 V18" stroke="#d6dbe0" stroke-width="3.4" fill="none" stroke-linecap="round"/>`
    + `<path d="M0 2 L-10 13 M0 2 L10 13" stroke="#8d949c" stroke-width="1.2" fill="none"/></g>`;
}

/** Mai, the young prospector in a nón lá, cranking a bamboo winch. `crank` is a group the UI rotates. */
export function rigSvg() {
  const { anchorX: x, anchorY: y, ground: g } = FIELD;
  const bamboo = (x1, y1, x2, y2) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#c9a55a" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#9d7c35" stroke-width="7" stroke-dasharray="2 16" stroke-linecap="butt"/>`;
  return `<g class="rig">`
    + bamboo(x - 30, g + 2, x - 6, y - 16) + bamboo(x + 30, g + 2, x + 6, y - 16)
    + `<path d="M${x - 14} ${y - 14} H${x + 14}" stroke="#9d7c35" stroke-width="5" stroke-linecap="round"/>`
    + `<g class="crank" transform="translate(${x} ${y - 6})"><circle r="12" fill="#7a5230" stroke="#3f2914" stroke-width="2"/>`
    + `<path d="M-12 0 H12 M0 -12 V12" stroke="#3f2914" stroke-width="2"/><circle r="4" fill="#c9a55a"/></g>`
    + `<circle cx="${x}" cy="${y - 6}" r="7" fill="none" stroke="#e8dcc0" stroke-width="3"/>`
    // Mai
    + `<g class="mai" transform="translate(${x + 62} ${g})">`
    + `<path d="M-7 0 V-24 M7 0 V-24" stroke="#33304a" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="M-12 -22 Q-13 -46 0 -48 Q13 -46 12 -22 Z" fill="#b5523b" stroke="#6c2a1c" stroke-width="1.5"/>`
    + `<path d="M-8 -42 Q-30 -44 -46 -54" stroke="#b5523b" stroke-width="6" fill="none" stroke-linecap="round"/>`
    + `<circle cx="-47" cy="-55" r="4" fill="#f1c79b"/>`
    + `<circle cx="0" cy="-56" r="8.5" fill="#f1c79b"/>`
    + `<path d="M5 -60 q10 4 6 18" stroke="#1d1712" stroke-width="4" fill="none" stroke-linecap="round"/>`
    + `<circle cx="-3" cy="-56" r="1.3" fill="#1d1712"/>`
    + `<path d="M-20 -58 L0 -80 L20 -58 Q0 -54 -20 -58 Z" fill="#ecd590" stroke="#a88d47" stroke-width="1.5"/>`
    + `<path d="M-10 -63 L0 -76 M10 -63 L0 -76" stroke="#c9ad62" stroke-width="1"/>`
    + `</g>`
    // basket for the day's finds
    + `<g transform="translate(${x - 74} ${g})"><path d="M-16 0 L-20 -22 H20 L16 0 Z" fill="#c7964f" stroke="#6e4a1e" stroke-width="1.5"/>`
    + `<path d="M-19 -15 H19 M-18 -8 H18" stroke="#8a5f28" stroke-width="1.5"/><circle cx="-6" cy="-24" r="5" fill="#f2bf3a"/><circle cx="5" cy="-25" r="4" fill="#f2bf3a"/></g>`
    + `</g>`;
}

/** Bà Tư with her shoulder pole: two baskets of goods. viewBox 0 0 220 150. */
export function shopkeeperSvg() {
  return `<svg viewBox="0 0 220 150" class="shopkeeper" aria-hidden="true">`
    + `<ellipse cx="110" cy="142" rx="95" ry="6" fill="#000" opacity=".18"/>`
    + `<path d="M20 64 Q110 48 200 64" stroke="#9d7c35" stroke-width="6" fill="none" stroke-linecap="round"/>`
    + [40, 180].map((cx) =>
      `<path d="M${cx - 18} 64 L${cx - 22} 108 M${cx + 18} 64 L${cx + 22} 108" stroke="#6e4a1e" stroke-width="1.6"/>`
      + `<path d="M${cx - 28} 108 H${cx + 28} L${cx + 22} 138 H${cx - 22} Z" fill="#c7964f" stroke="#6e4a1e" stroke-width="2"/>`
      + `<path d="M${cx - 26} 118 H${cx + 26} M${cx - 24} 128 H${cx + 24}" stroke="#8a5f28" stroke-width="1.5"/>`).join("")
    + `<circle cx="32" cy="102" r="7" fill="#e8dcc0"/><rect x="40" y="94" width="12" height="14" rx="3" fill="#7fb069"/><path d="M22 106 l8 -12 4 12 Z" fill="#d84a3a"/>`
    + `<path d="M170 100 h10 v8 h-10 Z" fill="#d7b46a"/><circle cx="190" cy="102" r="6" fill="#e07a3a"/><path d="M178 96 l6 -8 6 8" stroke="#6e4a1e" stroke-width="2" fill="none"/>`
    + `<path d="M100 140 V112 M120 140 V112" stroke="#33304a" stroke-width="8" stroke-linecap="round"/>`
    + `<path d="M94 114 Q92 74 110 70 Q128 74 126 114 Z" fill="#4a6f8f" stroke="#253a4d" stroke-width="1.5"/>`
    + `<path d="M96 80 Q88 70 70 63 M124 80 Q134 70 150 63" stroke="#4a6f8f" stroke-width="6" fill="none" stroke-linecap="round"/>`
    + `<circle cx="110" cy="56" r="10" fill="#e8bd92"/><path d="M104 60 q6 4 12 0" stroke="#8a5a3a" stroke-width="1.4" fill="none"/>`
    + `<circle cx="106" cy="54" r="1.3" fill="#1d1712"/><circle cx="114" cy="54" r="1.3" fill="#1d1712"/>`
    + `<path d="M86 50 L110 24 L134 50 Q110 46 86 50 Z" fill="#ecd590" stroke="#a88d47" stroke-width="1.5"/>`
    + `</svg>`;
}

// ── Region backdrops (800 × 600, ground at y = 150) ─────────────────────

function pebbles(seed, color, n = 26) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = f(10 + jitter(i, seed) * 780);
    const y = f(175 + jitter(i + 40, seed) * 415);
    out += `<ellipse cx="${x}" cy="${y}" rx="${f(2 + jitter(i + 80, seed) * 5)}" ry="${f(1.5 + jitter(i + 120, seed) * 3)}" fill="${color}"/>`;
  }
  return out;
}

function strata(color) {
  return [250, 360, 470].map((y, k) =>
    `<path d="M0 ${y} Q200 ${y - 18 + k * 9} 400 ${y + 6} T800 ${y - 4} V${y + 26} Q600 ${y + 34} 400 ${y + 22} T0 ${y + 28} Z" fill="${color}" opacity=".16"/>`).join("");
}

const BACKDROPS = {
  bongmieu: {
    sky: ["#f9c784", "#f08a5d"],
    earth: ["#8a5a34", "#3a2211"],
    surface: () =>
      `<path d="M0 120 Q120 70 240 110 T520 95 T800 112 V152 H0 Z" fill="#6d5233"/>`
      + `<path d="M0 135 Q180 110 360 132 T800 128 V152 H0 Z" fill="#5a4128"/>`
      + `<path d="M70 152 V108 Q105 82 140 108 V152 Z" fill="#1c120a"/><path d="M64 152 V104 H146 V152 M60 104 H150" stroke="#8c6a3c" stroke-width="7" fill="none"/>`
      + `<path d="M150 150 H300 M150 145 H300" stroke="#4a4038" stroke-width="2"/>`
      + `<circle cx="690" cy="58" r="22" fill="#ffe3a3" opacity=".9"/>`,
    under: () =>
      strata("#1e1008")
      + `<path d="M14 160 V600 M786 160 V600" stroke="#7b5a32" stroke-width="10"/><path d="M0 300 H40 M760 300 H800 M0 460 H40 M760 460 H800" stroke="#6b4c28" stroke-width="7"/>`
      + `<path d="M60 230 q40 -14 80 6 t90 -4 M520 410 q50 16 110 -6 t70 10 M240 520 q40 -10 90 4" stroke="#e8b84a" stroke-width="2.5" fill="none" opacity=".45"/>`
      + `<g transform="translate(46 200)"><path d="M0 -14 V-6" stroke="#2c1a0c" stroke-width="2"/><rect x="-6" y="-6" width="12" height="15" rx="3" fill="#ffcf6b" stroke="#6b4c28" stroke-width="2"/></g>`
      + pebbles(11, "#5c3a20"),
  },
  taynguyen: {
    sky: ["#8fd3f4", "#e9f7ff"],
    earth: ["#b5442a", "#561a0d"],
    surface: () =>
      `<path d="M0 118 Q160 86 320 112 T640 100 T800 116 V152 H0 Z" fill="#6f9e6a"/>`
      + `<path d="M90 152 V128 M150 152 V128" stroke="#4b3020" stroke-width="4"/><path d="M78 130 H162" stroke="#4b3020" stroke-width="5"/>`
      + `<path d="M120 28 Q100 80 70 130 H170 Q140 80 120 28 Z" fill="#6b4a2b" stroke="#3b2715" stroke-width="2"/><path d="M120 40 Q108 84 92 122 M120 40 Q132 84 148 122" stroke="#8c6a3c" stroke-width="1.5" fill="none"/>`
      + [560, 610, 660, 710, 760].map((x, k) => `<circle cx="${x}" cy="${136 - (k % 2) * 4}" r="16" fill="#3f7f3a"/><circle cx="${x - 5}" cy="${132}" r="2.6" fill="#d32f2f"/><circle cx="${x + 6}" cy="${138}" r="2.6" fill="#d32f2f"/>`).join("")
      + `<circle cx="690" cy="44" r="20" fill="#fff6c8"/>`,
    under: () =>
      strata("#2b0a04")
      + [90, 270, 450, 630].map((x, k) => `<ellipse cx="${x + (k % 2) * 40}" cy="${300 + (k % 3) * 90}" rx="36" ry="22" fill="#7c2a18" opacity=".45"/>`).join("")
      + pebbles(23, "#7a2414"),
  },
  halong: {
    sky: ["#bfe6e8", "#f3fbf8"],
    earth: ["#7fa3a0", "#22393b"],
    surface: () =>
      `<rect y="118" width="800" height="34" fill="#3a8fa0"/>`
      + `<path d="M0 128 H800 M0 140 H800" stroke="#9fd3dc" stroke-width="1.2" stroke-dasharray="18 26" opacity=".7"/>`
      + `<path d="M40 122 Q44 50 80 46 Q110 52 112 122 Z M170 122 Q172 76 200 72 Q226 80 224 122 Z" fill="#5f7f74"/>`
      + `<path d="M560 122 Q566 30 610 26 Q648 36 646 122 Z M680 122 Q684 66 712 62 Q740 70 742 122 Z M500 122 Q506 84 528 80 Q548 88 550 122 Z" fill="#78988a"/>`
      + `<g transform="translate(250 118)"><path d="M-40 0 Q0 14 46 0 L38 10 H-32 Z" fill="#6b3b1f"/>`
      + `<path d="M-24 -2 V-50 L-6 -46 V-4 Z M2 -2 V-62 L22 -56 V-4 Z" fill="#e07a3a" stroke="#8a3d15" stroke-width="1.5"/>`
      + `<path d="M-24 -38 H-6 M-24 -26 H-6 M2 -48 H22 M2 -34 H22 M2 -20 H22" stroke="#8a3d15" stroke-width="1"/></g>`,
    under: () =>
      strata("#0e1c1d")
      + Array.from({ length: 16 }, (_, i) => {
        const x = 20 + i * 50 + (i % 3) * 7;
        const h = 18 + ((i * 37) % 28);
        return `<path d="M${x - 9} 152 L${x} ${152 + h} L${x + 9} 152 Z" fill="#a9c7c0"/>`;
      }).join("")
      + `<path d="M0 588 Q200 578 400 588 T800 586 V600 H0 Z" fill="#3d8c9a" opacity=".7"/>`
      + pebbles(37, "#4f6f6c"),
  },
  sapa: {
    sky: ["#cdd7e2", "#f5efe2"],
    earth: ["#5b4630", "#1f170e"],
    surface: () =>
      `<path d="M0 90 L120 40 L230 82 L360 30 L500 86 L640 36 L800 80 V152 H0 Z" fill="#91a7ab" opacity=".85"/>`
      + `<path d="M0 108 L150 70 L300 104 L460 64 L620 102 L800 74 V152 H0 Z" fill="#6f8a87"/>`
      + ["#9cc56a", "#c7d97a", "#e3c45e", "#a9cf72"].map((c, k) =>
        `<path d="M0 ${112 + k * 10} Q200 ${100 + k * 10} 400 ${114 + k * 10} T800 ${108 + k * 10} V152 H0 Z" fill="${c}" stroke="#5f7d3a" stroke-width="1.2"/>`).join("")
      + `<path d="M0 60 Q200 48 400 62 T800 56" stroke="#fff" stroke-width="16" opacity=".35" fill="none"/>`,
    under: () =>
      strata("#0b0804")
      + [60, 210, 380, 560, 720].map((x, k) => `<path d="M${x} 152 q${10 - k * 4} 50 ${-6 + k * 3} 110 q-14 40 ${8 + k} 90" stroke="#a07a4e" stroke-width="3" fill="none" opacity=".35"/>`).join("")
      + pebbles(51, "#3a2c1c"),
  },
};

export const BACKDROP_IDS = Object.keys(BACKDROPS);

/** The full scene behind the field for one region, ids prefixed with `prefix`. */
export function backdropSvg(regionId, prefix = "st") {
  const art = BACKDROPS[regionId];
  if (!art) throw new Error(`No backdrop for ${regionId}`);
  const p = `${prefix}-${regionId}`;
  return `<g class="backdrop backdrop-${regionId}">`
    + `<defs><linearGradient id="${p}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${art.sky[1]}"/><stop offset="1" stop-color="${art.sky[0]}"/></linearGradient>`
    + `<linearGradient id="${p}-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${art.earth[0]}"/><stop offset="1" stop-color="${art.earth[1]}"/></linearGradient></defs>`
    + `<rect width="800" height="152" fill="url(#${p}-sky)"/>`
    + art.surface()
    + `<rect y="150" width="800" height="450" fill="url(#${p}-earth)"/>`
    + `<path d="M0 150 H800" stroke="#000" stroke-opacity=".35" stroke-width="3"/>`
    + art.under()
    + `</g>`;
}

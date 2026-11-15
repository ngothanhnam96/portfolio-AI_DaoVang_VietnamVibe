import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ITEMS } from "../src/core/items.js";
import { generateLevel } from "../src/core/level.js";
import { REGIONS } from "../src/core/regions.js";
import { BACKDROP_IDS, backdropSvg, blobPath, hookSvg, itemSvg, rigSvg, shopkeeperSvg } from "../src/ui/art.js";
import { assertWellFormed, idsIn } from "./support/svg.js";

test("every region has a well-formed backdrop with prefixed ids and working gradients", () => {
  assert.deepEqual(BACKDROP_IDS.sort(), REGIONS.map((r) => r.id).sort());
  for (const r of REGIONS) {
    for (const prefix of ["st", "card"]) {
      const svg = backdropSvg(r.id, prefix);
      assertWellFormed(svg, assert, `${r.id} backdrop`);
      const ids = idsIn(svg);
      assert.ok(ids.length >= 2);
      assert.equal(new Set(ids).size, ids.length, "ids are unique");
      for (const id of ids) assert.ok(id.startsWith(`${prefix}-${r.id}-`), `${id} is not prefixed`);
      for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(ref), `url(#${ref}) points nowhere`);
    }
  }
  assert.throws(() => backdropSvg("atlantis"));
});

test("the home page can hold every card backdrop and the stage without an id clash", () => {
  const page = REGIONS.map((r) => backdropSvg(r.id, "card")).join("") + backdropSvg("sapa", "st");
  const ids = idsIn(page);
  assert.equal(new Set(ids).size, ids.length);
});

test("every item type is drawn, well-formed and free of ids (so any number fit on a page)", () => {
  for (const type of Object.keys(ITEMS)) {
    for (const extra of [{}, { carries: true }, { contents: { kind: "money", value: 240 } }, { contents: { kind: "time", value: 8 } }]) {
      const svg = itemSvg({ type, uid: 3, ...extra }, { reveal: true });
      assertWellFormed(svg, assert, type);
      assert.deepEqual(idsIn(svg), [], `${type} has an id`);
      assert.ok(svg.startsWith(`<g class="item item-${type}">`));
    }
  }
  assert.throws(() => itemSvg({ type: "dragon" }));
});

test("jars hide what they hold unless the oil lamp is lit", () => {
  const jar = { type: "jar", uid: 1, contents: { kind: "money", value: 320 } };
  assert.match(itemSvg(jar), />\?<\/text>/);
  assert.match(itemSvg(jar, { reveal: true }), />320<\/text>/);
  assert.match(itemSvg({ ...jar, contents: { kind: "time", value: 8 } }, { reveal: true }), />\+8s<\/text>/);
});

test("crabs show their pearl only when they carry one", () => {
  assert.ok(itemSvg({ type: "crab", carries: true }).length > itemSvg({ type: "crab", carries: false }).length);
});

test("every item in real generated levels draws cleanly", () => {
  for (const r of REGIONS) {
    for (const it of generateLevel(r.id, 2, 77).items) assertWellFormed(itemSvg(it), assert, `${r.id} ${it.type}#${it.uid}`);
  }
});

test("the rig, hook and Bà Tư's stall are well-formed and id-free", () => {
  for (const [name, svg] of [["rig", rigSvg()], ["hook", hookSvg()], ["shop", shopkeeperSvg()]]) {
    assertWellFormed(svg, assert, name);
    assert.deepEqual(idsIn(svg), [], `${name} has an id`);
  }
  assert.match(rigSvg(), /class="crank"/, "the crank the UI turns while reeling");
});

test("blobs are deterministic, closed and finite", () => {
  assert.equal(blobPath(20, 4), blobPath(20, 4));
  assert.notEqual(blobPath(20, 4), blobPath(20, 5));
  assert.match(blobPath(20, 4), /^M.* Z$/);
  assert.doesNotMatch(blobPath(41, 99), /NaN|Infinity|undefined/);
});

test("the page has every element main.js looks up, and the favicon is well-formed", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const wanted = new Set([...main.matchAll(/\$\("([\w-]+)"\)/g)].map((m) => m[1]));
  for (const id of wanted) assert.match(html, new RegExp(`id="${id}"`), `index.html is missing #${id}`);
  assertWellFormed(await readFile(new URL("../favicon.svg", import.meta.url), "utf8"), assert, "favicon");
});

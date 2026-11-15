// Đào Vàng: screens, input, the animation loop and rendering. All rules live in
// src/core; this file only turns state into SVG and clicks/keys into input.

import { createBot } from "./core/autoplay.js";
import { FIELD } from "./core/hook.js";
import { ITEMS } from "./core/items.js";
import { createLevelState, step, tipOfState } from "./core/level.js";
import { isUnlocked, recordOf, recordRun, restoreProgress, totalBest } from "./core/progress.js";
import { LEVELS_PER_REGION, REGIONS, regionById } from "./core/regions.js";
import { buy, createRun, finishLevel, leaveShop, levelFor } from "./core/run.js";
import { SHOP_ITEMS, modsFromPerks } from "./core/shop.js";
import { backdropSvg, hookSvg, itemSvg, rigSvg, shopkeeperSvg } from "./ui/art.js";
import { createAudio } from "./ui/audio.js";
import { load, save } from "./ui/storage.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const money = (n) => Math.round(n).toLocaleString("vi-VN");

const params = new URLSearchParams(location.search);
const DEMO = params.has("demo");
const DEBUG = params.has("debug");
const SEED = params.has("seed") ? Number(params.get("seed")) >>> 0 : null;

const audio = createAudio();
let progress = restoreProgress(load("progress", null));
if (load("muted", false)) audio.toggle();

let run = null;
let state = null;
let paused = false;
let raf = 0;
let last = 0;
let lastTick = -1;
let bot = null;
const input = { fire: false, cut: false };
const nodes = new Map(); // item uid → <g>

// ── Home ─────────────────────────────────────────────────────────────────

function renderHome() {
  $("hero-art").innerHTML = rigSvg();
  $("total-best").textContent = totalBest(progress) ? `🏆 ${money(totalBest(progress))}` : "";
  $("regions").innerHTML = REGIONS.map((r, i) => {
    const open = isUnlocked(progress, r.id);
    const rec = recordOf(progress, r.id);
    const status = !open
      ? `🔒 Qua ${esc(REGIONS[i - 1].name)} để mở`
      : rec.cleared ? `✅ Đã chinh phục · Kỷ lục ${money(rec.best)}`
      : rec.best ? `Kỷ lục ${money(rec.best)} · ${rec.furthest}/${LEVELS_PER_REGION} màn` : "Chưa đào lần nào";
    return `<button class="region${open ? "" : " locked"}" type="button" data-region="${r.id}" ${open ? "" : "disabled"}
        aria-label="${esc(r.name)}, ${esc(r.province)}. ${esc(status)}">
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${backdropSvg(r.id, "card")}</svg>
      <span class="region-body">
        <span class="region-diff">${"⛏".repeat(r.difficulty + 1)}</span>
        <b>${esc(r.name)}</b>
        <span class="region-prov">${esc(r.province)}</span>
        <span class="region-tag">${esc(r.tagline)}</span>
        <span class="region-status">${status}</span>
      </span>
    </button>`;
  }).join("");
}

function show(screen) {
  $("home").hidden = screen !== "home";
  $("game").hidden = screen !== "game";
}

function goHome() {
  stopLoop();
  closeCard();
  run = null;
  state = null;
  renderHome();
  show("home");
}

// ── Cards (dialogs) ──────────────────────────────────────────────────────

let demoTimer = 0;

function openCard(html) {
  $("card").innerHTML = html;
  $("overlay").hidden = false;
  const focus = $("card").querySelector("[autofocus]") ?? $("card").querySelector("button");
  focus?.focus();
  // Demo mode presses the main button by itself, so the game can run unattended.
  clearTimeout(demoTimer);
  if (DEMO) {
    const main = $("card").querySelector('[data-act="go"], [data-act="leave"], [data-act="again"]');
    if (main) demoTimer = setTimeout(() => main.click(), main.dataset.act === "go" ? 1800 : 3500);
  }
}

function closeCard() {
  clearTimeout(demoTimer);
  $("overlay").hidden = true;
  $("card").innerHTML = "";
}

const cardOpen = () => !$("overlay").hidden;

function perksLine(perks) {
  const owned = Object.keys(perks).filter((id) => perks[id]);
  if (!owned.length) return "";
  return `<p class="perks">Mang theo: ${owned.map((id) => `${SHOP_ITEMS[id].icon} ${esc(SHOP_ITEMS[id].name)}`).join(" · ")}</p>`;
}

function showIntro() {
  const region = regionById(run.regionId);
  const level = levelFor(run);
  const time = level.timeLimit + modsFromPerks(run.perks).bonusTime;
  openCard(`
    <p class="kicker">${esc(region.name)} · Màn ${run.levelIndex + 1}/${LEVELS_PER_REGION}</p>
    <h2 id="card-title">Mục tiêu ${money(level.target)}</h2>
    <p>${esc(run.levelIndex === 0 ? region.tagline : "Bà Tư đã đi. Mai quay lại bãi đào.")}</p>
    <p class="meta">⏱ ${time} giây · 👛 Ví: ${money(run.wallet)}</p>
    ${perksLine(run.perks)}
    <div class="row"><button class="btn primary" data-act="go" autofocus>Thả móc thôi!</button>
    <button class="btn ghost" data-act="home">Về trang chủ</button></div>`);
}

function showPause() {
  openCard(`
    <h2 id="card-title">Tạm dừng</h2>
    <p>Đồng hồ đã dừng. Mai đang ngồi uống nước.</p>
    <div class="row"><button class="btn primary" data-act="resume" autofocus>▶ Chơi tiếp</button>
    <button class="btn ghost" data-act="quit">Bỏ chuyến này</button></div>`);
}

function showShop(result) {
  const region = regionById(run.regionId);
  const items = run.shop.offer.map((o) => {
    const it = SHOP_ITEMS[o.id];
    const bought = run.shop.bought.includes(o.id);
    const poor = run.wallet < o.price;
    return `<li class="good${bought ? " bought" : ""}">
      <span class="good-icon" aria-hidden="true">${it.icon}</span>
      <span class="good-text"><b>${esc(it.name)}</b><small>${esc(it.desc)}</small></span>
      <button class="btn small${bought ? "" : " primary"}" data-buy="${o.id}" ${bought || poor ? "disabled" : ""}>
        ${bought ? "Đã mua" : `${money(o.price)}`}</button></li>`;
  }).join("");
  openCard(`
    ${result ? `<p class="kicker">Qua màn ${result.index + 1}! +${money(result.earned)}</p>` : ""}
    <h2 id="card-title">Gánh hàng Bà Tư</h2>
    ${shopkeeperSvg()}
    <p class="say">“Con gái đào giỏi quá! Mua gì cho màn sau không con?”</p>
    <p class="meta">👛 Ví của Mai: <b>${money(run.wallet)}</b></p>
    <ul class="goods">${items}</ul>
    <p class="hint">${esc(region.fact)}</p>
    <div class="row"><button class="btn primary" data-act="leave">Lên đường ➜</button></div>`);
}

function showEnd(newBest) {
  const region = regionById(run.regionId);
  const won = run.status === "won";
  const next = REGIONS[REGIONS.findIndex((r) => r.id === run.regionId) + 1];
  const rows = run.results.map((r) => `<li>Màn ${r.index + 1}: ${money(r.earned)} ${r.passed ? "✅" : "❌"}</li>`).join("");
  openCard(`
    <p class="kicker">${esc(region.name)}</p>
    <h2 id="card-title">${won ? "🎉 Chinh phục vùng đất!" : "⌛ Hết giờ rồi!"}</h2>
    <p>${won ? (next ? `Đường tới <b>${esc(next.name)}</b> đã mở.` : "Mai đã đào khắp bốn miền. Tuyệt vời!") : "Chưa đủ tiền mục tiêu. Thử lại nhé, bãi đào sẽ khác đi."}</p>
    <ul class="results">${rows}</ul>
    <p class="score">Tổng điểm: <b>${money(run.score)}</b>${newBest ? ` <span class="badge">Kỷ lục mới!</span>` : ""}</p>
    <div class="row"><button class="btn primary" data-act="again" autofocus>Đào lại</button>
    <button class="btn ghost" data-act="home">Về trang chủ</button></div>`);
}

$("card").addEventListener("click", (e) => {
  const buyBtn = e.target.closest("[data-buy]");
  if (buyBtn) {
    const out = buy(run, buyBtn.dataset.buy);
    if (out.ok) {
      audio.buy();
      run = out.run;
      announce(`Đã mua ${SHOP_ITEMS[buyBtn.dataset.buy].name}.`);
      showShop(null);
    }
    return;
  }
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (!act) return;
  audio.unlock();
  if (act === "go") beginLevel();
  else if (act === "home" || act === "quit") goHome();
  else if (act === "resume") resume();
  else if (act === "leave") {
    run = leaveShop(run);
    showIntro();
  } else if (act === "again") startRegion(run.regionId);
});

// ── Playing ──────────────────────────────────────────────────────────────

function startRegion(regionId) {
  audio.unlock();
  run = createRun(regionId, SEED ?? (Date.now() ^ (Math.random() * 2 ** 31)) >>> 0);
  show("game");
  $("backdrop").innerHTML = backdropSvg(regionId, "st");
  $("rig").innerHTML = rigSvg();
  $("hook").innerHTML = hookSvg();
  $("items").innerHTML = "";
  showIntro();
}

function beginLevel() {
  closeCard();
  const level = levelFor(run);
  state = createLevelState(level, modsFromPerks(run.perks));
  bot = DEMO ? createBot() : null;
  nodes.clear();
  $("items").innerHTML = state.items.map((it) =>
    `<g data-uid="${it.uid}" transform="translate(${it.x} ${it.y})">${itemSvg(it, { reveal: state.reveal })}</g>`).join("");
  for (const g of $("items").children) nodes.set(Number(g.dataset.uid), g);
  $("floaters").innerHTML = "";
  $("hud-region").textContent = regionById(run.regionId).name;
  $("hud-level").textContent = `${run.levelIndex + 1}/${LEVELS_PER_REGION}`;
  $("hud-target").textContent = money(state.target);
  lastTick = -1;
  paused = false;
  render();
  $("stage").focus({ preventScroll: true });
  startLoop();
}

function startLoop() {
  cancelAnimationFrame(raf);
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

function stopLoop() {
  cancelAnimationFrame(raf);
  raf = 0;
}

function pause() {
  if (!state || state.done || paused) return;
  paused = true;
  stopLoop();
  showPause();
}

function resume() {
  closeCard();
  paused = false;
  $("stage").focus({ preventScroll: true });
  startLoop();
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const move = bot ? bot(state, dt) : { fire: input.fire, cut: input.cut };
  input.fire = false;
  input.cut = false;
  const events = step(state, dt, move);
  for (const e of events) react(e);
  render();
  if (state.done) {
    stopLoop();
    setTimeout(endLevel, 700);
    return;
  }
  raf = requestAnimationFrame(frame);
}

function floater(x, y, text, cls) {
  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("x", String(Math.round(x)));
  t.setAttribute("y", String(Math.round(y)));
  t.setAttribute("class", `floater ${cls}`);
  t.setAttribute("text-anchor", "middle");
  t.textContent = text;
  $("floaters").appendChild(t);
  setTimeout(() => t.remove(), 1200);
}

function announce(text) {
  $("live").textContent = text;
}

function react(e) {
  const at = { x: FIELD.anchorX + 70, y: FIELD.anchorY - 10 };
  switch (e.type) {
    case "fire": audio.fire(); break;
    case "grab": audio.grab(); break;
    case "miss": break;
    case "bounce": audio.bounce(); floater(e.item.x, e.item.y - 30, "Vướng rễ!", "bad"); break;
    case "sting": audio.sting(); floater(e.item.x, e.item.y - 26, `-${e.penalty}s`, "bad"); nodes.get(e.item.uid)?.remove(); break;
    case "cut": audio.cut(); nodes.get(e.item.uid)?.remove(); floater(at.x, at.y + 40, "✂", "bad"); break;
    case "collect": {
      audio.collect(e.value);
      nodes.get(e.item.uid)?.remove();
      const extra = e.contents?.kind === "time" ? " +8s" : e.contents?.kind === "strength" ? " 💪" : "";
      floater(at.x, at.y, e.value ? `+${money(e.value)}${extra}` : extra.trim() || "+0", e.value >= 400 ? "big" : "good");
      announce(`${ITEMS[e.item.type].name}: +${money(e.value)}. Tổng ${money(state.earned)} trên ${money(state.target)}.`);
      break;
    }
    case "end":
      if (e.passed) audio.win(); else audio.lose();
      announce(e.passed ? "Đạt mục tiêu!" : "Hết giờ, chưa đạt mục tiêu.");
      break;
  }
}

function render() {
  const tip = tipOfState(state);
  const rope = $("rope");
  rope.setAttribute("x2", tip.x.toFixed(1));
  rope.setAttribute("y2", tip.y.toFixed(1));
  $("hook").setAttribute("transform", `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(${(-state.angle * 180 / Math.PI).toFixed(1)})`);
  const crank = $("rig").querySelector(".crank");
  if (crank && state.mode === "reel") crank.setAttribute("transform", `translate(${FIELD.anchorX} ${FIELD.anchorY - 6}) rotate(${(-state.length * 3) % 360})`);
  for (const it of state.items) {
    const g = nodes.get(it.uid);
    if (!g || it.gone) continue;
    let tf = `translate(${it.x.toFixed(1)} ${it.y.toFixed(1)})`;
    if (it.range && !it.grabbed) tf += Math.cos(it.speed * state.t + it.phase) < 0 ? " scale(-1 1)" : "";
    if (it.grabbed) tf += ` rotate(${(-state.angle * 180 / Math.PI).toFixed(1)})`;
    g.setAttribute("transform", tf);
  }
  $("hud-earned").textContent = money(state.earned);
  $("hud-bar").style.width = `${Math.min(100, (state.earned / state.target) * 100).toFixed(1)}%`;
  $("hud-bar").classList.toggle("done", state.earned >= state.target);
  const secs = Math.ceil(state.timeLeft);
  $("hud-time").textContent = String(secs);
  $("hud-time").classList.toggle("low", secs <= 10);
  if (secs <= 10 && secs !== lastTick && !state.done) {
    lastTick = secs;
    audio.tick();
  }
  $("cut-btn").hidden = state.cuts <= 0;
  $("cut-count").textContent = `(${state.cuts})`;
}

function endLevel() {
  if (!state?.done || !run || run.status !== "level") return;
  const result = { index: run.levelIndex, earned: state.earned, passed: state.passed };
  run = finishLevel(run, result);
  if (run.status === "shop") {
    showShop(result);
  } else {
    const out = recordRun(progress, run);
    progress = out.progress;
    save("progress", progress);
    showEnd(out.newBest);
  }
}

// ── Input ────────────────────────────────────────────────────────────────

const playing = () => state && !state.done && !paused && !cardOpen() && !$("game").hidden;

function fire() {
  if (playing() && state.mode === "swing") input.fire = true;
}

function cut() {
  if (playing() && state.mode === "reel" && state.grabbed) input.cut = true;
}

$("stage").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  audio.unlock();
  fire();
});
$("fire-btn").addEventListener("click", fire);
$("cut-btn").addEventListener("click", cut);
$("pause-btn").addEventListener("click", pause);
$("home-btn").addEventListener("click", () => {
  if (state && !state.done && !paused) pause();
  else goHome();
});
$("regions").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-region]");
  if (btn && !btn.disabled) startRegion(btn.dataset.region);
});
$("sound-btn").addEventListener("click", () => {
  const on = audio.toggle();
  $("sound-btn").textContent = on ? "🔊 Âm thanh" : "🔇 Tắt tiếng";
  $("sound-btn").setAttribute("aria-pressed", String(on));
  save("muted", !on);
});
if (!audio.state.on) {
  $("sound-btn").textContent = "🔇 Tắt tiếng";
  $("sound-btn").setAttribute("aria-pressed", "false");
}

window.addEventListener("keydown", (e) => {
  if (cardOpen()) {
    if (e.key === "Escape" && paused) resume();
    return;
  }
  if (!state || $("game").hidden) return;
  const onButton = e.target instanceof HTMLButtonElement;
  if ((e.key === " " && !onButton) || e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
    e.preventDefault();
    fire();
  } else if (e.key === "c" || e.key === "C" || e.key === "x" || e.key === "X") {
    cut();
  } else if (e.key === "p" || e.key === "P" || e.key === "Escape") {
    pause();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});

if (DEBUG) {
  window.__dv = {
    get state() { return state; },
    get run() { return run; },
    get progress() { return progress; },
    /** Add money to the current level. */
    give(n = 500) { if (state) state.earned += n; },
    /** Jump the clock forward. */
    skip(seconds = 10) { if (state) state.timeLeft = Math.max(0.01, state.timeLeft - seconds); },
    /** Open every region. */
    unlockAll() {
      for (const r of REGIONS) progress.regions[r.id] = { ...recordOf(progress, r.id), cleared: true };
      renderHome();
    },
  };
}

renderHome();
show("home");

// `?play=<region>` opens a region straight away (any region in demo mode).
const PLAY = params.get("play");
if (PLAY && REGIONS.some((r) => r.id === PLAY) && (DEMO || isUnlocked(progress, PLAY))) startRegion(PLAY);

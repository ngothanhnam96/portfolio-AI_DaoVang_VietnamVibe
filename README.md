# ⛏️ Đào Vàng — Mai và chiếc tời tre

A swinging-hook gold-digging game for the browser, set in four Vietnamese landscapes. Mai, a
young prospector in a nón lá, cranks a bamboo winch. Her hook swings like a pendulum. Drop it
at the right moment, hook a nugget, a gem or a crab carrying a pearl, and reel it home. Earn
the level's target before the clock runs out.

Zero dependencies, no build step, no image files. Every landscape, item and character is
drawn in SVG from code, and every sound is synthesised with WebAudio.

## The regions

| Region | Province | Difficulty | What makes it different |
|--------|----------|-----------|-------------------------|
| ⛏ Mỏ Vàng Bồng Miêu | Quảng Nam | ⛏ | An old gold mine at sunset: timber posts, gold veins, lots of nuggets, no obstacles |
| ⛏⛏ Đất Đỏ Tây Nguyên | Đắk Lắk | ⛏⛏ | Red basalt earth under a coffee farm and a nhà rông, with ground-wasp nests and old roots |
| ⛏⛏⛏ Hang Động Hạ Long | Quảng Ninh | ⛏⛏⛏ | A limestone cave under the bay, with a junk on the water, clay jars and crabs carrying pearls |
| ⛏⛏⛏⛏ Ruộng Bậc Thang Sa Pa | Lào Cai | ⛏⛏⛏⛏ | Under the rice terraces: tangled roots, jade and a deep ruby |

Each region has three levels. Clearing a region opens the next one.

## How it plays

- **The hook swings ±70°.** Tap the field, press the big button, or press `Space` / `↓` to drop it.
- **Weight matters.** The reel slows with weight: a gold boulder (650) takes about four times
  as long to bring up as a gem. A big rock is worth almost nothing and wastes seconds.
- **Items:**
  - Four sizes of gold.
  - Jade and ruby.
  - Two sizes of rock.
  - Clay jars (hũ sành) that hold money, +8 seconds, or ginger strength for the rest of the level.
  - Crabs (cua đá) that walk their lane, worth 560 with a pearl on their back.
- **Obstacles:** roots (rễ cây) knock the hook back empty. Ground-wasp nests (tổ ong đất) cost
  5 seconds.
- **Bà Tư's shoulder-pole stall** appears between levels. She brings three of six goods at
  prices that rise with the level:

  | Good | Effect for the next level |
  |------|---------------------------|
  | 🍵 Trà gừng | Heavy things reel up much faster |
  | 🪢 Dây mây mới | The hook flies out 40% faster |
  | 🪔 Đèn dầu | See what is inside every jar |
  | 🧧 Bùa may | Money in jars is doubled |
  | ⏳ Đồng hồ cát | +15 seconds |
  | ✂️ Kéo cắt dây | Cut a worthless rock loose while reeling (`C`), twice |

- **Saving:** best score per region, how far you got, and which regions are open are kept in
  `localStorage`.
- **Pause:** `P` or `Esc`, the pause button, or switching tabs pauses the clock.
- **Phones and keyboards:** the HUD stacks on a phone and the field is one big tap target.
  Every button can be reached with Tab, and a live region reads out each find.

## Run it

```bash
npm start    # http://127.0.0.1:5173
npm test     # 57 tests, no dependencies
```

URL options:

| Option | What it does |
|--------|--------------|
| `?play=bongmieu` | Opens a region straight away (if it is unlocked) |
| `?demo` | A bot plays and presses through the cards by itself, so the game runs unattended. With `?demo`, `?play=` opens any region |
| `?seed=42` | Fixes the seed, so the field is the same every time |
| `?debug` | Adds `window.__dv` (`state`, `run`, `progress`, `give(n)`, `skip(s)`, `unlockAll()`) |

## What the tests prove

- **Every level can be passed.**
  - A bot with only the player's inputs (fire, cut) and no power-ups passes all 12 levels on
    12 seeds each.
  - It always earns at least 1.1× the target.
- **Determinism:**
  - The same seed builds the same field.
  - A replay with the same inputs ends with the same money to the coin.
- **Geometry:**
  - The pendulum stays within ±70°.
  - Hit tests use the item radius plus the hook tip.
  - The hook never tunnels through a 9-unit ruby.
  - The nearest item along the ray wins.
  - Gone and grabbed items are ignored.
  - A giant frame is clamped.
- **Reel times by weight:**
  - Reel speed falls with weight, item by item.
  - A boulder takes 3.5–4× a gem's trip.
  - Strength (tea) speeds it back up.
- **Level generation:**
  - Every item is inside the swing cone, below ground, inside the field, and not overlapping.
  - Every field holds at least 2.2× its target.
  - Targets rise within and across regions.
  - Each region keeps its own mix.
- **Rules:**
  - Misses, root bounces, wasp penalties, crab lanes and pearls.
  - Jar contents and the charm.
  - Scissors.
  - The clock ending the level.
  - A finished level ignores input.
- **Shop and economy:**
  - Three distinct goods per visit.
  - Seeded prices that rise with the level.
  - No double buying.
  - The poor are refused.
  - Perks last one level.
  - Runs are never mutated in place.
- **Save and load:**
  - Progress survives a JSON round trip.
  - Junk in storage is cleaned.
  - Regions unlock in order.
- **Artwork:**
  - Every backdrop, item, the rig and the stall are well-formed SVG.
  - Backdrop ids are prefixed and unique even with five on one page.
  - Every `url(#…)` points to a real gradient.
  - `index.html` has every element `main.js` looks up.

## Project layout

```
src/core/   rules only, no DOM: rng, items, regions, hook, level, shop, run, progress, autoplay
src/ui/     art (SVG), audio (WebAudio), storage
src/main.js screens, input, animation loop, rendering
tests/      node:test suites
docs/       spec, design, tasks, testing, deploy
```

## Docs

| | |
|---|---|
| [01-SPEC](docs/01-SPEC.md) | Goal, game loop, requirements |
| [02-DESIGN](docs/02-DESIGN.md) | Architecture, physics, generation, economy, art |
| [03-TASKS](docs/03-TASKS.md) | What was built, what comes next |
| [04-TESTING](docs/04-TESTING.md) | Test suites and the browser check |
| [05-DEPLOY](docs/05-DEPLOY.md) | GitHub Pages, CI |
| [Script.md](Script.md) | How to present the game to a customer |

## Licence

Apache-2.0 — see [LICENSE](LICENSE).

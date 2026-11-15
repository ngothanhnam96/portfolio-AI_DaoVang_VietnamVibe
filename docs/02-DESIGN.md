# 02 · Design

## Architecture

```
src/core/        pure rules, no DOM — everything the tests drive
  rng.js         FNV-1a seed hashing + mulberry32
  items.js       item table (value, weight, radius, depth band), valueOf / weightOf
  regions.js     four regions: palette text, item mix, growth per level
  hook.js        field geometry, pendulum, tip, reel speed, hit test, ray march
  level.js       generateLevel (seeded) · createLevelState · step(state, dt, input)
  shop.js        Bà Tư's goods, seeded offers, perks → level modifiers
  run.js         a trip through one region: finishLevel, buy, leaveShop (immutable)
  progress.js    best / cleared / furthest per region, unlocks, restore from storage
  autoplay.js    the bot used by tests and ?demo
src/ui/          art.js (SVG strings) · audio.js (WebAudio) · storage.js (safe localStorage)
src/main.js      screens, cards, input, requestAnimationFrame loop, rendering
```

`step` mutates the level state in place, because it runs 60 times a second. Everything it does
depends only on the state, `dt` and the input, so a replay is exact. Runs and progress are
immutable values.

## Field and physics

- **Field:** 800 × 600 units. The rope leaves the winch at (400, 100) and the ground line is at
  y = 150. Items live below y = 185.
- **Swing:** the angle is `70° · sin(phase)` and the phase advances at 2.1 rad/s, so one swing
  takes about 3 s. A fire uses the angle on screen at that moment, before the frame's swing
  advance.
- **Extend:** 440 units/s (× 1.4 with the new rattan rope). The tip marches in 4-unit steps,
  and the first item whose circle (radius + 9) contains the tip is hit. The smallest item has
  radius 9, so it cannot be skipped.
- **Reel:** `speed = 520 / (1 + weight / (10 · strength))`. Empty is 520 units/s, a jade
  (weight 1) about 473, and a gold boulder (weight 30) 130. Ginger tea sets strength to 1.6,
  and a jar of tea multiplies it by 1.3.
- **Frames:** `dt` is clamped to 0.1 s, so a background tab cannot teleport the hook.

## Level generation

1. The seed is `hash(region, level, runSeed-derived seed)`.
2. Counts come from the region's `mix` plus `grow × levelIndex`.
3. Items are placed biggest first, each tried up to 400 times. A spot must be:
   - inside its depth band;
   - inside the swing cone (97% of 70°);
   - at least 8 units clear of every other item.
4. A crab also needs its whole lane, centre ± range, to be in the cone and empty.
5. Jars roll their contents at generation: 55% money (80–400), 25% +8 s, 20% strength.
6. If the field holds less than 2.2× the target, medium nuggets are added.
7. The target is `650 + 200·difficulty + 175·level`: 650 for the first level of Bồng Miêu,
   up to 1600 for the last level of Sa Pa.

## Economy

- Money earned in a level goes into the wallet and the score. Spending lowers only the wallet.
- The shop offers 3 of 6 goods. The price is the base × (1 + 0.3 · (level − 1)) × 0.85–1.15,
  rounded to 5.
- Goods last for the next level only.

## Art

- **Backdrops:** each region is a sky and surface strip, then a gradient earth with strata,
  pebbles and region details. Gradient ids carry a prefix (`card-` on the home cards, `st-` on
  the stage), so all five backdrops can share one page.
  - Bồng Miêu: a mine adit, timber posts and gold veins.
  - Tây Nguyên: a nhà rông, coffee bushes and basalt.
  - Hạ Long: karst towers, a junk and stalactites.
  - Sa Pa: misty ridges, rice terraces and roots.
- **Items:** flat fills and no ids. Nuggets and rocks are seeded "blobs" built from quadratic
  curves, so every nugget looks a little different.
- **Characters:** Mai (nón lá, áo bà ba) cranks a bamboo A-frame winch whose crank turns while
  reeling. Bà Tư carries her goods in two baskets on a shoulder pole.

## UX

- **Feedback:** a floating "+value" over the winch, a sparkle on big nuggets, a progress bar
  that turns green at the target, and a pulsing clock in the last 10 seconds with a tick sound.
- **Accessibility:** the stage is focusable (`role="application"`), cards are modal dialogs
  with autofocus, and an `aria-live` region announces each find. Reduced motion is respected.

# 04 · Testing

```bash
npm test   # node --test, no dependencies
```

| Suite | What it covers |
|-------|----------------|
| `hook.test.js` | Pendulum range, tip position, circle hit test, field edges, swing cone, ray march (nearest first, no tunnelling, ignores gone/grabbed, `to` cap), reel speed by weight and strength, reel times |
| `level.test.js` | Seeded determinism, placement (cone, ground, field, overlap), rising targets, value ≥ 2.2× target, region character, bad input, and the simulation: grab and collect, heavy vs light, miss, root bounce, wasp penalty, crab lanes and pearls, jar contents and the charm, scissors, the clock, frame clamping, no mutation of the generated level |
| `reach.test.js` | The bot passes all 12 levels on 12 seeds each with ≥ 1.1× the target and no power-ups; exact replays; power-ups really help |
| `run.test.js` | Run flow (level → shop → level → won / lost), seeded shop offers and rising prices, buying rules, perks lasting one level, perks → modifiers |
| `progress.test.js` | Unlock order, best and cleared only improve, JSON round trip, cleaning junk from storage |
| `art.test.js` | Well-formed SVG for every backdrop, item, rig, hook and stall; prefixed, unique ids that can share a page; every `url(#…)` resolves; jar reveal; crab pearl; `index.html` has every id `main.js` uses; favicon |

## Browser check

This was done by hand, with Chrome headless driven over the DevTools protocol. It confirmed:

- The home screen, the card thumbnails and the phone layout (390 px).
- `?demo&play=taynguyen`: the hook swings, fires, grabs and reels. The money, the progress bar
  and the clock update, and there are no console errors.
- The full flow:
  - The intro card.
  - Finishing level 1 opens Bà Tư's stall.
  - A purchase takes money from the wallet and the perk shows on the next intro card.
  - Failing level 2 shows the end card.
  - Progress is saved to `localStorage`.

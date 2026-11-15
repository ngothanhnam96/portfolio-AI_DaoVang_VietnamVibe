# 🎬 Đào Vàng: Presentation Script

A script for showing the gold-digging game to a customer, in a live demo or a screen-recorded
video. It runs about **3 minutes**. Shorter versions for a quick pitch or a social post are at
the end.

> **Live link:** https://ngothanhnam96.github.io/portfolio-AI_DaoVang_VietnamVibe/
> (check the link before you present)

---

## Before you start

- [ ] Open the live link in a fresh browser window, full screen, sound **on**.
- [ ] Clear saved progress (DevTools → Application → Local Storage) so only Bồng Miêu is open.
- [ ] Have a phone ready with the same link, to show tapping and the phone layout.
- [ ] Practise one level of Bồng Miêu so you can hit a big nugget on cue. Add `?seed=7` to the
      URL and the field is the same every time.
- [ ] Optional: open a second tab with `?demo&play=halong`. A bot plays by itself, which is
      useful as a fallback or a booth screen.
- [ ] Optional: add `?debug` to your main tab so `__dv.give(500)` or `__dv.skip(60)` can move
      things along if time runs short.

---

## Main script (≈ 3 min)

### Scene 1: The hook (0:00 – 0:20)

**On screen:** the home screen. Mai and her bamboo winch, four region cards.

**Say (EN):**
> "Meet Mai. She carries a bamboo winch across Việt Nam looking for gold. You have sixty
> seconds and one swinging hook. Drop it at the right moment and reel in the treasure. This is
> *Đào Vàng*, a gold-digging game you play right in the browser."

**Say (VI):**
> "Đây là Mai, cô gái mang chiếc tời tre đi khắp bốn miền tìm vàng. Bạn có sáu mươi giây và
> một chiếc móc đang đung đưa. Thả đúng lúc, kéo vàng về. Đây là *Đào Vàng*, chơi ngay trên
> trình duyệt."

---

### Scene 2: Four regions (0:20 – 0:40)

**On screen:** hover the four cards. Point to the locks on the last three.

**Say:**
> "There are four regions, each with its own landscape and its own tricks. The Bồng Miêu gold
> mine in Quảng Nam is where you learn. Then come the red basalt earth of Tây Nguyên with wasp
> nests and roots, the limestone caves of Hạ Long with crabs carrying pearls, and the rice
> terraces of Sa Pa, where the rubies are buried deep. You open each region by clearing the one
> before it."

**Action:** click **Mỏ Vàng Bồng Miêu**. The intro card shows target 650 and 60 seconds.
Click **Thả móc thôi!**

---

### Scene 3: The core mechanic (0:40 – 1:20)

**On screen:** the hook swinging over the mine.

**Action 1:** drop the hook on a **small nugget** near the top. It comes back fast.

> "One tap drops the hook. Light things come back fast."

**Action 2:** drop it on the **big gold boulder** (Vàng tảng). Mai cranks slowly and the clock
keeps running.

> "Heavy things come back slowly. That boulder is worth 650, but it costs you seconds. Every
> shot is a choice between value and time."

**Action 3:** grab a **rock** if one is in reach.

> "And a rock is almost worthless. That's the mistake players learn to avoid."

Point to the progress bar turning green when the target is reached.

---

### Scene 4: Surprises (1:20 – 1:50)

**Action:** hook a **clay jar** (hũ sành, the one with the "?").

> "Jars are a gamble: money, eight extra seconds, or ginger tea that makes Mai stronger."

**Switch to the `?demo&play=halong` tab** (or describe it):

> "In Hạ Long, crabs walk across the cave carrying pearls. Catch one and it's worth 560. In
> Tây Nguyên, poke a wasp nest and you lose five seconds. Roots knock your hook straight back."

---

### Scene 5: Bà Tư's stall (1:50 – 2:20)

**On screen:** the level ends and Bà Tư arrives with her shoulder pole.

> "Between levels, Bà Tư comes by with her shoulder pole. She brings three goods at a time:
> ginger tea to pull heavy things faster, a new rattan rope, an oil lamp that shows what is in
> the jars, a lucky charm, an hourglass for fifteen more seconds, or scissors to cut a rock
> loose."

**Action:** buy one item. Point to the wallet going down and the perk on the next intro card.

> "It's a small economy: spend now to earn more in the next level."

---

### Scene 6: Phone and close (2:20 – 3:00)

**On screen:** pick up the phone and tap the field to drop the hook.

> "On a phone, the whole field is the button. Tap to drop. It pauses when you switch apps, and
> your best scores and unlocked regions are saved."

**Closing line:**
> "Đào Vàng is easy to learn and hard to put down. It loads instantly, needs no install, and
> every level is tested by a bot to make sure it can be beaten. The regions, items and shop
> can be themed around your brand, your city or your event. Let's talk about the version you
> want."

---

## Selling points to have ready

Use these when the customer asks questions.

| They ask | You answer |
|----------|-----------|
| "Who is it for?" | Brand campaigns, tourism promotions, event booths, Tết mini-games, team-building. |
| "Can it be our brand?" | Yes. Regions are a list of data (name, items, difficulty), and art is drawn in code, so new landscapes, items or a branded character are quick to add. |
| "Is it fair? Can people actually win?" | Every level is generated from a seed and checked by an automated bot: all 12 levels on 12 seeds each pass without power-ups. |
| "Does it need an app?" | No. It runs in any modern browser, desktop or phone. No install, no login. |
| "Is it heavy?" | No dependencies, no build step, no image or sound files. It loads in a blink. |
| "Can it run at our booth?" | Yes. `?demo` mode plays by itself and loops forever, so it works as an attract screen. |
| "How do we know it works?" | 57 automated tests on every push: physics, level generation, the shop, saving, and the artwork itself. |
| "Can people play with a keyboard?" | Yes. Space or ↓ to drop, C to cut, P to pause, and Tab through every button. |

---

## Short versions

### 30-second pitch

> "Đào Vàng is a gold-digging game set across Việt Nam: Bồng Miêu, Tây Nguyên, Hạ Long and Sa
> Pa. A hook swings back and forth. Tap to drop it, grab gold, gems or a crab with a pearl, and
> reel it in. Heavy gold is worth more but takes longer, so every shot is a decision. Between
> levels, a street vendor sells power-ups. It runs on any phone with nothing to install, and
> it can be themed for your brand or event."

### Social post / message to a client

> ⛏️ **Đào Vàng**: a gold-digging game you can play in your browser.
>
> Mai has a bamboo winch, a swinging hook and 60 seconds. Drop the hook at the right moment,
> grab gold, jade, rubies or a crab carrying a pearl, and reel it home before time runs out.
>
> 🗺️ 4 regions: Bồng Miêu, Tây Nguyên, Hạ Long, Sa Pa
> ⚖️ Heavy gold pays more but reels slower, so every shot is a choice
> 🧺 Bà Tư's street stall sells power-ups between levels
> 📱 Phone and desktop, nothing to install
>
> Play it here: https://ngothanhnam96.github.io/portfolio-AI_DaoVang_VietnamVibe/
> Want a version for your brand, event or Tết campaign? Message me.

### Bài đăng tiếng Việt

> ⛏️ **Đào Vàng**: trò chơi thả móc đào vàng ngay trên trình duyệt.
>
> Cùng Mai và chiếc tời tre đi qua mỏ vàng Bồng Miêu, đất đỏ Tây Nguyên, hang động Hạ Long và
> ruộng bậc thang Sa Pa. Thả móc đúng lúc để kéo vàng, ngọc bích, hồng ngọc hay chú cua cõng
> ngọc trai. Vàng càng nặng kéo càng chậm, nên mỗi lần thả móc đều phải tính toán. Qua màn,
> ghé gánh hàng Bà Tư mua trà gừng, dây mây hay đồng hồ cát.
>
> Chơi ngay: https://ngothanhnam96.github.io/portfolio-AI_DaoVang_VietnamVibe/

// Gánh hàng Bà Tư: a street vendor with a shoulder pole who waits between
// levels. She brings three of six goods each time, at prices that rise with
// the level. Purchases last for the next level only.

import { createRng, hashSeed } from "./rng.js";

export const SHOP_ITEMS = Object.freeze({
  tea: { name: "Trà gừng", icon: "🍵", desc: "Kéo vật nặng nhanh hơn hẳn trong màn tới.", base: 120 },
  rope: { name: "Dây mây mới", icon: "🪢", desc: "Móc phóng ra nhanh hơn 40%.", base: 90 },
  lamp: { name: "Đèn dầu", icon: "🪔", desc: "Soi thấy bên trong mọi hũ sành.", base: 60 },
  charm: { name: "Bùa may", icon: "🧧", desc: "Tiền trong hũ sành được nhân đôi.", base: 100 },
  hourglass: { name: "Đồng hồ cát", icon: "⏳", desc: "Thêm 15 giây cho màn tới.", base: 150 },
  scissors: { name: "Kéo cắt dây", icon: "✂️", desc: "Bỏ đá vô giá trị đang kéo lên, dùng 2 lần.", base: 70 },
});

export const SHOP_IDS = Object.keys(SHOP_ITEMS);
export const OFFER_SIZE = 3;

const round5 = (n) => Math.max(5, Math.round(n / 5) * 5);

/** The three goods and prices offered before level `levelIndex` (1 or 2) of a run. */
export function offerFor(seed, levelIndex) {
  const rng = createRng(hashSeed("shop", seed, levelIndex));
  return rng
    .shuffle(SHOP_IDS)
    .slice(0, OFFER_SIZE)
    .map((id) => ({ id, price: round5(SHOP_ITEMS[id].base * (1 + 0.3 * (levelIndex - 1)) * rng.range(0.85, 1.15)) }));
}

/** Turn bought goods into level modifiers for createLevelState. */
export function modsFromPerks(perks = {}) {
  return {
    strength: perks.tea ? 1.6 : 1,
    extendMul: perks.rope ? 1.4 : 1,
    reveal: Boolean(perks.lamp),
    luck: Boolean(perks.charm),
    bonusTime: perks.hourglass ? 15 : 0,
    cuts: perks.scissors ? 2 : 0,
  };
}

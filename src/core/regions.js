// Four regions, three levels each. `mix` is what level 1 holds; `grow` is added
// once per later level. Regions unlock in order (see progress.js).

export const REGIONS = Object.freeze([
  {
    id: "bongmieu",
    name: "Mỏ Vàng Bồng Miêu",
    province: "Quảng Nam",
    difficulty: 0,
    tagline: "Mỏ vàng lâu đời nhất xứ Quảng, vàng cục nằm ngay dưới lớp đất nâu.",
    fact: "Mỏ vàng Bồng Miêu ở Phú Ninh, Quảng Nam đã được khai thác từ hàng trăm năm trước.",
    mix: { "gold-s": 5, "gold-m": 4, "gold-l": 2, "gold-xl": 1, "rock-s": 3, "rock-l": 2, jar: 1 },
    grow: { "rock-l": 1, "rock-s": 1, jar: 1 },
  },
  {
    id: "taynguyen",
    name: "Đất Đỏ Tây Nguyên",
    province: "Đắk Lắk",
    difficulty: 1,
    tagline: "Đất đỏ bazan dưới rẫy cà phê. Coi chừng tổ ong đất và rễ cây già.",
    fact: "Đất đỏ bazan Tây Nguyên hình thành từ dung nham núi lửa, rất hợp với cây cà phê.",
    mix: { "gold-s": 4, "gold-m": 4, "gold-l": 2, "gold-xl": 1, jade: 1, "rock-s": 3, "rock-l": 3, jar: 1, crab: 1, root: 1, hive: 2 },
    grow: { hive: 1, root: 1, "rock-l": 1 },
  },
  {
    id: "halong",
    name: "Hang Động Hạ Long",
    province: "Quảng Ninh",
    difficulty: 2,
    tagline: "Dưới chân núi đá vôi, cua đá cõng ngọc trai chạy ngang hang.",
    fact: "Vịnh Hạ Long có gần hai nghìn hòn đảo, phần lớn là núi đá vôi với nhiều hang động.",
    mix: { "gold-s": 3, "gold-m": 4, "gold-l": 2, "gold-xl": 1, jade: 1, "rock-s": 3, "rock-l": 2, jar: 3, crab: 3 },
    grow: { crab: 1, "rock-l": 1, "rock-s": 1 },
  },
  {
    id: "sapa",
    name: "Ruộng Bậc Thang Sa Pa",
    province: "Lào Cai",
    difficulty: 3,
    tagline: "Dưới ruộng bậc thang là rễ cây chằng chịt và ngọc quý nằm thật sâu.",
    fact: "Ruộng bậc thang Sa Pa được người Mông, Dao, Giáy đắp qua nhiều thế hệ trên sườn núi.",
    mix: { "gold-s": 3, "gold-m": 4, "gold-l": 2, "gold-xl": 1, jade: 2, ruby: 1, "rock-s": 2, "rock-l": 3, jar: 2, crab: 1, root: 3, hive: 1 },
    grow: { root: 1, hive: 1, "rock-l": 1 },
  },
]);

export const LEVELS_PER_REGION = 3;
export const REGION_IDS = REGIONS.map((r) => r.id);

export function regionById(id) {
  const region = REGIONS.find((r) => r.id === id);
  if (!region) throw new Error(`Unknown region: ${id}`);
  return region;
}

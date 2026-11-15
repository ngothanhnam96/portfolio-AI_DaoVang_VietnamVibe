// Hook kinematics and collision. The field is 800 × 600 units; the rope leaves
// the bamboo winch at the anchor and the angle is measured from straight down
// (positive = to the right).

export const FIELD = Object.freeze({ width: 800, height: 600, anchorX: 400, anchorY: 100, ground: 150, top: 185 });

export const HOOK = Object.freeze({
  amplitude: (70 * Math.PI) / 180, // widest swing either side
  omega: 2.1, // swing phase speed, rad/s → one swing every ~3 s
  restLength: 36, // rope length while swinging
  extendSpeed: 440, // units/s going out
  reelBase: 520, // units/s coming back empty
  tipRadius: 9,
  step: 4, // collision march step, so a fast hook never skips a small gem
});

export const swingAngle = (phase) => HOOK.amplitude * Math.sin(phase);

export function tipOf(angle, length) {
  return { x: FIELD.anchorX + length * Math.sin(angle), y: FIELD.anchorY + length * Math.cos(angle) };
}

export const angleTo = (x, y) => Math.atan2(x - FIELD.anchorX, y - FIELD.anchorY);
export const distanceTo = (x, y) => Math.hypot(x - FIELD.anchorX, y - FIELD.anchorY);

/** Reel speed falls with weight; strength (ginger tea) pushes it back up. */
export function reelSpeed(weight, strength = 1) {
  return HOOK.reelBase / (1 + Math.max(0, weight) / (10 * strength));
}

/** Seconds to reel an item back from `distance` along the rope. */
export function reelTime(distance, weight, strength = 1) {
  return Math.max(0, distance - HOOK.restLength) / reelSpeed(weight, strength);
}

export function touches(tip, item) {
  return Math.hypot(tip.x - item.x, tip.y - item.y) <= item.radius + HOOK.tipRadius;
}

export function outOfField(tip) {
  return tip.x < 0 || tip.x > FIELD.width || tip.y > FIELD.height;
}

/** Whether a point can be hit: inside the swing cone, below the ground line. */
export function inCone(x, y) {
  return y > FIELD.top - 10 && Math.abs(angleTo(x, y)) <= HOOK.amplitude * 0.97;
}

/**
 * March the tip from `from` to `to` along `angle` and return the first item it
 * touches ({ item, length }), or null. Gone and grabbed items are ignored.
 */
export function firstHit(angle, items, from, to = Infinity) {
  for (let length = from; ; length += HOOK.step) {
    const capped = Math.min(length, to);
    const tip = tipOf(angle, capped);
    for (const item of items) {
      if (!item.gone && !item.grabbed && touches(tip, item)) return { item, length: capped };
    }
    if (capped >= to || outOfField(tip)) return null;
  }
}

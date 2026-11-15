// Sounds without audio files, all synthesised with WebAudio: a rope whoosh, a
// clunk on grab, a chime that rises with the value, a wooden thunk on roots, a
// wasp buzz, a snip, a ticking clock in the last ten seconds and two jingles.
// The context is created on the first user gesture (browser rule).

export function createAudio() {
  let ctx = null;
  let master = null;
  const state = { on: true };

  function ensure() {
    if (ctx) return ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.4;
    master.connect(ctx.destination);
    return ctx;
  }

  function tone(freq, { type = "sine", time = 0.15, gain = 0.2, slide = 0, delay = 0 } = {}) {
    if (!state.on || !ensure()) return;
    if (ctx.state === "suspended") ctx.resume();
    const at = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), at + time);
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, at + time);
    osc.connect(env).connect(master);
    osc.start(at);
    osc.stop(at + time + 0.03);
  }

  function noise(time = 0.3, gain = 0.15, freq = 900) {
    if (!state.on || !ensure()) return;
    const frames = Math.floor(ctx.sampleRate * time);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();
    src.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = freq;
    env.gain.value = gain;
    src.connect(filter).connect(env).connect(master);
    src.start();
  }

  return {
    state,
    unlock: () => ensure(),
    toggle() {
      state.on = !state.on;
      return state.on;
    },
    fire: () => noise(0.25, 0.12, 1400),
    grab: () => tone(140, { type: "square", time: 0.08, gain: 0.12 }),
    collect(value) {
      const base = value >= 400 ? 880 : value >= 100 ? 660 : value > 0 ? 520 : 300;
      tone(base, { type: "triangle", time: 0.18, gain: 0.18 });
      if (value >= 100) tone(base * 1.5, { type: "triangle", time: 0.22, gain: 0.14, delay: 0.08 });
      if (value >= 400) tone(base * 2, { type: "sine", time: 0.3, gain: 0.12, delay: 0.16 });
    },
    bounce: () => tone(110, { type: "sine", time: 0.18, gain: 0.25, slide: -40 }),
    sting() {
      for (let k = 0; k < 3; k++) tone(230 + k * 15, { type: "sawtooth", time: 0.12, gain: 0.07, delay: k * 0.07 });
    },
    cut: () => noise(0.08, 0.2, 3500),
    tick: () => tone(1500, { type: "square", time: 0.03, gain: 0.05 }),
    buy: () => [660, 990].forEach((n, k) => tone(n, { type: "triangle", time: 0.12, gain: 0.14, delay: k * 0.07 })),
    win: () => [523, 659, 784, 1047].forEach((n, k) => tone(n, { type: "triangle", time: 0.28, gain: 0.16, delay: k * 0.12 })),
    lose: () => [392, 330, 262].forEach((n, k) => tone(n, { type: "sine", time: 0.35, gain: 0.15, delay: k * 0.18 })),
  };
}

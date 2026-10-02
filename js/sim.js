// Toy rack-cooling environment, a tabular Q-learning agent and a thermostat baseline.
// Pure functions and closures only: no DOM, so the page and the Node tests share it.
// Illustrative only; not a model of any real data center.

export const SET = 27;    // target temperature, °C
export const BAND = 2;    // safe band is SET ± BAND
export const STEPS = 160; // steps per episode
export const NA = 5;      // cooling levels 0..4

const T_BINS = 14, LOAD_BINS = 3;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function makeEnv(seed) {
  const rnd = mulberry32(seed);
  let T, t, phase, spikeAt, spikeLen, stressed = 0, hot = false;

  function load() {
    let l = 0.55 + 0.25 * Math.sin((t + phase) / 22);
    if (t >= spikeAt && t < spikeAt + spikeLen) l += hot ? 0.8 : 0.45;
    return l;
  }

  return {
    // Make the next n episodes carry a much larger heat spike.
    stress(n) { stressed = n; },
    reset() {
      hot = stressed > 0;
      if (hot) stressed--;
      T = SET + (rnd() * 6 - 3);
      t = 0;
      phase = rnd() * 140;
      spikeAt = 30 + Math.floor(rnd() * 90);
      spikeLen = 12 + Math.floor(rnd() * 14);
      return this.obs();
    },
    obs() { return { T, load: load(), t }; },
    step(a) {
      T += 1.6 * load() - 0.55 * a - 0.06 * (T - 22) + (rnd() - 0.5) * 0.3;
      t++;
      const err = Math.abs(T - SET);
      const r = -(err > BAND ? 1 + (err - BAND) : err * 0.15) - 0.06 * a;
      return { o: this.obs(), r, done: t >= STEPS, inBand: err <= BAND };
    }
  };
}

export function stateOf(o) {
  const tb = Math.max(0, Math.min(T_BINS - 1, Math.floor(o.T - 20)));
  const lb = o.load < 0.5 ? 0 : o.load < 0.8 ? 1 : 2;
  return tb * LOAD_BINS + lb;
}

export function makeAgent(seed) {
  const rnd = mulberry32(seed), Q = new Float32Array(T_BINS * LOAD_BINS * NA);
  let eps = 1;
  return {
    get eps() { return eps; },
    act(s, greedy) {
      if (!greedy && rnd() < eps) return Math.floor(rnd() * NA);
      let best = 0;
      for (let a = 1; a < NA; a++) if (Q[s * NA + a] > Q[s * NA + best]) best = a;
      return best;
    },
    learn(s, a, r, s2, done) {
      let max = -Infinity;
      for (let k = 0; k < NA; k++) max = Math.max(max, Q[s2 * NA + k]);
      Q[s * NA + a] += 0.12 * (r + (done ? 0 : 0.92 * max) - Q[s * NA + a]);
    },
    endEpisode() { eps = Math.max(0.03, eps * 0.985); }
  };
}

// Baseline: full cooling above SET + 1, off below SET - 1.
export function thermostat() {
  let on = false;
  return o => {
    if (o.T > SET + 1) on = true;
    if (o.T < SET - 1) on = false;
    return on ? NA - 1 : 0;
  };
}

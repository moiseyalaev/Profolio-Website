import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STEPS, NA, makeEnv, makeAgent, stateOf, thermostat } from '../js/sim.js';

function run(env, policy, agent) {
  let o = env.reset(), R = 0, inBand = 0, peak = 0, done = false;
  const T = [];
  while (!done) {
    const s = stateOf(o), a = policy(o, s), x = env.step(a);
    if (agent) agent.learn(s, a, x.r, stateOf(x.o), x.done);
    T.push(x.o.T); R += x.r; inBand += x.inBand; peak = Math.max(peak, x.o.load); o = x.o; done = x.done;
  }
  return { T, R, band: inBand / STEPS, peak };
}
const mean = (n, f) => { let s = 0; for (let i = 0; i < n; i++) s += f(); return s / n; };

test('same seed gives identical episodes', () => {
  const a = run(makeEnv(11), () => 2), b = run(makeEnv(11), () => 2);
  assert.deepEqual(a.T, b.T);
});

test('state index stays in range', () => {
  for (const T of [-50, 20, 27, 33.9, 200]) for (const load of [0, 0.5, 0.79, 0.8, 3]) {
    const s = stateOf({ T, load });
    assert.ok(Number.isInteger(s) && s >= 0 && s < 14 * 3, `state ${s}`);
  }
});

test('trained agent beats the thermostat', () => {
  const env = makeEnv(7), agent = makeAgent(3);
  for (let i = 0; i < 200; i++) { run(env, (o, s) => agent.act(s, false), agent); agent.endEpisode(); }
  let band = 0;
  const agentR = mean(100, () => { const r = run(env, (o, s) => agent.act(s, true)); band += r.band / 100; return r.R; });
  const th = thermostat();
  const baseR = mean(100, () => run(env, o => th(o)).R);
  assert.ok(agentR > baseR, `agent ${agentR} vs thermostat ${baseR}`);
  assert.ok(band >= 0.95, `time in band ${band}`);
});

test('agent only picks valid actions', () => {
  const agent = makeAgent(1);
  for (let s = 0; s < 42; s++) { const a = agent.act(s, false); assert.ok(a >= 0 && a < NA); }
});

test('stress raises the heat spike for exactly n episodes', () => {
  // Twin environments share a seed, so any difference in peak load comes from stress().
  const plain = makeEnv(5), stressed = makeEnv(5);
  stressed.stress(2);
  const diffs = [0, 1, 2].map(() => run(stressed, () => 2).peak - run(plain, () => 2).peak);
  assert.ok(Math.abs(diffs[0] - 0.35) < 1e-9 && Math.abs(diffs[1] - 0.35) < 1e-9, `stressed diffs ${diffs}`);
  assert.equal(diffs[2], 0);
});

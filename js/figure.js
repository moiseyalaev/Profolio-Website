// Figure 1: a Q-learning agent learns to cool a simulated rack while the visitor watches,
// and the visitor can stress it or take the controls for one episode.
import { SET, BAND, STEPS, NA, makeEnv, makeAgent, stateOf, thermostat } from './sim.js';

const $ = id => document.getElementById(id);
const fig = $('fig1'), trace = $('trace'), curve = $('curve'), squiggle = $('squiggle');
const css = getComputedStyle(document.documentElement);
const col = name => css.getPropertyValue(name).trim();
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const TICK_MS = 280;        // one training episode per tick
const MANUAL_STEP_MS = 90;  // real-time pace while the visitor is in control
const MAX_EPISODES = 400;
const CONTEST_EPISODES = 120; // the agent gets at least this much practice before facing a visitor
const LO = 16, HI = 44;     // plotted temperature range, °C

let env, benv, agent, ep, rewards, baseBand, last;
let paused = false, visible = true, manual = null;

function fit(canvas) {
  const r = canvas.getBoundingClientRect(), d = devicePixelRatio || 1;
  canvas.width = r.width * d; canvas.height = r.height * d;
  const g = canvas.getContext('2d');
  g.setTransform(d, 0, 0, d, 0, 0);
  return [g, r.width, r.height];
}

const clampT = T => Math.max(LO, Math.min(HI, T));

function episode(policy, e, learn) {
  let o = e.reset(), R = 0, inBand = 0, done = false;
  const T = [];
  while (!done) {
    const s = stateOf(o), a = policy(o, s), x = e.step(a);
    if (learn) agent.learn(s, a, x.r, stateOf(x.o), x.done);
    T.push(clampT(x.o.T)); R += x.r; inBand += x.inBand; o = x.o; done = x.done;
  }
  return { T, R, band: inBand / STEPS };
}

function reset() {
  const seed = (Math.random() * 1e6) | 0;
  env = makeEnv(seed); benv = makeEnv(seed); agent = makeAgent(seed + 1);
  ep = 0; rewards = []; baseBand = [];
  tick();
}

function tick(render = true) {
  const th = thermostat();
  const b = episode(o => th(o), benv, false);
  const a = episode((o, s) => agent.act(s, false), env, true);
  agent.endEpisode(); ep++;
  rewards.push(Math.max(-2500, a.R)); baseBand.push(b.band);
  last = { a, b };
  if (render) draw();
}

// lines: [{ T: number[], color, width, glow }]
function drawTrace(lines) {
  const [g, w, h] = fit(trace);
  const y = t => h - 16 - (t - LO) / (HI - LO) * (h - 32), x = i => 46 + i / (STEPS - 1) * (w - 60);
  g.fillStyle = col('--pband');
  g.fillRect(46, y(SET + BAND), w - 60, y(SET - BAND) - y(SET + BAND));
  g.font = '10px JetBrains Mono, monospace'; g.fillStyle = '#9aa1ae'; g.textAlign = 'right';
  for (const t of [20, 27, 34, 41]) {
    g.fillText(t + '°C', 40, y(t) + 3);
    g.strokeStyle = col('--pgrid'); g.lineWidth = 1;
    g.beginPath(); g.moveTo(46, y(t)); g.lineTo(w - 14, y(t)); g.stroke();
  }
  for (const l of lines) {
    if (!l.T.length) continue;
    g.save();
    g.strokeStyle = l.color; g.lineWidth = l.width; g.lineJoin = 'round';
    if (l.glow) { g.shadowColor = l.color; g.shadowBlur = 10; }
    g.beginPath();
    l.T.forEach((t, i) => i ? g.lineTo(x(i), y(t)) : g.moveTo(x(i), y(t)));
    g.stroke();
    g.restore();
  }
}

function drawCurve() {
  const [g, w, h] = fit(curve);
  const n = Math.max(60, rewards.length), x = i => 46 + i / (n - 1) * (w - 60);
  const y = r => 26 + (Math.log10(1 - r) - 1) / 2.4 * (h - 38);
  g.font = '10px JetBrains Mono, monospace'; g.fillStyle = '#9aa1ae'; g.textAlign = 'left';
  g.fillText('REWARD PER EPISODE (LOG) · HIGHER IS BETTER', 46, 15);
  g.strokeStyle = col('--ok'); g.lineWidth = 2; g.lineJoin = 'round';
  g.beginPath();
  rewards.forEach((r, i) => i ? g.lineTo(x(i), y(r)) : g.moveTo(x(i), y(r)));
  g.stroke();
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(x(rewards.length - 1), y(rewards[rewards.length - 1]), 3.5, 0, 7); g.fill();
}

// The slogan's underline is the agent's latest temperature trace.
function drawUnderline(T) {
  if (!squiggle) return;
  const pts = [];
  for (let i = 0; i < T.length; i += 4) {
    const dy = Math.max(-9, Math.min(9, (T[i] - SET) * 1.1));
    pts.push((i / (T.length - 1) * 100).toFixed(1) + ' ' + (10 - dy).toFixed(1));
  }
  squiggle.setAttribute('d', 'M' + pts.join(' L'));
}

function draw() {
  if (manual) {
    drawTrace([
      { T: manual.agentT, color: col('--pblue'), width: 2, glow: false },
      { T: manual.youT, color: col('--ok'), width: 3, glow: true }
    ]);
  } else {
    drawTrace([
      { T: last.b.T, color: col('--hot'), width: 1.5, glow: false },
      { T: last.a.T, color: col('--pblue'), width: 2.75, glow: true }
    ]);
    drawUnderline(last.a.T);
  }
  drawCurve();
  const k = Math.min(10, rewards.length), avg = a => a.slice(-k).reduce((s, v) => s + v, 0) / k;
  $('s-ep').textContent = ep;
  $('s-band').textContent = Math.round(last.a.band * 100) + '%';
  $('s-base').textContent = Math.round(avg(baseBand) * 100) + '%';
}

// ----- manual mode: the visitor sets the cooling level for one episode, in real time -----

function startManual() {
  while (ep < CONTEST_EPISODES) tick(false);
  const seed = (Math.random() * 1e6) | 0;
  const you = makeEnv(seed), bot = makeEnv(seed);
  manual = { you, bot, yo: you.reset(), bo: bot.reset(), youT: [], agentT: [], youBand: 0, botBand: 0, youCool: 0, botCool: 0, timer: 0 };
  fig.classList.add('is-manual');
  $('manual-panel').hidden = false;
  $('manual').textContent = 'Back to the agent';
  $('fig-title').textContent = 'Fig. 1 · you have the controls';
  $('manual-msg').textContent = 'Keep the green line inside the band. More cooling costs more.';
  $('cool').focus();
  manual.timer = setInterval(stepManual, MANUAL_STEP_MS);
  draw();
}

function stepManual() {
  const m = manual, a = +$('cool').value, b = agent.act(stateOf(m.bo), true);
  const x = m.you.step(a), z = m.bot.step(b);
  m.youT.push(clampT(x.o.T)); m.agentT.push(clampT(z.o.T));
  m.youBand += x.inBand; m.botBand += z.inBand; m.youCool += a; m.botCool += b;
  m.yo = x.o; m.bo = z.o;
  draw();
  if (x.done) {
    clearInterval(m.timer); m.timer = 0;
    const pct = v => Math.round(v / STEPS * 100) + '%', lvl = v => (v / STEPS).toFixed(1);
    const youWin = m.youBand > m.botBand || (m.youBand === m.botBand && m.youCool < m.botCool);
    $('manual-msg').textContent =
      `You: ${pct(m.youBand)} in band at cooling ${lvl(m.youCool)}. ` +
      `Agent (after ${ep} episodes of practice): ${pct(m.botBand)} at ${lvl(m.botCool)}. ` +
      (youWin ? 'You win this one.' : 'The agent takes it.');
  }
}

function stopManual() {
  if (manual.timer) clearInterval(manual.timer);
  manual = null;
  fig.classList.remove('is-manual');
  $('manual-panel').hidden = true;
  $('manual').textContent = 'Take the controls';
  $('fig-title').textContent = 'Fig. 1 · training live in your browser';
  draw();
}

// ----- wiring -----

$('restart').onclick = () => { if (manual) stopManual(); reset(); };
$('pause').onclick = e => { paused = !paused; e.target.textContent = paused ? 'Resume' : 'Pause'; };
$('spike').onclick = () => { env.stress(4); benv.stress(4); if (still || paused) tick(); };
$('manual').onclick = () => (manual ? stopManual() : startManual());
$('cool').oninput = e => { $('cool-val').textContent = e.target.value; };
$('cool').max = NA - 1;

addEventListener('resize', () => last && draw());
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(fig);

reset();
if (still) {
  for (let i = 0; i < 150; i++) tick();
} else {
  setInterval(() => {
    if (!paused && !manual && visible && !document.hidden && ep < MAX_EPISODES) tick();
  }, TICK_MS);
}

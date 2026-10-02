// Album: a filterable photo wall with a full-screen viewer.
import { PHOTOS, GROUPS, src, ready } from './photos.js';

const wall = document.getElementById('wall'), chips = document.getElementById('chips'), empty = document.getElementById('wall-empty');
const viewer = document.getElementById('viewer'), big = document.getElementById('v-img');
const cap = document.getElementById('v-cap'), count = document.getElementById('v-count');
const valid = new Set(GROUPS.map(g => g[0]));

let items = [];   // [{ photo, button }] for photos that are ready
let shown = [];   // the subset matching the current filter
let at = 0;       // index into shown while the viewer is open

const groupFromHash = () => { const g = location.hash.slice(1); return valid.has(g) ? g : 'all'; };

function applyFilter() {
  const group = groupFromHash();
  shown = items.filter(it => group === 'all' || it.photo.group === group);
  for (const it of items) it.button.hidden = !shown.includes(it);
  for (const a of chips.children) a.setAttribute('aria-current', a.hash.slice(1) === group);
  empty.hidden = shown.length > 0;
}

function show(i) {
  at = (i + shown.length) % shown.length;
  const p = shown[at].photo;
  big.src = src(p.slug, 1600);
  big.alt = p.alt;
  cap.textContent = p.caption;
  count.textContent = `${at + 1} / ${shown.length}`;
}

function open(it) {
  show(shown.indexOf(it));
  viewer.showModal();
}

chips.replaceChildren(...GROUPS.map(([key, label]) => {
  const a = document.createElement('a');
  a.href = '#' + key;
  a.textContent = label;
  return a;
}));

{
  items = ready(PHOTOS).map(photo => {
    const button = document.createElement('button');
    button.className = 'ph';
    button.type = 'button';
    button.setAttribute('aria-label', `Open photo: ${photo.caption}`);
    const img = new Image();
    img.src = src(photo.slug, 640);
    img.alt = photo.alt;
    img.loading = 'lazy';
    const label = document.createElement('span');
    label.textContent = photo.caption;
    button.append(img, label);
    const it = { photo, button };
    button.addEventListener('click', () => open(it));
    return it;
  });
  // Hide filters that have nothing in them yet.
  for (const a of chips.children) {
    const g = a.hash.slice(1);
    a.hidden = g !== 'all' && !items.some(it => it.photo.group === g);
  }
  wall.replaceChildren(...items.map(it => it.button));
  applyFilter();
}

addEventListener('hashchange', applyFilter);

document.getElementById('v-prev').onclick = () => show(at - 1);
document.getElementById('v-next').onclick = () => show(at + 1);
document.getElementById('v-close').onclick = () => viewer.close();
viewer.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') show(at - 1);
  if (e.key === 'ArrowRight') show(at + 1);
});
viewer.addEventListener('close', () => shown[at]?.button.focus());

// Swipe left or right on the photo to move through the set.
let touchX = null;
viewer.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
viewer.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
});

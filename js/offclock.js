// Off the clock: a pile of photos to drag around (a swipeable row on phones),
// and a photo for each hobby block when one is available.
import { PHOTOS, src, ready } from './photos.js';

const PILE = 6;
const stack = document.getElementById('stack');
const narrow = matchMedia('(max-width: 900px)');
const bySlug = Object.fromEntries(PHOTOS.map(p => [p.slug, p]));
let top = 10;

// Scattered starting spots as fractions of the free space, with a tilt in degrees.
const SPOTS = [[0.02, 0.10, -6], [0.22, 0.42, 4], [0.40, 0.04, -3], [0.58, 0.40, 6], [0.78, 0.08, -5], [0.90, 0.46, 3]];

function place(card, i) {
  const [fx, fy, tilt] = SPOTS[i % SPOTS.length];
  card.style.left = Math.round(fx * Math.max(0, stack.clientWidth - card.offsetWidth)) + 'px';
  card.style.top = Math.round(fy * Math.max(0, stack.clientHeight - card.offsetHeight)) + 'px';
  card.style.transform = `rotate(${tilt}deg)`;
}

function makeCard(p) {
  const card = document.createElement('figure');
  card.className = 'card';
  card.tabIndex = 0;
  const img = new Image();
  img.src = src(p.slug, 640);
  img.alt = p.alt;
  img.draggable = false;
  const cap = document.createElement('figcaption');
  cap.textContent = p.caption;
  card.append(img, cap);

  let start = null;
  card.addEventListener('pointerdown', e => {
    if (narrow.matches) return;
    card.setPointerCapture(e.pointerId);
    card.style.zIndex = ++top;
    card.classList.add('drag');
    start = { x: e.clientX, y: e.clientY, left: card.offsetLeft, top: card.offsetTop };
  });
  card.addEventListener('pointermove', e => {
    if (!start) return;
    card.style.left = start.left + e.clientX - start.x + 'px';
    card.style.top = start.top + e.clientY - start.y + 'px';
  });
  const drop = () => { start = null; card.classList.remove('drag'); };
  card.addEventListener('pointerup', drop);
  card.addEventListener('pointercancel', drop);

  // Keyboard: Enter or Space brings a card to the front, arrows nudge it.
  card.addEventListener('keydown', e => {
    if (narrow.matches) return;
    const step = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[e.key];
    if (step) {
      e.preventDefault();
      card.style.left = card.offsetLeft + step[0] + 'px';
      card.style.top = card.offsetTop + step[1] + 'px';
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.style.zIndex = ++top;
    }
  });
  return card;
}

if (stack) {
  // Featured photos first; fill the pile from the rest while exports are still pending.
  const ordered = [...PHOTOS.filter(p => p.featured), ...PHOTOS.filter(p => !p.featured)];
  const cards = ready(ordered).slice(0, PILE).map(makeCard);
  stack.replaceChildren(...cards);
  const layout = () => { if (!narrow.matches) cards.forEach(place); };
  layout();
  narrow.addEventListener('change', layout);
}

// Hobby blocks list preferred photos in data-photos; the first one that exists is shown.
for (const pic of document.querySelectorAll('.hobby .pic[data-photos]')) {
  const [photo] = ready(pic.dataset.photos.split(',').map(s => bySlug[s.trim()]).filter(Boolean));
  if (!photo) continue;
  const img = new Image();
  img.src = src(photo.slug, 640);
  img.alt = photo.alt;
  img.loading = 'lazy';
  pic.replaceChildren(img);
}

// One-time effects when things first scroll into view: numbers count up, blocks slide in.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el) {
  const target = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  const t0 = performance.now(), ms = 900;
  (function frame(now) {
    const p = Math.min(1, (now - t0) / ms), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.round(target * eased) + suf;
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}

if (!still && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      if (e.target.dataset.count) countUp(e.target);
      else e.target.classList.add('in');
    }
  }, { threshold: 0.2 });
  document.querySelectorAll('[data-count], [data-reveal]').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in'));
}

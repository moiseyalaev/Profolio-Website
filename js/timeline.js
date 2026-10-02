// Figure 2: hovering, focusing or tapping a timeline row fills the detail panel beneath it.
// Each row carries its own content in data attributes, so the copy lives in the HTML.
const rows = [...document.querySelectorAll('#timeline .row')];
const panel = document.getElementById('tl-d');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function pick(row) {
  rows.forEach(r => r.classList.toggle('on', r === row));
  const d = row.dataset, left = el('div'), right = el('div', 'r');
  left.append(el('span', 'mono', d.meta), el('h3', '', d.title), el('p', '', d.text));
  if (d.href) {
    const a = el('a', '', 'Full details ↓');
    a.href = d.href;
    left.append(a);
  }
  right.append(el('b', '', d.num), el('span', 'mono', d.label));
  panel.replaceChildren(left, right);
}

for (const row of rows) {
  row.addEventListener('mouseenter', () => pick(row));
  row.addEventListener('click', () => pick(row));
  row.querySelector('button').addEventListener('focus', () => pick(row));
}
if (rows.length) pick(rows[0]);

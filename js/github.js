// "Recently pushed": public repos pushed in the last 18 months that are not already
// featured as cards. The block stays hidden when there is nothing fresh to show or the
// request fails, so new projects appear here on their own once they are pushed.
const USER = 'moiseyalaev';
const API = `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=20`;
const CACHE_KEY = 'recent-repos-v2', CACHE_MS = 6 * 60 * 60 * 1000;
const MAX_AGE_MS = 548 * 864e5, SHOW = 5;
const SKIP = new Set([USER, 'Profolio-Website'].map(n => n.toLowerCase()));

function ago(iso) {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso)) / 864e5));
  if (days < 1) return 'today';
  if (days < 60) return `${days} day${days === 1 ? '' : 's'} ago`;
  return `${Math.round(days / 30)} months ago`;
}

function render(list, repos) {
  list.replaceChildren(...repos.map(r => {
    const li = document.createElement('li'), a = document.createElement('a');
    a.href = `https://github.com/${USER}/${r.name}`;
    a.textContent = r.name;
    const desc = document.createElement('span');
    desc.textContent = r.description || '';
    const meta = document.createElement('span');
    meta.className = 'mono';
    meta.textContent = [r.language, 'pushed ' + ago(r.pushed_at)].filter(Boolean).join(' · ');
    li.append(a, desc, meta);
    return li;
  }));
}

async function load() {
  try {
    const hit = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.repos;
  } catch { /* no usable cache */ }
  const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
  const repos = (await res.json())
    .filter(r => !r.fork && !SKIP.has(r.name.toLowerCase()))
    .map(({ name, description, language, pushed_at }) => ({ name, description, language, pushed_at }));
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos })); } catch { /* storage unavailable */ }
  return repos;
}

const block = document.querySelector('.recent'), list = document.getElementById('recent');
if (block && list) {
  // Repos already shown as cards are read from the page, so the two never drift apart.
  const featured = new Set([...document.querySelectorAll('.repos a')].map(a => a.pathname.split('/').pop().toLowerCase()));
  load().then(repos => {
    const fresh = repos
      .filter(r => !featured.has(r.name.toLowerCase()) && Date.now() - new Date(r.pushed_at) < MAX_AGE_MS)
      .slice(0, SHOW);
    if (fresh.length) { render(list, fresh); block.hidden = false; }
  }).catch(() => { /* stay hidden */ });
}

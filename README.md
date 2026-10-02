# moiseyalaev.com

Source for **https://www.moiseyalaev.com/**. Plain HTML, CSS and JavaScript modules: no framework, no build step. Netlify publishes the repository root.

## Pages

- `index.html` — work, thesis, recommendations, projects, school
- `off-the-clock.html` — hobbies, with a pile of photos to drag around
- `album.html` — filterable photo wall with a full-screen viewer

## Layout

```
css/site.css      one stylesheet for all pages
js/sim.js         toy rack-cooling environment + Q-learning agent (no DOM)
js/figure.js      Figure 1: live training, heat spike, "take the controls"
js/timeline.js    Figure 2: interactive career timeline
js/github.js      "Recently pushed" list from the GitHub API
js/reveal.js      count-up and slide-in effects
js/photos.js      photo manifest for the personal pages
js/offclock.js    photo pile and hobby photos
js/album.js       album filters and viewer
tests/            Node tests for js/sim.js
scripts/          photo export helper
```

## Run locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173/.

## Tests

```bash
node --test
```

## Adding a photo

1. Export it (resizes to 1600px and 640px and strips all metadata, including location; needs Pillow):

   ```bash
   python3 scripts/prepare-photo.py ~/Downloads/original.jpg my-slug
   ```

2. Add or update its entry in `js/photos.js`. An entry with `pending: true` is skipped until its files exist.

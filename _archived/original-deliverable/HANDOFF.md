# optimiser.world — public site build

Full public frontend for **optimiser.world** — 8 pages, React 19 + React Router 7 + Tailwind v4, wired to the real Cloudflare Workers backend with a graceful mock fallback.

## Drop-in instructions

Your repo already has the scaffold (`package.json`, `vite.config.js`, `eslint.config.js`, `tailwind.config.js` is not needed because Tailwind v4 is wired via `@tailwindcss/vite` in `vite.config.js`). The deliverable here replaces `src/` and `index.html`.

```bash
# From the repo root
rsync -av /path/to/this/output/src/       src/
cp      /path/to/this/output/index.html   index.html

npm install       # no new deps — everything is already in your package.json
npm run dev
```

Open `http://localhost:5173` and you should see the Living Substrate hero immediately.

**Note on the API**: `src/api/client.js` reads `VITE_API_URL` from the env (defaults to `https://api.optimiser.world`). If the API is unreachable, pages fall through to realistic mock data — so the site renders from day one, even before the backend is deployed.

## What shipped

8 routes, fully implemented:

| Route | Page | Notable |
|---|---|---|
| `/` | `Home.jsx` | Living Substrate hero (canvas), stats strip, how-it-works, featured, categories, contrast rhetoric, CLI showcase, closing CTA |
| `/browse` | `Browse.jsx` | 3-column layout, URL-synced filters, sort pills, feed, side rails |
| `/search` | `Search.jsx` | Autofocus semantic search, debounced live results, latency readout, autocomplete |
| `/item/:slug` | `ItemDetail.jsx` | Hero, install card, sparkline, Overview/README/Discussion tabs, related items |
| `/trending` | `Trending.jsx` | Ambient Living Substrate background, top 3 global, 6-column by-category leaderboard |
| `/c/:slug` | `Category.jsx` | Category hero w/ colored block, filtered feed, other-categories nav |
| `/collections` | `Collections.jsx` | Editorial collection cards w/ numbering and curator bylines |
| `/collection/:slug` | `CollectionDetail.jsx` | Reading-list sequence layout + install-all block |
| `*` | 404 in App.jsx | Editorial 404 with the display-serif treatment |

## The design direction

**Aesthetic**: PostHog-adjacent cream (`#EEEFE9`) with orange-red (`#F54E00`) as the one hot accent, yellow-highlight marker (`#FFF287`) for emphasis, chunky `3px 3px 0 ink` offset shadows on cards, hard 1px `#151515` borders.

**Fonts**: Inter (body + UI), JetBrains Mono (metadata, numerals, tags), Instrument Serif (italic display accents — numbers, the odd emphasised word).

**Signature marks**:
- Yellow highlight pen on key phrases (`.hl`)
- Red strikethrough rhetoric for "not X, but Y" (`.strike`)
- Offset shadows that swap to bigger offset on hover
- Display-serif italic numerals used sparingly for section counters and emphasis

## Rough edges to know about

- **Mobile layouts** work but weren't the focus — desktop-first dev marketplace. Test `/browse` on narrow viewports; the 3-col rail collapses to single column but could use more polish.
- **LivingSubstrate** on Home is `h-[calc(100vh-68px)]`, assuming the TopNav is exactly 68px. If you rework the nav, update the calc.
- **Instrument Serif** loads from Google Fonts — fallback is Times New Roman, which is fine but less distinctive. Fonts are preloaded in `index.html`.
- **No error boundaries** around pages yet. If `fetchItem` returns undefined, ItemDetail shows a proper 404 state (correct). Other pages assume the API or mock returns a list.
- **The Living Substrate canvas** is a simplified port of the A2 exploration — no click-locks, no expansion modal, no keyboard nav. Those belong on logged-in app surfaces, not a marketing hero.

## What I deliberately did NOT build

Per your scope answer ("Full public site, no auth-gated pages"):

- `/submit` — the upload wizard
- `/dashboard` — user dashboard
- `/settings` — account settings
- `/user/:username` — profile pages
- Auth flow (login/OAuth)

Your backend supports all of these (`/api/submit`, `/api/user/*`, etc.) — the pages are a future build.

## Skills reminder

In `index.css` I've already added `Instrument Serif` to the font-family list, and the Google Fonts link in `index.html` loads all three families in one request. No further font setup needed.

Tailwind v4 is wired via `@tailwindcss/vite` in your existing `vite.config.js`. Custom design tokens live in `src/index.css` under `@theme { ... }`. Add more tokens there when you extend the palette.

## Known-good verified

- ✅ All 20 source files parse cleanly (Babel JSX parser)
- ✅ All relative imports resolve
- ✅ All `<Link>` targets match a defined `<Route>`
- ✅ Zero dark-theme leftover references
- ✅ Zero placeholder lorem / TODO / FIXME

---

Shipped 2026-04-16. If you want the logged-in surfaces (submit, dashboard, settings) built next, that's session two.

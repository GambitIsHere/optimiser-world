# Claude Code Prompt — optimiser.world
# Agents & Skills Marketplace — Reddit-style community platform
# Copy and paste this entire prompt into Claude Code

---

## STEP 0 — Install skills and read all context before writing a single line of code

Run these in sequence. Do not skip any.

```bash
# 1. Install ui-ux-pro-max skill
npm install -g uipro-cli
uipro init --ai claude

# 2. Generate design system for this specific product
python3 .claude/skills/ui-ux-pro-max/scripts/search.py \
  "marketplace community platform SaaS tools agents skills voting" \
  --design-system -p "Optimiser.World" -f markdown \
  --persist

# 3. Read all skill files before proceeding
read: .claude/skills/ui-ux-pro-max/SKILL.md
read: .claude/skills/optimiser-pro/SKILL.md
read: .claude/skills/brand-guidelines/SKILL.md
read: .claude/skills/algorithmic-art/SKILL.md
read: design-system/MASTER.md
```

Do not generate any UI until all five reads are complete.

---

## STEP 1 — Brand Identity

**Product name**: Optimiser.World  
**Tagline**: "The internet's intelligence, organised."  
**Sub-tagline**: "Discover, vote, and deploy the agents and skills that move markets."

**Brand philosophy**: Optimiser.World is where the Optimiser ecosystem lives in public. Every agent, every skill, every automation — built by the community, ranked by the community, used by everyone. Think Reddit meets the App Store, but for AI workflows.

### Colour tokens (hard-coded — do not override)
```
Background:    #0A0E1A
Surface:       #111827
Surface-2:     #1A2235
Surface-3:     #0F172A    ← sidebar, nav
Accent-Mint:   #00E5A0   ← upvotes, positive, CTAs
Accent-Blue:   #5B8DEF   ← links, tags, info
Accent-Violet: #A855F7   ← AI/agent badges, premium
Accent-Amber:  #FBBF24   ← trending, hot, featured
Accent-Red:    #FF6B6B   ← downvotes, warnings
Border:        rgba(255,255,255,0.06)
```

### Typography
```
Display: Geist (700, 800)
Body:    Geist (400, 500)
Mono:    Geist Mono — for skill/agent code previews
```

### UI Style
- Style: Bento Box Grid + AI-Native UI hybrid (from ui-ux-pro-max catalogue)
- Dense information layout — more data, less whitespace than optimiser.pro
- Cards: glass-card base but with stronger surface differentiation
- Vote buttons: large, satisfying, animated (mint pulse on upvote, red on downvote)
- Tags/badges: pill style, colour-coded by category
- Sidebar: fixed, icon + label navigation
- Mobile: bottom nav on mobile, sidebar collapses

---

## STEP 2 — Algorithmic Art (Hero / Featured background)

Use the algorithmic-art skill to generate a background for the hero / featured section.

**Philosophy to express**: "Collective Intelligence" — thousands of individual nodes (each a skill or agent) orbit in loose clusters. Related nodes drift toward each other, forming constellations. Highly-voted nodes glow brighter and larger. When a new node appears, it radiates a brief pulse of mint light and slowly finds its cluster. The system is always moving, always self-organising. No node is isolated for long.

Generate:
- `src/components/landing/CollectiveCanvas.jsx` — p5.js React component
- Seed: 2026
- Nodes: 150–300, vary size by "vote score" (small=new, large=popular)
- Cluster attraction: slow gravitational pull toward category centroid
- New node entry: mint pulse ring animation
- Active node (hovered): glows blue, shows tooltip
- Background: #0A0E1A, nodes in mint/blue/violet/amber depending on category
- Used on the landing hero and optionally as a subtle background on the Trending page

---

## STEP 3 — Architecture (SkillX-derived backend)

Optimiser.World adopts the SkillX.sh architecture as its backend foundation. Study it:
`https://github.com/nextlevelbuilder/skillx`

### Backend stack (Cloudflare — free tier, optimiser-pro aligned)
```
Frontend:   React Router v7 + Tailwind v4 (dark theme, mint accent)
Backend:    Cloudflare Workers + D1 (SQLite via Drizzle ORM)
Search:     Cloudflare Vectorize (bge-base-en-v1.5 embeddings) + SQLite FTS5
            → Reciprocal Rank Fusion (RRF) to merge semantic + keyword results
Auth:       Better Auth + GitHub OAuth (right audience — developers)
Cache:      Cloudflare KV
Assets:     Cloudflare R2
AI:         Cloudflare Workers AI (embedding generation)
```

This stack costs €0/month at the scale we're starting at. It is the canonical optimiser-pro implementation.

### Hybrid Search Engine (implement exactly — this is the key differentiator)

```
POST /api/search
{ query, category?, type?, is_paid?, sort?, limit?, offset? }

Internally:
1. Generate embedding for query via Workers AI (bge-base-en-v1.5)
2. Run vector search against Vectorize index → semantic_results[]
3. Run FTS5 keyword search against D1 → keyword_results[]
4. Merge via Reciprocal Rank Fusion:
   RRF_score = Σ 1 / (rank + 60) for each result list
5. Apply boost scoring:
   +0.3 if votes > 100
   +0.2 if downloads > 500
   +0.1 if author karma > 1000
   +0.1 if featured/editor-pick
6. Return merged, re-ranked results
Target latency: <800ms p95
```

### CLI Tool — `optimiser` (new npm package: `optimiser-cli`)

Build a CLI tool at `packages/cli/` mirroring SkillX's `skillx` CLI but scoped to Optimiser.World:

```bash
# Install
npm install -g optimiser-cli

# Search
optimiser search "conversion rate optimisation"
optimiser search "deploy agent" --category devops --type agent

# Install a skill into Claude Code project
optimiser install optimiser-pro
optimiser install ui-ux-pro-max --global

# Use an agent (download + print usage instructions)
optimiser use ga4-watchdog

# Report usage outcome (feeds the ranking algorithm)
optimiser report --outcome success --duration 1234
optimiser report --outcome failure --error "missing GA4 credentials"

# Auth
optimiser login          # GitHub OAuth → generates API key
optimiser config set OPTIMISER_API_KEY ok_prod_...
optimiser config get OPTIMISER_API_KEY
```

CLI commands map 1:1 to REST API endpoints. Token stored in `~/.optimiser/config.json`.

### Claude Code Plugin Marketplace

Add `.claude-plugin/marketplace.json` so users can install directly from Claude Code:

```bash
/plugin marketplace add optimiser/world
/plugin install optimiser-pro@optimiser-world
/plugin install ui-ux-pro-max@optimiser-world
/plugin install qa-engineer@optimiser-world
```

Plugin manifest follows SkillX's `.claude-plugin/` structure exactly.

### REST API Contract

```
# Public
POST /api/search              { query, category?, type?, sort?, limit?, offset? }
GET  /api/items/:slug         → { item, ratings, reviews, related }
GET  /api/leaderboard         → { items: [], total }
GET  /api/categories          → { categories: [] }

# Auth-protected (session or API key)
POST /api/items/:slug/vote    { direction: 'up' | 'down' }
DELETE /api/items/:slug/vote  (undo vote)
POST /api/items/:slug/rate    { score: 0-10 }
POST /api/items/:slug/review  { content }
POST /api/items/:slug/favorite
DELETE /api/items/:slug/favorite
POST /api/report              { outcome, duration_ms, item_slug }

# User
GET  /api/user/profile
GET  /api/user/api-keys
POST /api/user/api-keys       { name }
DELETE /api/user/api-keys/:id

# Submit
POST /api/submit              { title, description, type, category, tags, readme, files }
```

---

## STEP 4 — Product Definition

### What is an Agent?
An autonomous workflow that runs without human-in-the-loop. Examples:
- A Claude Code agent that monitors GA4 and alerts on conversion drops (Slack)
- A nightly agent that reads Airtable experiments and generates weekly summaries
- A deploy agent that watches Vercel builds and notifies on failures

### What is a Skill?
A reusable instruction set that enhances Claude Code's capabilities for a specific task. Examples:
- The optimiser-pro skill (architecture + design system)
- The ui-ux-pro-max skill (design intelligence engine)
- A QA engineer skill that reviews code before merging
- A brand-guidelines skill that enforces visual identity

### Community mechanics (Reddit-style + SkillX ratings)
- **Upvote / Downvote**: Any logged-in user can vote once per item (Reddit-style)
- **Rating (0–10)**: Separate from votes — a quality score after using the item (SkillX-style)
- **Karma**: Authors accumulate karma from upvotes + positive usage reports
- **Hot algorithm**: Score = (upvotes - downvotes) / (hours_since_posted ^ 1.5) — classic Reddit decay
- **Usage reporting**: CLI `optimiser report` feeds quality signals back into ranking
- **Rising**: Items gaining votes + reports faster than age suggests
- **New**: Chronological feed
- **Top**: All-time, filterable by week/month/year
- **Collections**: Curated sets by editors or community

---

## STEP 5 — Pages and Routes

### Public routes

**`/` — Landing**
- Full-viewport hero with CollectiveCanvas behind content
- Headline: "The internet's intelligence, organised."
- Sub: "Browse, vote, and deploy AI agents and skills built by the Optimiser community."
- CTA: "Browse marketplace" → /browse | "Upload yours" → /signup
- Stats strip: X agents, Y skills, Z total votes, N contributors
- Featured section: Top 3 items this week (large cards)
- Category preview: 6 category cards with icons and counts
- CTA section: "Ready to contribute?" with author benefits list

**`/search` — Semantic Search**
- Prominent search bar (full width, autofocus)
- Results update as you type (debounced 300ms → hybrid semantic + keyword)
- Each result: item card with relevance indicator
- Filters: category, type (agent/skill), sort (relevance/hot/new/top)
- Empty state: "No results for X — try Y or Z" with suggestions
- Search latency indicator: subtle "Searching intelligence..." while fetching

**`/browse` — Marketplace feed**
- Left sidebar: category filter + type filter (agents/skills/all) + sort (hot/new/top/rising)
- Main feed: card grid (masonry or uniform, settable in user prefs)
- Each card: thumbnail/icon, title, author, karma badge, vote widget, tag pills, short description, "Use" or "Download" CTA
- Right sidebar (desktop): Trending tags, Top contributors this week, Editor's picks
- Infinite scroll or paginated (50 per page)
- Sort toggle in header: Hot | New | Top (week/month/all) | Rising

**`/browse/:category` — Category feed**
Same as /browse but filtered and with category hero header

**`/item/:id` — Item detail**
- Hero: icon/banner, title, author card, vote widget (large), tags
- Tabs: Overview | README | Usage | Changelog | Discussion
- Overview: description, use cases, compatibility (Claude Code / Dispatch / etc.), version
- README: rendered markdown — the actual skill or agent documentation
- Usage: copy-paste install command, integration examples
- Discussion: threaded comments (Reddit-style, nested 2 levels)
- Sidebar: author profile, related items, "Used by X projects" count
- CTA: "Copy install command" (primary), "Star" (secondary), "Report"

**`/submit` — Upload form**
- Step 1: Type (Agent or Skill)
- Step 2: Basic info (title, short description, category, tags)
- Step 3: README upload (markdown editor with preview)
- Step 4: Files (SKILL.md or agent config + any supporting files)
- Step 5: Review and publish
- Validation: title required, description 50–300 chars, README required, at least one tag
- After submit: pending review state (auto-approved for karma > 100, moderated below)

**`/user/:username` — Profile**
- Avatar, name, karma score, member since, links
- Tabs: Submissions | Comments | Voted | Collections
- Submissions: their agents and skills, with stats (votes, downloads, comments)

**`/collections` — Collections browse**
- Curated sets displayed as large cards
- "Starter Kit" / "CRO Stack" / "DevOps Agents" etc.

**`/collection/:id` — Collection detail**
- Header: title, description, curator
- Item list with vote widgets

**`/trending` — Trending page**
- CollectiveCanvas at reduced opacity as background
- Top 10 items in each category, updated hourly
- "Trending tags" sidebar

### Authenticated routes

**`/dashboard` — User dashboard**
- My submissions: table with vote counts, view counts, last updated
- Notifications: new votes, comments, replies
- Drafts
- Stats: total karma, total downloads, followers

**`/submit` — Upload** (described above, requires auth)

**`/settings` — Settings**
- Profile, avatar, links, email, notification preferences

---

## STEP 5 — Key Components

```
landing/
  CollectiveCanvas.jsx       ← algorithmic art background
  HeroSection.jsx
  StatsStrip.jsx             ← live numbers: agents, skills, votes, contributors
  FeaturedCards.jsx          ← top 3 items this week
  CategoryGrid.jsx           ← 6 category preview cards

marketplace/
  ItemCard.jsx               ← the main card used throughout the feed
  VoteWidget.jsx             ← upvote/downvote with animated mint/red feedback
  TagPill.jsx                ← category/type tag, colour-coded
  KarmaBadge.jsx             ← author karma with tier icon (bronze/silver/gold/diamond)
  FeedSidebar.jsx            ← category filters, top contributors, trending tags
  ItemFeed.jsx               ← feed container with sort/filter controls
  DiscussionThread.jsx       ← Reddit-style nested comments, 2 levels deep
  ItemDetail.jsx             ← full item view with tabs

submit/
  SubmitWizard.jsx           ← multi-step upload form
  MarkdownEditor.jsx         ← write + preview tabs
  FileDropzone.jsx           ← drag-and-drop file upload

profile/
  ProfileHeader.jsx
  SubmissionTable.jsx
  ActivityFeed.jsx

ui/
  GlassCard.jsx
  MagneticButton.jsx
  SortToggle.jsx             ← Hot | New | Top | Rising pill toggle
  CategoryIcon.jsx           ← icon per category (CRO, DevOps, Content, Analytics...)
  PulseRing.jsx
  InfiniteScroll.jsx
  TabNav.jsx                 ← item detail tabs
```

---

## STEP 6 — Categories

Hard-code these categories with icons (Lucide) and colour accents:

```
CRO & Growth         → TrendingUp     → Accent-Mint
DevOps & Deploy      → Server         → Accent-Blue  
Content & Copy       → PenTool        → Accent-Violet
Analytics & Data     → BarChart2      → Accent-Amber
Design & UI          → Palette        → #EC4899 (Pink)
Product & Research   → Lightbulb      → #F97316 (Orange)
Finance & Ops        → DollarSign     → Accent-Amber
Starter Kits         → Package        → Accent-Mint
```

---

## STEP 7 — Vote Widget (critical UX)

This is the most-used component. Make it exceptional.

```jsx
// VoteWidget — behaviour spec
// - Upvote arrow: mint (#00E5A0) when active
// - Downvote arrow: red (#FF6B6B) when active
// - Score: displayed between arrows in Geist Mono
// - On vote: immediate optimistic update + pulse ring animation (150ms)
// - Score animation: number slides up/down on change (Framer Motion)
// - Disabled state: greyed when user has already voted (click to undo)
// - Large variant: used on /item/:id hero
// - Small variant: used on ItemCard in feed
// - Horizontal layout option: for comment votes
```

---

## STEP 8 — Mock Data

Populate the marketplace with realistic mock items.

**Mock agents (10+)**:
- "GA4 Conversion Watchdog" — CRO & Growth — 847 votes — by @srikant
- "Vercel Deploy Notifier" — DevOps — 612 votes
- "Airtable Weekly Digest" — Analytics — 589 votes
- "Slack Standup Bot" — Product — 445 votes
- "PostHog Funnel Alerter" — CRO & Growth — 398 votes
- "GitHub PR Reviewer" — DevOps — 341 votes

**Mock skills (10+)**:
- "optimiser-pro" — Design & UI — 1,204 votes — by @srikant
- "ui-ux-pro-max" — Design & UI — 987 votes — by @nextlevelbuilder
- "qa-engineer" — DevOps — 756 votes
- "brand-guidelines" — Design & UI — 634 votes
- "algorithmic-art" — Design & UI — 521 votes
- "doc-coauthoring" — Content — 489 votes

**Mock collections (3)**:
- "Sanjow Ventures Starter Kit" — 5 items — by @srikant
- "CRO Agent Stack" — 8 items — curated by editors
- "Design Intelligence Bundle" — 4 items

---

## STEP 9 — Quality bar

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py \
  "marketplace community voting platform" --domain checklist
```

Mandatory:
- [ ] Vote widget: keyboard accessible (arrow keys)
- [ ] Feed: renders correctly at 375px (single column) and 1440px (three column)
- [ ] Category filter: URL-synced (?category=cro&sort=hot)
- [ ] Item cards: truncate long titles at 2 lines, descriptions at 3 lines
- [ ] Karma tiers clearly visible (bronze < 100, silver < 1000, gold < 10000, diamond 10000+)
- [ ] CollectiveCanvas: pauses on prefers-reduced-motion
- [ ] No emojis as icons — Lucide only
- [ ] All vote interactions: optimistic UI updates
- [ ] Markdown in README tab: sanitised, no XSS

---

## STEP 10 — File structure target

```
optimiser.world/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── base44Client.js
│   ├── components/
│   │   ├── landing/
│   │   ├── marketplace/
│   │   ├── submit/
│   │   ├── profile/
│   │   └── ui/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useVote.js
│   │   └── useFeed.js
│   ├── lib/
│   │   ├── AuthContext.jsx
│   │   └── hotAlgorithm.js    ← Reddit hot score function
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Browse.jsx
│   │   ├── Category.jsx
│   │   ├── ItemDetail.jsx
│   │   ├── Submit.jsx
│   │   ├── Profile.jsx
│   │   ├── Collections.jsx
│   │   ├── CollectionDetail.jsx
│   │   ├── Trending.jsx
│   │   ├── Dashboard.jsx
│   │   └── Settings.jsx
│   ├── pages.config.js
│   ├── index.css
│   └── utils.js
├── design-system/
│   ├── MASTER.md
│   └── pages/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## STEP 11 — AgentBrain Integration (planned, not MVP)

Document this in `src/lib/agentbrain.md` and in the `/connect` settings page as "Coming Soon" — do not build the integration yet, but scaffold the architecture so it slots in cleanly later.

### What AgentBrain is
AgentBrain (agentbrain.sh) is an enterprise data hub CLI and API built by the same author as ui-ux-pro-max. It manages organisations, connectors, knowledge bases, workflows, and RBAC permissions via a REST API and `npm install -g agentbrain` CLI.

### Why it matters for optimiser.world
When AgentBrain reaches production stability, it becomes the backend runtime layer for the marketplace — replacing or augmenting the current Base44 setup:

| AgentBrain concept | optimiser.world use |
|---|---|
| **Connectors** | Data sources agents can read: GA4, PostHog, Supabase, Airtable, GitHub |
| **Knowledge Bases** | Versioned storage for skill/agent SKILL.md documentation with rollback |
| **Workflows** | The actual execution runtime for deployed agents (cron, event-triggered) |
| **Organisations** | Multi-tenant isolation per Sanjow client / optimiser.world user |
| **Permissions** | RBAC — who can deploy, edit, or view which agents |

### What to scaffold now

**1. Interface file** — `src/lib/agentbrain.ts`
```typescript
// AgentBrain integration — PLANNED, not active
// Wire up when agentbrain.sh reaches stable API release
// CLI: npm install -g agentbrain
// Docs: https://github.com/nextlevelbuilder/agentbrain-cli

export interface AgentBrainConnector {
  id: string
  name: string
  type: 'ga4' | 'posthog' | 'mixpanel' | 'supabase' | 'airtable' | 'github' | 'vercel'
  status: 'connected' | 'disconnected' | 'error'
}

export interface AgentBrainWorkflow {
  id: string
  name: string
  cron?: string
  steps: WorkflowStep[]
  status: 'active' | 'paused' | 'error'
  lastRun?: Date
  nextRun?: Date
}

export interface AgentBrainKnowledgeBase {
  id: string
  title: string
  versions: KnowledgeVersion[]
  currentVersion: string
}

// Placeholder — replace with real agentbrain SDK calls when available
export const agentbrain = {
  connectors: { list: async () => [], get: async (id: string) => null },
  workflows: { list: async () => [], run: async (id: string) => null },
  knowledge: { list: async () => [], get: async (id: string) => null },
}
```

**2. Settings page section** — Add to `/settings` under a "Integrations (Advanced)" section:

```
┌─────────────────────────────────────────────────────┐
│  AgentBrain Runtime                    Coming Soon   │
│                                                      │
│  Connect an AgentBrain hub to enable live agent      │
│  execution, versioned skill storage, and             │
│  multi-tenant connector management.                  │
│                                                      │
│  [Join waitlist →]                                   │
└─────────────────────────────────────────────────────┘
```

**3. Item detail page** — On the `/item/:id` page for agents, add a disabled "Deploy via AgentBrain" button alongside the existing "Copy install command" CTA. Tooltip: "Live deployment via AgentBrain runtime — coming soon."

**4. Architecture comment in README** — Add a `## Roadmap` section noting AgentBrain as the planned execution layer for v2.

### Revisit trigger
Watch https://github.com/nextlevelbuilder/agentbrain-cli for first stable release tag. When it appears, wire the `src/lib/agentbrain.ts` interfaces to the real API and replace the Base44 workflow layer.

---

## START HERE

1. Run STEP 0 (install skills, generate design system, read all skill files)
2. Generate CollectiveCanvas.jsx (STEP 2) — algorithmic art first
3. Implement the Reddit hot score algorithm in `src/lib/hotAlgorithm.js`
4. Build the VoteWidget (STEP 7) — get this perfect before anything else
5. Build ItemCard using VoteWidget — this is the atomic unit of the whole product
6. Build the Browse feed page with mock data
7. Build Landing page with CollectiveCanvas
8. Build ItemDetail page
9. Build Submit wizard
10. Build Profile and Dashboard pages
11. Run quality checklist on every page
12. `npm run build` — must pass with zero errors

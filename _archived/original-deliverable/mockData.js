// Mock marketplace data.
// Used when the live API is unreachable, and during development.
// Matches the API shape returned by /api/leaderboard and /api/items/:slug.

import { CATEGORIES } from './categories.js';

// ═══════════════════════════════════════════════════════════
// SKILLS & AGENTS
// ═══════════════════════════════════════════════════════════

const RAW = [
  { n:'optimiser-pro',     t:'skill', cat:3, v:1204, a:'srikant',     d:'Design-system scaffold skill — tokens, components, Tailwind config, production-ready React shells.', u:'4h',  runs:8423, dv:24,  stars:412 },
  { n:'ga4-watchdog',      t:'agent', cat:0, v:987,  a:'srikant',     d:'Monitors GA4 conversion anomalies and posts a daily diagnostic to Slack with suggested experiments.',   u:'6h',  runs:5612, dv:18,  stars:298 },
  { n:'qa-engineer',       t:'skill', cat:1, v:756,  a:'community',   d:'Quality assurance authority — writes E2E tests, reviews coverage, files structured bug reports.',       u:'12h', runs:4109, dv:31,  stars:267 },
  { n:'vercel-deploy',     t:'agent', cat:1, v:612,  a:'nextlevel',   d:'Watches Vercel deployments, summarises build failures, auto-retries transient errors.',              u:'18h', runs:3812, dv:14,  stars:189 },
  { n:'airtable-digest',   t:'agent', cat:2, v:589,  a:'tabletop',    d:'Weekly digest of Airtable base changes, new records, and schema diffs. Slack + email.',                u:'1d',  runs:2904, dv:9,   stars:156 },
  { n:'algorithmic-art',   t:'skill', cat:3, v:521,  a:'anthropic',   d:'Generative p5.js compositions with seeded randomness and parametric exploration.',                    u:'2d',  runs:2443, dv:12,  stars:234 },
  { n:'brand-guidelines',  t:'skill', cat:3, v:489,  a:'anthropic',   d:'Applies Anthropic brand tokens to artifacts — fonts, colour, spacing, components.',                    u:'3d',  runs:2201, dv:8,   stars:198 },
  { n:'posthog-alerter',   t:'agent', cat:0, v:398,  a:'hogpilot',    d:'Watches PostHog funnels, fires Slack alerts when step conversion drops >10% w/w.',                     u:'2d',  runs:1890, dv:15,  stars:142 },
  { n:'pr-reviewer',       t:'agent', cat:1, v:341,  a:'community',   d:'Reviews GitHub pull requests — style, test coverage, commit hygiene, bundle size.',                    u:'8h',  runs:1654, dv:22,  stars:118 },
  { n:'slack-standup',     t:'agent', cat:5, v:298,  a:'indie',       d:'Collects async standup replies, summarises by team, posts to #standup daily 9am.',                     u:'5h',  runs:1432, dv:6,   stars:89  },
  { n:'mcp-builder',       t:'skill', cat:6, v:267,  a:'anthropic',   d:'Scaffold for MCP servers — Python FastMCP and Node SDK patterns, tool design guidelines.',             u:'4d',  runs:1289, dv:5,   stars:176 },
  { n:'canvas-design',     t:'skill', cat:3, v:234,  a:'anthropic',   d:'Creates polished static visual art — posters, covers, design system docs.',                            u:'6d',  runs:1108, dv:7,   stars:98  },
  { n:'doc-coauthor',      t:'skill', cat:4, v:198,  a:'community',   d:'Structured workflow for co-authoring docs, proposals, technical specs.',                               u:'1w',  runs:987,  dv:11,  stars:73  },
  { n:'frontend-design',   t:'skill', cat:3, v:187,  a:'anthropic',   d:'Production-grade frontend interfaces — distinctive, non-generic component generation.',                u:'3d',  runs:912,  dv:9,   stars:124 },
  { n:'error-triager',     t:'agent', cat:1, v:156,  a:'opsflow',     d:'Groups Sentry errors, pings the right owner in Slack based on CODEOWNERS.',                            u:'11h', runs:742,  dv:4,   stars:67  },
  { n:'copy-polisher',     t:'agent', cat:4, v:143,  a:'wordsmith',   d:'Rewrites marketing copy for voice consistency — reads brand guidelines and applies.',                  u:'9h',  runs:689,  dv:10,  stars:54  },
  { n:'a11y-linter',       t:'agent', cat:3, v:121,  a:'community',   d:'Accessibility audits — WCAG violations, colour contrast, aria issues, keyboard flow.',                 u:'1d',  runs:601,  dv:3,   stars:82  },
  { n:'funnel-alerter',    t:'agent', cat:2, v:98,   a:'hogpilot',    d:'Detects funnel regressions across GA4, PostHog, and Mixpanel simultaneously.',                         u:'16h', runs:478,  dv:6,   stars:43  },
  { n:'weekly-digest',     t:'agent', cat:5, v:87,   a:'indie',       d:'Weekly product digest — shipped features, top bugs, cohort retention summary.',                       u:'2d',  runs:421,  dv:4,   stars:39  },
  { n:'pdf-skill',         t:'skill', cat:6, v:76,   a:'anthropic',   d:'PDF manipulation — merging, splitting, form-filling, OCR for scanned documents.',                     u:'1w',  runs:389,  dv:2,   stars:51  },
  { n:'file-reading',      t:'skill', cat:6, v:68,   a:'anthropic',   d:'Router for reading uploaded files — picks the right tool per format.',                                u:'1w',  runs:342,  dv:3,   stars:44  },
  { n:'recipe-display',    t:'skill', cat:4, v:54,   a:'community',   d:'Interactive recipe renderer — scalable servings, unit conversion, step timers.',                      u:'5d',  runs:298,  dv:5,   stars:28  },
  { n:'deploy-notifier',   t:'agent', cat:1, v:41,   a:'nextlevel',   d:'Slack notifications for Vercel, Netlify, Fly, and Railway deploys in one feed.',                       u:'14h', runs:201,  dv:3,   stars:22  },
  { n:'theme-factory',     t:'skill', cat:3, v:33,   a:'anthropic',   d:'Pre-set themes for artifacts — 10 curated palettes, on-the-fly generation.',                           u:'1w',  runs:167,  dv:1,   stars:19  },
  { n:'cost-watcher',      t:'agent', cat:2, v:29,   a:'opsflow',     d:'Monitors AWS / Vercel / Supabase billing, warns when a service spikes >2σ above baseline.',            u:'22h', runs:132,  dv:2,   stars:17  },
  { n:'cohort-builder',    t:'skill', cat:2, v:24,   a:'community',   d:'Builds retention cohorts from event tables — handles sparse data and late-arriving events.',           u:'3d',  runs:89,   dv:1,   stars:15  },
  { n:'tweet-digest',      t:'agent', cat:4, v:18,   a:'indie',       d:'Scrapes your Twitter lists into a morning digest, ranked by engagement velocity.',                     u:'6h',  runs:67,   dv:2,   stars:9   },
];

// Hydrate with full records
export const ITEMS = RAW.map((r) => {
  const category = CATEGORIES[r.cat];
  return {
    slug: r.n,
    title: r.n,
    short_description: r.d,
    description: r.d,
    readme: generateReadme(r, category),
    type: r.t,
    category: category.slug,
    category_obj: category,
    tags: generateTags(r, category),
    author: {
      id: `user_${r.a}`,
      username: r.a,
      display_name: r.a === 'srikant' ? 'Srikant VK' : r.a === 'anthropic' ? 'Anthropic' : r.a === 'nextlevel' ? 'Next Level Builder' : r.a,
      karma: r.a === 'srikant' ? 8420 : r.a === 'anthropic' ? 24900 : r.a === 'community' ? 2100 : 890,
    },
    stats: {
      upvotes: r.v,
      downvotes: r.dv,
      downloads: r.runs,
      rating: 4.2 + Math.random() * 0.7,
      rating_count: Math.floor(r.runs / 40),
    },
    github_stars: r.stars,
    github_forks: Math.floor(r.stars / 5),
    github_url: `https://github.com/${r.a}/${r.n}`,
    install_command: `npx @optimiser/install ${r.n}`,
    version: '1.2.0',
    featured: r.v > 400,
    is_hot: r.v > 400,
    created_at: new Date(Date.now() - (30 + Math.random() * 200) * 86400000).toISOString(),
    updated_at: r.u,
    // Fake vote-velocity history (for sparklines)
    history: generateHistory(r.v),
  };
});

function generateTags(r, category) {
  const base = [category.short.toLowerCase()];
  if (r.t === 'agent') base.push('automation');
  if (r.t === 'skill') base.push('claude-code');
  if (r.a === 'anthropic') base.push('official');
  if (r.v > 500) base.push('popular');
  return base.slice(0, 4);
}

function generateHistory(peak) {
  const points = 30;
  const arr = [];
  let current = Math.floor(peak * 0.6);
  for (let i = 0; i < points; i++) {
    const growth = (peak - current) * 0.05 + (Math.random() - 0.3) * peak * 0.02;
    current = Math.max(0, current + growth);
    arr.push(Math.round(current));
  }
  arr[arr.length - 1] = peak;
  return arr;
}

function generateReadme(r, category) {
  return `# ${r.n}

${r.d}

## Installation

\`\`\`bash
npx @optimiser/install ${r.n}
\`\`\`

This will scaffold the ${r.t} into your \`.claude/${r.t}s/${r.n}/\` directory.

## What it does

The \`${r.n}\` ${r.t} handles a common pattern in ${category.name.toLowerCase()} work:
${r.d}

It's designed to run either standalone (via the Optimiser CLI) or as part of a larger agent pipeline. Most teams use it as a drop-in replacement for the manual workflow it automates.

## Usage

After install, invoke with:

\`\`\`bash
optimiser use ${r.n}
\`\`\`

For advanced configuration, edit \`.claude/${r.t}s/${r.n}/config.yaml\`.

## Configuration

The ${r.t} accepts these configuration keys:

- \`trigger\`: When to run — \`cron\`, \`on-push\`, or \`manual\` (default: \`manual\`)
- \`verbose\`: Enable detailed logging (default: \`false\`)
- \`slack_channel\`: Override default Slack destination

## Changelog

**v1.2.0** — Added support for nested workflows and improved error messages.
**v1.1.0** — Initial public release.

## Contributing

Found a bug or want a feature? Open an issue on the [GitHub repo](https://github.com/${r.a}/${r.n}).

## License

MIT. Use freely in commercial and open-source projects.
`;
}

// ═══════════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════════

export const COLLECTIONS = [
  {
    slug: 'sanjow-starter',
    title: 'Sanjow Ventures starter kit',
    description: 'The exact five skills that ship on day one of every Sanjow project. Tested in anger, battered into shape.',
    curator: 'srikant',
    items: ['optimiser-pro', 'qa-engineer', 'brand-guidelines', 'frontend-design', 'ga4-watchdog'],
    upvotes: 412,
  },
  {
    slug: 'cro-stack',
    title: 'CRO agent stack',
    description: 'Eight agents that together monitor, diagnose, and auto-suggest experiments across the full funnel.',
    curator: 'community',
    items: ['ga4-watchdog', 'posthog-alerter', 'funnel-alerter', 'a11y-linter', 'optimiser-pro', 'copy-polisher', 'cohort-builder', 'airtable-digest'],
    upvotes: 298,
  },
  {
    slug: 'design-intelligence',
    title: 'Design intelligence bundle',
    description: 'Everything needed to ship a distinctive, production-grade frontend without the usual generic output.',
    curator: 'anthropic',
    items: ['optimiser-pro', 'frontend-design', 'brand-guidelines', 'theme-factory', 'canvas-design', 'algorithmic-art'],
    upvotes: 256,
  },
  {
    slug: 'devops-essentials',
    title: 'DevOps essentials',
    description: 'Four agents that quietly run the plumbing — so you never get paged at 3am for a transient timeout again.',
    curator: 'nextlevel',
    items: ['vercel-deploy', 'pr-reviewer', 'error-triager', 'deploy-notifier'],
    upvotes: 187,
  },
];

// Hydrate collection items
COLLECTIONS.forEach((col) => {
  col.resolved = col.items.map((slug) => ITEMS.find((i) => i.slug === slug)).filter(Boolean);
});

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export function findBySlug(slug) {
  return ITEMS.find((i) => i.slug === slug);
}

export function getByCategory(categorySlug) {
  return ITEMS.filter((i) => i.category === categorySlug);
}

export function getByType(type) {
  return ITEMS.filter((i) => i.type === type);
}

export function getTopItems(n = 10) {
  return [...ITEMS].sort((a, b) => b.stats.upvotes - a.stats.upvotes).slice(0, n);
}

export function getHot(n = 10) {
  // Reddit-ish hot score
  return [...ITEMS]
    .map((i) => {
      const ageHours = Math.max(1, (Date.now() - new Date(i.created_at).getTime()) / 3600000);
      const net = i.stats.upvotes - i.stats.downvotes;
      return { ...i, hot: net / Math.pow(ageHours, 1.2) };
    })
    .sort((a, b) => b.hot - a.hot)
    .slice(0, n);
}

export function getRising(n = 10) {
  // Most recently updated with positive velocity
  return [...ITEMS]
    .filter((i) => ['4h', '6h', '8h', '9h', '11h', '12h'].includes(i.updated_at))
    .sort((a, b) => b.stats.upvotes - a.stats.upvotes)
    .slice(0, n);
}

// Trending tags (aggregated)
export function getTrendingTags() {
  const counts = {};
  for (const item of ITEMS) {
    for (const tag of item.tags) {
      counts[tag] = (counts[tag] || 0) + item.stats.upvotes;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, score]) => ({ tag, score }));
}

export function getTopContributors() {
  const byUser = {};
  for (const item of ITEMS) {
    const a = item.author.username;
    if (!byUser[a]) {
      byUser[a] = { username: a, display_name: item.author.display_name, karma: item.author.karma, items: 0, upvotes: 0 };
    }
    byUser[a].items++;
    byUser[a].upvotes += item.stats.upvotes;
  }
  return Object.values(byUser).sort((a, b) => b.karma - a.karma).slice(0, 8);
}

// Featured this week — top 3 by hot score
export function getFeatured() {
  return getHot(3);
}

// Stats strip
export function getStats() {
  return {
    skills: ITEMS.filter((i) => i.type === 'skill').length * 180 + 1847,
    agents: ITEMS.filter((i) => i.type === 'agent').length * 94 + 423,
    total_votes: ITEMS.reduce((sum, i) => sum + i.stats.upvotes, 0) * 4,
    contributors: 312,
  };
}

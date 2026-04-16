# GitHub Scraper System

This is a production-grade GitHub scraper that auto-discovers Claude Code skills and AI agents from public GitHub repositories, validates them, scores them based on quality signals, and ingests them into the Optimiser.World marketplace.

## Architecture Overview

The scraper runs as a Cloudflare Worker cron job and executes the following pipeline:

1. **Search** (`github.js`) — Query GitHub API for repos matching skill/agent patterns
2. **Validate** (`validator.js`) — Check if repos are actually Claude Code skills or AI agents
3. **Score** (`scorer.js`) — Rate repos on quality metrics (stars, activity, docs, community signals)
4. **Categorize** (`scorer.js`) — Auto-classify repos into marketplace categories
5. **Ingest** (`ingester.js`) — Insert/update items in D1 database and index embeddings in Vectorize

## Files

### Core Modules

- **index.js** — Main orchestrator that runs the complete pipeline
- **queries.js** — GitHub search queries for discovery (16 standard + 4 high-quality)
- **github.js** — GitHub REST API client with rate limiting and raw file fetching
- **validator.js** — Validates repos as legitimate skills/agents using signal weighting
- **scorer.js** — Scores repos on a 0-100 scale based on 5 quality categories
- **ingester.js** — Transforms validated repos into marketplace items and indexes them

## How It Works

### Discovery (Queries)

The scraper uses 20 different GitHub search queries targeting:
- **Claude Code patterns**: SKILL.md files, `.claude/` directories, keyword searches
- **MCP servers**: Model Context Protocol packages, topics, keywords
- **AI agents**: AI automation repos with sufficient engagement
- **Prompt/skill libraries**: High-quality prompt collections
- **Workflow automation**: Multi-component automation systems

See `queries.js` for the complete list.

### Validation (Signals)

Each repo is scored on these signals:
- `has-skill-md` (+40) — Found SKILL.md in repo
- `claude-skills-dir` (+35) — Has `.claude/skills/` directory
- `claude-agents-dir` (+35) — Has `.claude/agents/` directory
- `mcp-dependencies` (+30) — Has MCP SDK dependencies
- `python-mcp` (+30) — Has FastMCP Python package
- `readme-keywords-strong` (+20) — README mentions 2+ relevant keywords
- `readme-keywords-weak` (+10) — README mentions 1 relevant keyword
- `relevant-topics` (+15 per topic) — GitHub topics match skill/agent keywords
- `low-stars` (-20) — Less than 2 stars (minimum threshold)
- `archived` (-50) — Repo is archived
- `low-quality-fork` (-30) — Fork with <10 stars

**Minimum threshold: 30 points** for acceptance into marketplace.

### Scoring (Quality)

Each accepted repo is scored on a 0-100 scale:

| Category | Points | Factors |
|----------|--------|---------|
| **Popularity** | 0-25 | Stars (log), forks (weighted higher), watchers |
| **Freshness** | 0-20 | Days since last push (recent = 20pts) |
| **Documentation** | 0-20 | README length, sections, code examples, license |
| **Validation Confidence** | 0-20 | How clearly validated as skill/agent |
| **Community** | 0-15 | Issues, wiki, originality, activity level, tagging |

**Tiers:**
- **Featured**: 70+ points
- **Quality**: 50-69 points
- **Standard**: 30-49 points
- **New**: <30 points

### Categorization

Repos are auto-classified into categories based on keyword presence in description, README, and topics:
- `cro-growth` — Conversion rate optimization
- `devops` — Deployment, CI/CD, infrastructure
- `content` — Content, writing, SEO, marketing
- `analytics` — Data, dashboards, metrics, monitoring
- `design` — UI/UX, design systems, components
- `product` — Product research, roadmaps (default)
- `finance` — Billing, payments, accounting
- `starter-kits` — Boilerplate, templates, scaffolding

### Ingestion

For each validated & scored repo:
1. **Database**: Insert into `items` table or update if exists
2. **Seeding**: Seed rating/upvote counts from GitHub stars for initial engagement
3. **Embedding**: Generate text embedding for semantic search via Workers AI
4. **Vector Index**: Upsert into Vectorize for similarity search

## Running the Scraper

### Automatic (Cron)

The scraper runs automatically on these schedules:
- **Every 6 hours** (`0 */6 * * *`) — Standard discovery scrape
- **Every Sunday at midnight UTC** (`0 0 * * 0`) — Full deep scrape with high-quality queries

### Manual (Admin API)

Trigger a scrape run manually:

```bash
# Standard scrape
curl -X POST https://api.optimiser.world/api/admin/scrape \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"

# Full scrape (includes high-quality queries)
curl -X POST https://api.optimiser.world/api/admin/scrape?full=true \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"
```

Get the last scrape statistics:

```bash
curl https://api.optimiser.world/api/admin/scraper-stats \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"
```

## Configuration

### Environment Variables

**Required:**
- `GITHUB_TOKEN` — GitHub Personal Access Token for API requests (secret)
  - Run: `wrangler secret put GITHUB_TOKEN`
  - Needs: `public_repo` scope (read-only)

**Optional:**
- `ADMIN_KEY` — Key for triggering manual scrapes (default: development key)

### Database Bindings

The scraper uses:
- **D1 (sqlite)** — Stores items and scraper run logs
- **KV Cache** — Stores last run statistics for monitoring
- **Vectorize** — Indexes item embeddings for semantic search
- **Workers AI** — Generates embeddings for items

## Database Schema

### items table

Additional columns added by scraper:
```sql
github_owner TEXT,
github_repo TEXT,
github_url TEXT,
github_stars INTEGER,
github_forks INTEGER,
quality_score INTEGER,
scraped_at DATETIME
```

### scraper_runs table

Logs each scraper execution:
```sql
CREATE TABLE scraper_runs (
  id INTEGER PRIMARY KEY,
  started_at TEXT,
  finished_at TEXT,
  queries_run INTEGER,
  repos_found INTEGER,
  validated INTEGER,
  rejected INTEGER,
  ingested INTEGER,
  updated INTEGER,
  errors INTEGER,
  duration_ms INTEGER
)
```

## Performance & Limits

### Rate Limiting

GitHub API has these limits:
- **Authenticated**: 5,000 requests/hour
- **Per request**: Returns remaining quota in `x-ratelimit-remaining` header

The scraper:
- Paces requests 300ms apart
- Pauses between queries 1000ms
- Waits if rate limit drops below 10 remaining

### Query Performance

- **Per query**: Fetches up to 60 results (2 pages × 30 results)
- **Validation**: ~2-3 HTTP calls per repo (README, package.json, etc.)
- **Total per run**: ~500 HTTP calls (varies by hit rate)
- **Runtime**: ~3-5 minutes for standard scrape, ~10-15 minutes for full scrape

## Monitoring

### Logs

Scraper logs to stdout with `[scraper]` prefix:
```
[scraper] Starting scraper run at 2024-01-15T08:00:00Z
[scraper] Running query 1/16: claude-skills-direct
[scraper] created: anthropic-tools-ai-agent (score: 72, tier: featured)
[scraper] Complete: {...stats}
```

### Statistics

Last run stats are stored in KV cache and queryable via admin endpoint:
```json
{
  "queriesRun": 20,
  "reposFound": 156,
  "validated": 98,
  "rejected": 58,
  "ingested": 45,
  "updated": 12,
  "skipped": 41,
  "errors": 2,
  "startedAt": "2024-01-15T08:00:00Z",
  "finishedAt": "2024-01-15T08:12:34Z",
  "duration": 754,
  "queryDetails": [...]
}
```

### Database Logs

Query the `scraper_runs` table to view historical execution:
```sql
SELECT * FROM scraper_runs ORDER BY started_at DESC LIMIT 10;
```

## Deduplication

The scraper maintains a set of already-seen repos to avoid re-processing:

1. **Per-run tracking** — Skips repos seen in same run
2. **Database check** — Queries `items.scraped_at` to find previously ingested items
3. **Timestamp check** — Skips if database item is newer than GitHub `pushed_at`

This prevents wasted API calls and database writes for unchanged repos.

## Error Handling

The scraper is resilient:
- **Per-repo errors**: Logged and counted, but don't stop the run
- **Query errors**: Logged and counted, next query proceeds
- **Rate limit hits**: Pauses and retries
- **Network errors**: GitHub client retries with exponential backoff

If a critical error occurs (missing env vars, DB connection), the entire run fails fast.

## Future Improvements

- [ ] Cache GitHub API responses in KV to reduce quota usage
- [ ] Implement incremental indexing (only re-index changed items)
- [ ] Add per-category thresholds (e.g., higher bar for featured)
- [ ] Track contributor metrics (team size, contribution frequency)
- [ ] Implement feedback loop (downrank poorly-rated items)
- [ ] Auto-claim repos for verified maintainers
- [ ] Add webhook support for real-time updates
- [ ] Implement duplicate detection (similar repos)

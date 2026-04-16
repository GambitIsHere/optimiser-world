# Implementation Guide — Optimiser.World API

This guide covers setup, deployment, testing, and integration with the frontend.

## Quick Start

### 1. Initial Setup

```bash
cd api
npm install
```

### 2. Configure Cloudflare Account

You'll need:

1. **D1 Database**
   ```bash
   wrangler d1 create optimiser-db
   ```
   Copy the returned `database_id` into `wrangler.toml`

2. **KV Namespace** (for caching)
   ```bash
   wrangler kv:namespace create CACHE
   ```
   Copy the returned namespace ID into `wrangler.toml`

3. **Vectorize Index** (optional, for semantic search)
   ```bash
   wrangler vectorize create optimiser-embeddings \
     --preset @cf/baai/bge-base-en-v1.5
   ```
   Copy the returned index name into `wrangler.toml`

### 3. Create Database Schema

```bash
npm run db:migrate
```

This runs `src/db/schema.sql` against your D1 database. Tables, indexes, and FTS5 will be created.

### 4. Development Server

```bash
npm run dev
```

Server runs on `http://localhost:8787`. Check health:
```bash
curl http://localhost:8787/api/health
```

## Architecture Deep Dive

### Hybrid Search Implementation

The search engine is the most complex component. Here's how it works:

#### Search Flow

1. **Request arrives:** `POST /api/search { query, category, type, sort, limit, offset }`

2. **Semantic Search (async)**
   - Query text is sent to `@cf/baai/bge-base-en-v1.5` for embedding
   - Embedding is used to query Vectorize index for similar items
   - Returns top K semantic results sorted by similarity

3. **Keyword Search (parallel async)**
   - Query is transformed into FTS5 format: `"term1"* OR "term2"*`
   - FTS5 ranks results by relevance
   - Returns top K keyword results

4. **Reciprocal Rank Fusion**
   - Both result lists are merged via RRF formula
   - RRF score = Σ 1/(rank + 60) across both lists
   - Items appearing in both lists get higher scores
   - Results re-sorted by combined RRF score

5. **Boost Scoring**
   - Applied on top of RRF score
   - Boosts based on:
     - Popularity (upvotes > 100, 50, 20)
     - Downloads (>1000, >500, >100)
     - Author karma (>1000, >500, >100)
     - User ratings (avg >= 9, 8)
     - Featured status (+0.25)
     - Recency (<7 days, <3 days)

6. **Final Ranking**
   - Results sorted by: RRF score + boost
   - Apply sort filter (relevance/hot/new/top)
   - Apply category/type filters
   - Paginate (offset, limit)

7. **Response**
   - Return full item objects with stats
   - Include pagination metadata
   - Return debug info in dev mode

#### Why RRF Works

- **Robustness:** If semantic search fails (Vectorize down), keyword search still works
- **Quality:** Combines multiple ranking signals (semantics + keywords)
- **Fairness:** Pure ranking function, no relevance feedback bias
- **Simplicity:** O(n log n) merge operation, scales well

#### Tuning RRF

In `src/lib/rrf.js`:
```javascript
export function reciprocalRankFusion(semanticResults, keywordResults, k = 60)
```

The `k` constant (default 60) prevents rank 0 from dominating. Higher k = more balanced weighting of semantic vs keyword. Experiment with k=30-100.

### Database Queries Optimization

All queries use prepared statements with bindings to prevent SQL injection:

```javascript
db.prepare('SELECT * FROM items WHERE slug = ? AND status = ?')
  .bind(slug, 'published')
  .first()
```

#### Query Patterns

**Direct lookup:**
```javascript
const item = await db.prepare('SELECT * FROM items WHERE slug = ?')
  .bind(slug).first()
```

**With joins:**
```javascript
const results = await db.prepare(`
  SELECT i.*, u.username, u.karma
  FROM items i
  JOIN users u ON i.author_id = u.id
  WHERE i.category = ?
`).bind(category).all()
```

**FTS search:**
```javascript
const ftsQuery = '"term1"* OR "term2"*'
const results = await db.prepare(`
  SELECT i.* FROM items_fts fts
  JOIN items i ON fts.rowid = i.id
  WHERE items_fts MATCH ?
`).bind(ftsQuery).all()
```

**Aggregates:**
```javascript
const stats = await db.prepare(`
  SELECT
    COUNT(*) as total,
    SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END) as successes
  FROM usage_reports
  WHERE item_id = ?
`).bind(item_id).first()
```

#### Creating Indexes

Indexes are defined in `schema.sql`. Add new indexes:

```sql
CREATE INDEX idx_items_updated ON items(updated_at DESC);
```

Key indexes already included:
- `items(slug)` — slug lookups
- `items(category, type, status)` — filtering
- `votes(user_id, item_id)` — voting uniqueness
- `ratings(user_id, item_id)` — rating uniqueness

### Authentication Flow

1. User generates API key via `POST /api/user/api-keys`
   - Plaintext key is returned ONLY ONCE
   - Key is hashed (SHA-256) and stored in DB
   - Prefix is stored for identification

2. Client includes API key in requests:
   ```bash
   curl -H "X-API-Key: opt_xxxxx" https://api.optimiser.world/api/user/profile
   ```

3. Server verifies key:
   - Hash incoming key
   - Look up in `api_keys` table
   - Load associated user from `users` table
   - Set `c.set('user', {...})`

4. Protected route handlers call `getUser(c)` to get user context

#### Adding OAuth (Future)

Would use Better Auth library:

```javascript
import { betterAuth } from "better-auth"

const auth = new BetterAuth({
  database: d1Database,
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    }
  }
})

app.route('/auth', auth.handler)
```

### Embedding Generation

When items are submitted:

1. Combine title + description + tags into embedding text
2. Send to `@cf/baai/bge-base-en-v1.5` for embedding
3. Upsert into Vectorize index with item metadata

Embeddings are generated **asynchronously** (fire-and-forget) to not block submission response.

If embedding generation fails, search still works via FTS only.

### Scoring Algorithms

Implemented in `src/lib/scoring.js`:

#### Hot Score
```
hot_score = (upvotes - downvotes) / hours_age^1.5
```
- Fresh items with good votes rank high
- Older items decay over time
- Used for homepage feed

#### Rising Score
```
rising_score = (votes / hours) * log2(votes)
```
- Emphasizes velocity (votes per hour)
- Highlights trending content
- Used for "trending" page

#### Top Score
```
top_score = (upvotes - downvotes) / months_age^0.25
```
- Cumulative votes with light time decay
- Used for "best of all time"

#### Quality Score
```
quality_score = net_votes * 0.5 + rating * 10 + log(downloads) * 5 + ...
```
- Multi-signal blended score
- Used for curated lists

#### Bayesian Confidence
```
weighted_avg = (count * avg + 10 * global_avg) / (count + 10)
```
- Accounts for sample size
- Prevents items with few high ratings from gaming

## Testing

### Manual Testing

#### Search
```bash
curl -X POST http://localhost:8787/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "python agent", "limit": 5}'
```

#### Create Item (requires API key)
```bash
# First, get API key
curl -X POST http://localhost:8787/api/user/api-keys \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"name": "Test Key"}'

# Then submit item
curl -X POST http://localhost:8787/api/submit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_xxxxx" \
  -d '{
    "title": "My Test Agent",
    "short_description": "A test agent",
    "type": "agent",
    "category": "testing"
  }'
```

#### Vote
```bash
curl -X POST http://localhost:8787/api/items/test-slug/vote \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_xxxxx" \
  -d '{"direction": "up"}'
```

#### Get Leaderboard
```bash
curl 'http://localhost:8787/api/leaderboard?sort=hot&limit=10'
```

### Unit Testing (Future)

Set up Jest or Vitest:

```bash
npm install --save-dev vitest
```

Example test:
```javascript
import { describe, it, expect } from 'vitest'
import { reciprocalRankFusion } from '../src/lib/rrf'

describe('RRF', () => {
  it('should merge and rank results', () => {
    const semantic = [
      { id: '1', title: 'Item 1' },
      { id: '2', title: 'Item 2' }
    ]
    const keyword = [
      { id: '2', title: 'Item 2' },
      { id: '3', title: 'Item 3' }
    ]
    
    const result = reciprocalRankFusion(semantic, keyword)
    expect(result[0].id).toBe('2') // In both lists
  })
})
```

## Deployment

### To Cloudflare Workers

```bash
npm run deploy
```

This builds and deploys to your Cloudflare Workers project.

### Environment-Specific Configuration

**Development** (default):
```toml
[env.development]
vars = { ENVIRONMENT = "development" }
```

**Production**:
```toml
[env.production]
vars = { ENVIRONMENT = "production" }
```

Deploy to production:
```bash
wrangler deploy --env production
```

### Database Migration in Production

```bash
wrangler d1 execute optimiser-db --remote --file=./src/db/schema.sql
```

### Monitoring

Set up Cloudflare Analytics to track:
- Request count
- Error rates
- Latency percentiles
- Status code distribution

Custom metrics can be logged:
```javascript
console.log(JSON.stringify({
  type: 'metric',
  name: 'search_rff_score',
  value: item.rffScore,
  tags: { query_length: query.length }
}))
```

## Frontend Integration

### API Client Setup

```javascript
const API_BASE = 'https://api.optimiser.world'

export async function search(query, filters = {}) {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': localStorage.getItem('apiKey')
    },
    body: JSON.stringify({ query, ...filters })
  })
  return res.json()
}

export async function getItem(slug) {
  const res = await fetch(`${API_BASE}/api/items/${slug}`, {
    headers: {
      'X-API-Key': localStorage.getItem('apiKey')
    }
  })
  return res.json()
}

export async function vote(slug, direction) {
  const res = await fetch(`${API_BASE}/api/items/${slug}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': localStorage.getItem('apiKey')
    },
    body: JSON.stringify({ direction })
  })
  return res.json()
}
```

### Error Handling

```javascript
async function apiCall(url, options = {}) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || `HTTP ${res.status}`)
    }
    return await res.json()
  } catch (e) {
    console.error('API error:', e)
    throw e
  }
}
```

### Pagination Pattern

```javascript
async function* paginate(endpoint, limit = 20) {
  let offset = 0
  while (true) {
    const res = await fetch(
      `${API_BASE}${endpoint}?limit=${limit}&offset=${offset}`
    )
    const data = await res.json()
    yield data.items || data.results
    if (!data.pagination?.has_more) break
    offset += limit
  }
}

// Usage:
for await (const items of paginate('/api/leaderboard')) {
  console.log(items)
}
```

## Troubleshooting

### Search returns 0 results
- Check FTS index: `SELECT COUNT(*) FROM items_fts`
- Check that items have status='published'
- Try simpler query

### Vote not working
- Verify API key is valid
- Check user owns an account (has user_id in votes table)
- Verify item exists and is published

### Embedding generation failing
- Check Workers AI is enabled in account
- Check rate limits (100 requests/minute)
- FTS search will still work as fallback

### Database locked error
- D1 has concurrency limits
- Retry the request
- Consider implementing exponential backoff

## Performance Tuning

### Search Optimization

If search is slow:

1. Check FTS index size: `SELECT page_count * page_size FROM pragma_page_count(), pragma_page_size()`
2. Rebuild FTS if necessary: `INSERT INTO items_fts(items_fts) VALUES('rebuild')`
3. Consider pagination: don't fetch all results at once
4. Cache popular queries in KV

### Database Optimization

1. **Analyze query plans:**
   ```sql
   EXPLAIN QUERY PLAN SELECT ...
   ```

2. **Add indexes for new filters:**
   ```sql
   CREATE INDEX idx_items_custom ON items(custom_field)
   ```

3. **Monitor connection pool:**
   - D1 has max concurrent connections
   - Implement request queuing if bottleneck

### API Response Time

Target latencies:
- Search: <800ms p95
- Item lookup: <100ms p95
- Leaderboard: <200ms p95
- User profile: <100ms p95

Use Cloudflare Analytics to monitor actual latencies.

## Security Checklist

- [ ] API keys hashed before storage (SHA-256)
- [ ] All queries use parameterized statements
- [ ] CORS restricted to frontend domains
- [ ] Rate limiting implemented (future)
- [ ] Input validation on all endpoints
- [ ] SQL injection tests passed
- [ ] XSS prevention verified
- [ ] HTTPS enforced in production
- [ ] Secrets not committed to git
- [ ] Admin endpoints protected

## Next Steps

1. **Test locally** — run `npm run dev` and verify endpoints
2. **Set up D1** — create database and run migrations
3. **Configure Cloudflare** — add KV, Vectorize, Workers AI
4. **Deploy** — run `npm run deploy`
5. **Monitor** — set up analytics and error tracking
6. **Iterate** — collect user feedback and optimize

## Support

For technical issues:
- Check Cloudflare documentation
- Review D1 SQL dialect limitations
- Look at Hono middleware examples
- Check your Wrangler version

Current known issues:
- D1 SQL dialect is SQLite, not all features available
- Vectorize requires Vectorize index creation before use
- Workers AI has rate limits (check account)

# Optimiser.World API

Production-grade Cloudflare Workers + D1 backend for Optimiser.World, a Reddit-style marketplace for AI agents and skills.

## Overview

Built with:
- **Hono.js** — lightweight web framework optimized for Cloudflare Workers
- **Cloudflare D1** — serverless SQLite database
- **Cloudflare Workers AI** — embedding generation for semantic search
- **Cloudflare Vectorize** — vector indexing for hybrid search
- **Cloudflare KV** — distributed caching layer
- **Cloudflare R2** — asset storage

## Architecture

### Hybrid Search (Search Engine)

The search system implements **Reciprocal Rank Fusion (RRF)** to combine:

1. **Semantic Search** — via Workers AI embeddings + Vectorize vector index
2. **Keyword Search** — via FTS5 full-text search on D1

Results from both methods are merged using the RRF formula:
```
RRF_score = Σ 1 / (rank + 60) for each result list
```

This approach provides:
- Fast semantic understanding of queries
- Precise keyword matching for exact searches
- Resilience — if one method fails, the other still works
- High-quality ranked results combining both signals

**Target latency:** <800ms p95

### Ranking & Scoring

Multiple ranking algorithms are available:

- **Hot Score** — time-decay based (default for discovery)
- **Rising Score** — vote velocity (for trending)
- **Top Score** — cumulative votes (for best of all time)
- **Quality Score** — multi-signal blended score
- **Bayesian Confidence** — accounts for sample size

Plus dynamic boost scoring based on:
- Popularity (net votes)
- Download frequency
- Author reputation (karma)
- User ratings
- Featured status
- Recency

## API Endpoints

### Search

#### `POST /api/search`
Hybrid semantic + keyword search

**Request:**
```json
{
  "query": "python agent for data analysis",
  "category": "agents",
  "type": "agent",
  "sort": "relevance",
  "limit": 20,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "query": "python agent for data analysis",
  "results": [
    {
      "id": "item_...",
      "slug": "data-analyzer",
      "title": "Data Analyzer Agent",
      "short_description": "...",
      "type": "agent",
      "category": "data-analysis",
      "tags": ["python", "data", "analysis"],
      "author": {
        "id": "user_...",
        "username": "john",
        "karma": 250
      },
      "stats": {
        "upvotes": 42,
        "downvotes": 2,
        "downloads": 156,
        "rating": 4.8,
        "rating_count": 25
      },
      "featured": false,
      "version": "1.2.0",
      "icon_url": "...",
      "is_favorited": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-03-10T14:22:00Z"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 156,
    "has_more": true
  },
  "filters_applied": {
    "category": "agents",
    "type": "agent",
    "sort": "relevance"
  }
}
```

#### `GET /api/search/suggestions?q=python`
Autocomplete suggestions

### Items (Full CRUD + Interactions)

#### `GET /api/items/:slug`
Get full item details with reviews and comments

#### `POST /api/items/:slug/vote`
Vote on an item (upvote/downvote)

**Request:** `{ "direction": "up" | "down" }`

Toggle behavior:
- Same direction = undo vote
- Different direction = switch vote

#### `POST /api/items/:slug/rate`
Rate an item (0-10 scale)

**Request:** `{ "score": 8 }`

#### `POST /api/items/:slug/review`
Write a review

**Request:** `{ "content": "Great tool, very intuitive!" }`

#### `POST /api/items/:slug/favorite`
Add/remove from favorites

#### `GET /api/items/:slug/comments`
List comments on an item

#### `POST /api/items/:slug/comment`
Add a comment

**Request:** `{ "content": "...", "parent_id": "optional" }`

### Feed & Discovery

#### `GET /api/leaderboard`
Paginated feed with multiple sort options

**Query params:**
- `sort` — hot, new, top, rising (default: hot)
- `category` — filter by category
- `type` — agent or skill
- `timeframe` — day, week, month, all
- `limit` — 1-100 (default: 20)
- `offset` — pagination offset

#### `GET /api/categories`
List all categories with item counts

#### `GET /api/trending`
Trending items (rising score)

#### `GET /api/featured`
Featured/curated items

### User Management

#### `GET /api/user/profile`
Get current authenticated user's profile

**Headers:** `X-API-Key: your-api-key`

#### `PATCH /api/user/profile`
Update profile (display_name, avatar_url, bio)

#### `GET /api/user/api-keys`
List user's API keys (prefix only)

#### `POST /api/user/api-keys`
Generate new API key

**Request:** `{ "name": "Development Key" }`

**Response:** Full key (returned ONLY once, cannot be retrieved)

#### `DELETE /api/user/api-keys/:id`
Revoke an API key

#### `GET /api/user/favorites`
Get user's favorited items

#### `GET /api/user/items`
Get items authored by user

**Query params:**
- `status` — published, pending, draft
- `limit`, `offset` — pagination

### Item Submission

#### `POST /api/submit`
Create new item (agent or skill)

**Request:**
```json
{
  "title": "My Data Agent",
  "short_description": "Analyzes CSV files and generates reports",
  "description": "Full markdown description...",
  "readme": "Installation and usage instructions...",
  "type": "agent",
  "category": "data-analysis",
  "tags": ["python", "data", "automation"],
  "install_command": "pip install my-data-agent",
  "version": "1.0.0",
  "repo_url": "https://github.com/user/repo",
  "demo_url": "https://demo.example.com",
  "icon_url": "https://cdn.example.com/icon.png"
}
```

**Auto-approval:** Items are immediately published if author has karma > 100, otherwise pending review.

**Post-insert:** Embeddings are generated asynchronously and indexed in Vectorize.

#### `PATCH /api/items/:slug`
Update item (author-only)

#### `DELETE /api/items/:slug`
Archive item (author-only, soft delete)

### Usage Reporting

#### `POST /api/report`
Record execution report (success/failure, duration, errors)

**Request:**
```json
{
  "item_slug": "data-analyzer",
  "outcome": "success" | "failure",
  "duration_ms": 1250,
  "error_message": "Optional error details"
}
```

Used for quality signal tracking and performance analytics.

#### `GET /api/stats/:item_slug`
Get performance statistics for an item

Returns: success rate, avg duration, recent reports

#### `GET /api/user/reports`
Get usage reports submitted by authenticated user

### Health & System

#### `GET /api/health`
System health check

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2024-03-15T10:30:00Z",
  "environment": "production"
}
```

## Authentication

### API Key Authentication

Include API key in header:
```bash
curl -H "X-API-Key: opt_xxxxxxxxxxxxxxxxxxxxx" https://api.optimiser.world/api/user/profile
```

API keys:
- Generated via `POST /api/user/api-keys`
- Hashed using SHA-256 (plaintext never stored)
- Can be revoked via `DELETE /api/user/api-keys/:id`
- Prefix visible in listings, full key returned only once

### Session-based Auth (Future)

Currently not implemented. Will use Better Auth with OAuth2 provider support (GitHub, Twitter).

## Database Schema

### Core Tables

**users** — User profiles, karma, OAuth identities
**items** — Agents and skills with metadata
**votes** — Up/downvotes (unique per user/item)
**ratings** — 0-10 scores (unique per user/item)
**reviews** — Detailed reviews and feedback
**comments** — Nested discussion threads
**favorites** — User's favorited items
**collections** — Curated lists of items

### Supporting Tables

**api_keys** — Hashed API keys with usage tracking
**usage_reports** — Execution reports for quality signals
**items_fts** — FTS5 virtual table for full-text search

### Indexes

Strategic indexes on:
- `items(slug)` — direct lookup by slug
- `items(category, type, status, created_at)` — filtering and sorting
- `votes(user_id, item_id)` — unique constraint
- `ratings(user_id, item_id)` — unique constraint
- FTS5 triggers — keep search index in sync

## Deployment

### Prerequisites

1. Cloudflare account with Workers enabled
2. D1 database created
3. Vectorize index created (optional but recommended)
4. KV namespace created for caching
5. R2 bucket for assets (optional)

### Setup

```bash
cd api
npm install
cp .env.example .env  # Configure with your Cloudflare account details
```

### Configuration

Edit `wrangler.toml`:
- Replace `placeholder-replace-with-real-id` with actual database/KV IDs
- Set up separate configs for dev/production environments

### Database Migration

```bash
npm run db:migrate
```

This runs `src/db/schema.sql` against your D1 database.

### Development

```bash
npm run dev
# Server runs on http://localhost:8787
```

### Deployment

```bash
npm run deploy
```

## Performance Characteristics

### Search Latency
- Semantic search (Vectorize): ~100-150ms
- Keyword search (FTS5): ~50-100ms
- RRF merging: <10ms
- **Total target:** <800ms p95

### Database
- D1 (SQLite) read latency: ~5-20ms
- FTS5 queries: ~50-150ms depending on result set
- Indexed lookups: ~5-10ms

### Caching Strategy
- Search results cached in KV for 1 hour
- Category listings cached for 6 hours
- User profile cached for 10 minutes
- API responses include Cache-Control headers

## Development

### File Structure

```
api/
├── src/
│   ├── index.js              # Main Hono app
│   ├── db/
│   │   └── schema.sql        # Database schema
│   ├── routes/
│   │   ├── search.js         # Hybrid search
│   │   ├── items.js          # Item CRUD + interactions
│   │   ├── feed.js           # Leaderboard, categories
│   │   ├── user.js           # User profiles, API keys
│   │   ├── submit.js         # Item submission
│   │   └── report.js         # Usage reporting
│   ├── lib/
│   │   ├── auth.js           # Authentication middleware
│   │   ├── rrf.js            # RRF algorithm & utilities
│   │   └── scoring.js        # Ranking algorithms
│   └── middleware/
│       └── cors.js           # CORS headers
├── package.json
├── wrangler.toml
└── README.md
```

### Adding New Endpoints

1. Create route file in `src/routes/`
2. Implement handlers using Hono syntax
3. Import and mount in `src/index.js` via `app.route()`
4. Test locally with `npm run dev`

### Testing

```bash
# Health check
curl http://localhost:8787/api/health

# Search
curl -X POST http://localhost:8787/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "python agent"}'

# With API key
curl -H "X-API-Key: your-key" http://localhost:8787/api/user/profile
```

## Error Handling

All endpoints return standard error format:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (dev mode only)"
}
```

HTTP status codes:
- `200` — Success
- `201` — Created
- `204` — No content
- `400` — Bad request / validation failed
- `401` — Unauthorized / auth required
- `403` — Forbidden / insufficient permissions
- `404` — Not found
- `409` — Conflict (e.g., duplicate slug)
- `500` — Server error

## Monitoring & Observability

### Logging

All endpoints log errors to console. In production, logs are sent to Cloudflare Logpush.

### Metrics

Track via Cloudflare Analytics:
- Request count by endpoint
- Error rates
- Latency percentiles
- Cache hit rates

### Custom Metrics

Consider adding:
- Search quality scores (RRF effectiveness)
- Item creation velocity
- User engagement metrics

## Security

### API Key Security

- Keys hashed with SHA-256 before storage
- Never displayed after creation
- Can be revoked immediately
- Prefix shown for identification

### Input Validation

All user input is validated:
- String length limits
- Type checking
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitization)

### CORS

Configured for frontend domains. Restrict in production:
```javascript
const allowedOrigins = [
  'https://optimiser.world',
  'https://app.optimiser.world'
]
```

## Future Enhancements

- [ ] Session-based auth via Better Auth
- [ ] OAuth2 with GitHub, Twitter, Discord
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Usage quotas and rate limiting
- [ ] Webhook events for item updates
- [ ] Batch operations API
- [ ] Analytics dashboard
- [ ] Admin moderation tools
- [ ] Item analytics (downloads, ratings over time)
- [ ] Recommendation engine (collaborative filtering)
- [ ] Advanced search filters (date range, rating filters, etc.)

## Support

For issues, questions, or suggestions:
- GitHub Issues: (to be created)
- Discord: (to be created)
- Email: support@optimiser.world

## License

MIT

# GitHub Scraper Setup Guide

This guide walks through setting up the GitHub scraper system for production deployment.

## Prerequisites

- Cloudflare Workers account with D1, KV, Vectorize, and Workers AI enabled
- GitHub account with Personal Access Token permissions
- Node.js 18+ and wrangler CLI

## 1. Configure GitHub Token

The scraper needs a GitHub Personal Access Token for API access.

### Generate Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" (classic or fine-grained)
3. For **classic token**:
   - Scopes: Select only `public_repo` (read-only)
   - Name: `optimiser-scraper-token`
4. For **fine-grained token**:
   - Repository access: All repositories (public only)
   - Permissions: Contents → Read-only
5. Copy the token

### Store in Wrangler Secrets

```bash
cd api
wrangler secret put GITHUB_TOKEN --env production
# Paste token when prompted
```

The token is now securely stored in Cloudflare Workers secrets.

## 2. Update Admin Key

The admin key protects manual scraper trigger endpoints. Change the default:

```bash
# Edit api/wrangler.toml
# Under [vars]:
ADMIN_KEY = "your-secure-random-key-here"

# And update the production environment separately:
wrangler secret put ADMIN_KEY --env production
# Or define in [env.production.vars]
```

## 3. Initialize Database Tables

The scraper needs two tables:
- `items` — Marketplace items (with new GitHub scraper columns)
- `scraper_runs` — Execution logs

### Apply Schema

```bash
# Run schema.sql against your D1 database
wrangler d1 execute optimiser-db --file=api/src/db/schema.sql --env production
```

### Verify Tables

```bash
wrangler d1 execute optimiser-db \
  --command="SELECT name FROM sqlite_master WHERE type='table';" \
  --env production
```

Output should include:
- `items`
- `scraper_runs`
- (and other existing tables)

## 4. Add Vectorize Index

If semantic search is enabled, create a Vectorize index:

```bash
# Check existing indexes
wrangler vectorize list

# Create if missing
wrangler vectorize create optimiser-items --dimension=768 --metric=cosine
```

Then update `api/wrangler.toml`:
```toml
[[vectorize]]
binding = "VECTORIZE"
index_name = "optimiser-items"
```

## 5. Deploy

```bash
# Build and deploy
cd api
wrangler deploy --env production
```

Verify deployment:
```bash
curl https://your-worker-domain.workers.dev/api/health
```

## 6. Test Manual Scrape

Trigger a test scrape:

```bash
curl -X POST https://your-worker-domain.workers.dev/api/admin/scrape \
  -H "X-Admin-Key: your-admin-key"
```

This will start a standard scrape and return statistics. Check logs:

```bash
wrangler tail --env production
```

## 7. Verify Cron Triggers

The scraper should now run automatically:
- **Every 6 hours** — Standard discovery scrape
- **Every Sunday at midnight UTC** — Full deep scrape

Check the Cloudflare dashboard:
1. Workers → Triggers → Crons
2. Should see two entries with the schedules above

To manually test a cron trigger:
```bash
wrangler triggers cron trigger "0 */6 * * *" --env production
```

## 8. Monitor Scraper Health

### Check Last Run Stats

```bash
curl https://your-worker-domain.workers.dev/api/admin/scraper-stats \
  -H "X-Admin-Key: your-admin-key"
```

### View Database Logs

```bash
wrangler d1 execute optimiser-db \
  --command="SELECT * FROM scraper_runs ORDER BY started_at DESC LIMIT 5;" \
  --env production
```

### View Ingested Items

```bash
wrangler d1 execute optimiser-db \
  --command="SELECT slug, quality_score, status FROM items WHERE scraped_at IS NOT NULL ORDER BY scraped_at DESC LIMIT 10;" \
  --env production
```

## Operational Tasks

### Manual Full Scrape

Run an extended scrape including high-quality queries:

```bash
curl -X POST "https://your-domain.workers.dev/api/admin/scrape?full=true" \
  -H "X-Admin-Key: your-admin-key"
```

### Update Queries

Edit `api/src/scraper/queries.js` to add/modify search patterns:

1. Update the `DISCOVERY_QUERIES` or `HIGH_QUALITY_QUERIES` arrays
2. Redeploy: `wrangler deploy --env production`
3. Scraper will use new queries on next run

### Adjust Validation Rules

Edit `api/src/scraper/validator.js` to change acceptance criteria:

1. Modify signal weights or thresholds
2. Redeploy
3. Next scrape uses new rules

### Tune Scoring Algorithm

Edit `api/src/scraper/scorer.js` to adjust quality metrics:

1. Change score category weights (popularity, freshness, etc.)
2. Adjust tier thresholds (featured = 70+, etc.)
3. Redeploy

## Troubleshooting

### GitHub Rate Limiting

**Symptom**: Scraper logs show "GitHub rate limit exceeded"

**Solution**:
- Verify `GITHUB_TOKEN` is set correctly
- Authenticated requests get 5,000/hour vs 60/hour unauthenticated
- Check remaining quota: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`

### No Items Ingested

**Symptom**: `ingested: 0` in stats

**Causes**:
1. **Repos not validating**: Adjust signal weights in `validator.js`
2. **Score too low**: Lower score threshold in `ingester.js`
3. **Search queries too strict**: Loosen patterns in `queries.js`

**Debug**:
```bash
# Manual full scrape with verbose output
curl -X POST "https://domain.workers.dev/api/admin/scrape" \
  -H "X-Admin-Key: key"

# Check logs
wrangler tail --env production
```

### Database Errors

**Symptom**: "Database query failed"

**Solution**:
1. Verify `items` table has all required columns
2. Check binding name in `wrangler.toml` matches code
3. Ensure `VECTORIZE` binding is configured if using embeddings

### Cron Not Triggering

**Symptom**: Scheduled scrapes don't run

**Solution**:
1. Check Cloudflare dashboard Triggers → Crons
2. Verify `wrangler.toml` has `[triggers]` section with crons
3. Redeploy: `wrangler deploy --env production`
4. Test manually: `wrangler triggers cron trigger "0 */6 * * *"`

## Performance Tuning

### Reduce Query Count

For faster runs, edit `api/src/scraper/queries.js` and remove less-productive queries.

### Adjust Rate Limiting

In `api/src/scraper/github.js`, modify wait times:
```js
// Current: 300ms per request
await new Promise(r => setTimeout(r, 300))

// Faster: 100ms (higher risk of rate limit)
await new Promise(r => setTimeout(r, 100))
```

### Disable Embeddings

If Workers AI or Vectorize is slow, disable in `api/src/scraper/ingester.js`:
```js
// Comment out:
// await generateAndIndexEmbedding(env, itemId, itemData)
```

## Next Steps

1. Set up monitoring/alerting on scraper failures
2. Create dashboard to visualize ingestion trends
3. Implement feedback loop to adjust scoring based on user engagement
4. Add webhook support for real-time GitHub updates
5. Build tools to view/edit scraped items before marketplace publication

## Support

For issues or questions about the scraper:
1. Check logs: `wrangler tail --env production`
2. Review `api/src/scraper/README.md` for architecture details
3. Check GitHub rate limits: `https://api.github.com/rate_limit`

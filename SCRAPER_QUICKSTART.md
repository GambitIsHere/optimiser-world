# GitHub Scraper - Quick Start

Get the marketplace scraper running in 5 minutes.

## 1. Generate GitHub Token (2 min)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `optimiser-scraper-token`
4. Scope: Check only `public_repo`
5. Copy the token

## 2. Store Token (1 min)

```bash
cd api
wrangler secret put GITHUB_TOKEN --env production
# Paste token when prompted
```

## 3. Configure Admin Key (1 min)

Edit `api/wrangler.toml` and change line 7:

```toml
ADMIN_KEY = "your-secure-random-string-here"
```

## 4. Deploy (1 min)

```bash
wrangler deploy --env production
```

## 5. Test (Optional)

```bash
# Trigger scraper
curl -X POST https://api.optimiser.world/api/admin/scrape \
  -H "X-Admin-Key: your-admin-key"

# View last run stats
curl https://api.optimiser.world/api/admin/scraper-stats \
  -H "X-Admin-Key: your-admin-key"
```

Done! The scraper now runs automatically every 6 hours.

## What Happens Next

1. **Every 6 hours** — Standard scrape discovers new Claude Code skills & AI agents
2. **Every Sunday midnight** — Full deep scrape with extended queries
3. **Auto-ingestion** — Validated items appear in marketplace within minutes
4. **Continuous updates** — Existing items refresh with latest GitHub metadata

## Customization

### Add Custom Search Queries
Edit `api/src/scraper/queries.js`:
```js
{ q: 'your-github-search-query', label: 'custom-label' },
```

### Adjust Validation Rules
Edit `api/src/scraper/validator.js` to change signal weights.

### Tune Scoring
Edit `api/src/scraper/scorer.js` to adjust quality metrics.

## Monitoring

```bash
# View logs in real-time
wrangler tail --env production

# Check database stats
wrangler d1 execute optimiser-db \
  --command="SELECT COUNT(*) as items FROM items WHERE scraped_at IS NOT NULL;" \
  --env production
```

## Troubleshooting

### GitHub rate limit exceeded?
Verify token is set:
```bash
wrangler secret list --env production | grep GITHUB_TOKEN
```

### No items ingested?
Lower the validation threshold in `api/src/scraper/validator.js` (line 60, change `30` to `20`).

### Cron not triggering?
Check Cloudflare dashboard → Workers → Triggers → Crons

## Full Documentation

- **Architecture & operations**: `api/src/scraper/README.md`
- **Detailed setup guide**: `SCRAPER_SETUP.md`
- **Implementation details**: `SCRAPER_IMPLEMENTATION.md`

That's it! Your marketplace scraper is live.

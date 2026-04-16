import { Hono } from 'hono'
import { cors } from './middleware/cors.js'
import searchRoutes from './routes/search.js'
import itemRoutes from './routes/items.js'
import feedRoutes from './routes/feed.js'
import userRoutes from './routes/user.js'
import submitRoutes from './routes/submit.js'
import reportRoutes from './routes/report.js'
import { runScraper } from './scraper/index.js'
import { enrichItem } from './scraper/enricher.js'
import { observeSearch, observeVote, observeUsageReport, runLearningCycle } from './learning/index.js'

const app = new Hono()

// Global middleware
app.use('*', cors())

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development'
  })
})

// Mount route modules
app.route('/api', searchRoutes)
app.route('/api', itemRoutes)
app.route('/api', feedRoutes)
app.route('/api', userRoutes)
app.route('/api', submitRoutes)
app.route('/api', reportRoutes)

// Admin endpoints for scraper control
app.post('/api/admin/scrape', async (c) => {
  const adminKey = c.req.header('X-Admin-Key')
  if (adminKey !== c.env.ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const full = c.req.query('full') === 'true'
  const stats = await runScraper(c.env, { full })
  return c.json(stats)
})

// Get scraper stats
app.get('/api/admin/scraper-stats', async (c) => {
  const adminKey = c.req.header('X-Admin-Key')
  if (adminKey !== c.env.ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const stats = await c.env.CACHE.get('scraper:last-run', 'json')
  return c.json(stats || { message: 'No scraper runs recorded' })
})

// Run learning cycle
app.post('/api/admin/learn', async (c) => {
  const adminKey = c.req.header('X-Admin-Key')
  if (adminKey !== c.env.ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const stats = await runLearningCycle(c.env)
  return c.json(stats)
})

// Get insights from learning system
app.get('/api/admin/insights', async (c) => {
  const adminKey = c.req.header('X-Admin-Key')
  if (adminKey !== c.env.ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const type = c.req.query('type')
  let sql = 'SELECT * FROM insights ORDER BY created_at DESC LIMIT 50'
  let params = []
  if (type) {
    sql = 'SELECT * FROM insights WHERE type = ? ORDER BY created_at DESC LIMIT 50'
    params = [type]
  }
  const results = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json(results.results || [])
})

// Enrich a single item using Firecrawl
app.post('/api/admin/enrich', async (c) => {
  const adminKey = c.req.header('X-Admin-Key')
  if (adminKey !== c.env.ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { slug } = await c.req.json()
  const item = await c.env.DB.prepare('SELECT * FROM items WHERE slug = ?').bind(slug).first()
  if (!item) {
    return c.json({ error: 'Item not found' }, 404)
  }

  const enrichments = await enrichItem(c.env, item)
  return c.json({ slug, enrichments })
})

// Batch enrich top items
app.post('/api/admin/enrich-top', async (c) => {
  const adminKey = c.req.header('X-Admin-Key')
  if (adminKey !== c.env.ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const limit = parseInt(c.req.query('limit') || '20')
  const items = await c.env.DB.prepare(
    'SELECT * FROM items WHERE status = ? AND tutorials IS NULL ORDER BY quality_score DESC LIMIT ?'
  ).bind('published', limit).all()

  const results = []
  for (const item of (items.results || [])) {
    const enrichments = await enrichItem(c.env, item)
    results.push({ slug: item.slug, enrichments })
    await new Promise(r => setTimeout(r, 2000)) // pace Firecrawl API
  }

  return c.json({ enriched: results.length, results })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
    method: c.req.method
  }, 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method
  })

  return c.json({
    error: 'Internal server error',
    details: c.env.ENVIRONMENT === 'development' ? err.message : undefined
  }, 500)
})

// Export both the fetch handler and scheduled handler
export default {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    // Full scrape on Sundays, regular scrape on other days
    if (event.cron === '0 0 * * 0') {
      ctx.waitUntil(runScraper(env, { full: true }))
    } else if (event.cron === '0 */6 * * *') {
      ctx.waitUntil(runScraper(env))
    }
    // Run learning cycle daily at 2am UTC
    if (event.cron === '0 2 * * *') {
      ctx.waitUntil(runLearningCycle(env))
    }
  }
}

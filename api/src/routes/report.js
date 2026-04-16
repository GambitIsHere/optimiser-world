import { Hono } from 'hono'
import { optionalAuth, getUser } from '../lib/auth.js'

const app = new Hono()

/**
 * POST /api/report
 * Record usage report (success/failure, duration, error details)
 *
 * Used to track real-world performance and reliability metrics
 * Helps improve item ranking and identify broken implementations
 *
 * Request body:
 * {
 *   item_slug: string (required),
 *   outcome: 'success' | 'failure' (required),
 *   duration_ms?: number,
 *   error_message?: string,
 *   context?: { version?: string, environment?: string, ... } (optional metadata)
 * }
 *
 * Response:
 * { success: true, report_id }
 */
app.post('/report', optionalAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)
    const body = await c.req.json()

    const { item_slug, outcome, duration_ms, error_message, context } = body

    // Validate input
    if (!item_slug || typeof item_slug !== 'string') {
      return c.json({ error: 'item_slug is required' }, 400)
    }

    if (!outcome || !['success', 'failure'].includes(outcome)) {
      return c.json({ error: 'outcome must be "success" or "failure"' }, 400)
    }

    if (duration_ms !== undefined) {
      if (typeof duration_ms !== 'number' || duration_ms < 0 || duration_ms > 3600000) {
        return c.json({ error: 'duration_ms must be a number between 0 and 3600000 (1 hour)' }, 400)
      }
    }

    if (error_message && error_message.length > 1000) {
      return c.json({ error: 'error_message must be at most 1000 characters' }, 400)
    }

    // Find item by slug
    const item = await db.prepare(
      'SELECT id FROM items WHERE slug = ? LIMIT 1'
    ).bind(item_slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Create usage report
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.prepare(
      `INSERT INTO usage_reports (id, user_id, item_id, outcome, duration_ms, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      reportId,
      user ? user.id : null,
      item.id,
      outcome,
      duration_ms || null,
      error_message ? error_message.substring(0, 1000) : null
    ).run()

    // Update quality signals in items table (async, best effort)
    // If outcome = failure, decrement score slightly
    // If outcome = success, increment slightly (especially with fast duration)
    const updateQuality = async () => {
      try {
        if (outcome === 'success') {
          // Slight boost for successful execution
          await db.prepare(
            'UPDATE items SET downloads = downloads + 1 WHERE id = ?'
          ).bind(item.id).run()
        } else if (outcome === 'failure') {
          // Log failures — don't penalize heavily (could be user error)
          // Track in a separate failure count if needed
        }
      } catch (e) {
        console.warn('Failed to update item quality signals:', e.message)
      }
    }

    // Fire and forget
    updateQuality()

    return c.json({
      success: true,
      report_id: reportId,
      message: 'Usage report recorded'
    }, 201)
  } catch (e) {
    console.error('Report error:', e)
    return c.json({
      error: 'Failed to record report',
      details: c.env.ENVIRONMENT === 'development' ? e.message : undefined
    }, 500)
  }
})

/**
 * GET /api/stats/:item_slug
 * Get performance statistics for an item
 *
 * Returns:
 * - total_reports: number
 * - success_count: number
 * - failure_count: number
 * - success_rate: percentage
 * - avg_duration_ms: average execution duration
 * - recent_reports: sample of recent reports
 */
app.get('/stats/:item_slug', async (c) => {
  try {
    const { item_slug } = c.req.param()
    const db = c.env.DB

    // Find item
    const item = await db.prepare(
      'SELECT id FROM items WHERE slug = ? LIMIT 1'
    ).bind(item_slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Get stats
    const stats = await db.prepare(
      `SELECT
         COUNT(*) as total_reports,
         SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END) as success_count,
         SUM(CASE WHEN outcome = 'failure' THEN 1 ELSE 0 END) as failure_count,
         AVG(duration_ms) as avg_duration_ms,
         MAX(created_at) as last_report_at
       FROM usage_reports
       WHERE item_id = ?`
    ).bind(item.id).first()

    if (!stats || stats.total_reports === 0) {
      return c.json({
        item_slug,
        stats: {
          total_reports: 0,
          success_count: 0,
          failure_count: 0,
          success_rate: 0,
          avg_duration_ms: null
        }
      })
    }

    const successRate = stats.total_reports > 0
      ? Math.round((stats.success_count / stats.total_reports) * 100)
      : 0

    // Get recent reports (sample)
    const recent = await db.prepare(
      `SELECT
         id, outcome, duration_ms, error_message, created_at
       FROM usage_reports
       WHERE item_id = ?
       ORDER BY created_at DESC
       LIMIT 10`
    ).bind(item.id).all()

    return c.json({
      item_slug,
      stats: {
        total_reports: stats.total_reports,
        success_count: stats.success_count,
        failure_count: stats.failure_count,
        success_rate: successRate,
        avg_duration_ms: stats.avg_duration_ms ? Math.round(stats.avg_duration_ms) : null,
        last_report_at: stats.last_report_at
      },
      recent_reports: (recent.results || []).map(r => ({
        id: r.id,
        outcome: r.outcome,
        duration_ms: r.duration_ms,
        error_message: r.error_message,
        created_at: r.created_at
      }))
    })
  } catch (e) {
    console.error('Stats error:', e)
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

/**
 * GET /api/user/reports
 * Get usage reports submitted by current user
 */
app.get('/user/reports', optionalAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100)
    const offset = parseInt(c.req.query('offset') || '0')

    const rows = await db.prepare(
      `SELECT
         r.id, r.item_id, r.outcome, r.duration_ms, r.error_message, r.created_at,
         i.slug, i.title
       FROM usage_reports r
       JOIN items i ON r.item_id = i.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(user.id, limit, offset).all()

    const total = await db.prepare(
      'SELECT COUNT(*) as count FROM usage_reports WHERE user_id = ?'
    ).bind(user.id).first()

    return c.json({
      reports: (rows.results || []).map(r => ({
        id: r.id,
        item: { id: r.item_id, slug: r.slug, title: r.title },
        outcome: r.outcome,
        duration_ms: r.duration_ms,
        error_message: r.error_message,
        created_at: r.created_at
      })),
      pagination: {
        offset,
        limit,
        total: total?.count || 0,
        has_more: offset + limit < (total?.count || 0)
      }
    })
  } catch (e) {
    console.error('Get user reports error:', e)
    return c.json({ error: 'Failed to fetch reports' }, 500)
  }
})

export default app

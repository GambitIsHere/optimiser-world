import { Hono } from 'hono'
import { hotScore, risingScore, topScore } from '../lib/scoring.js'
import { optionalAuth, getUser } from '../lib/auth.js'

const app = new Hono()

/**
 * GET /api/leaderboard
 * Returns items sorted by various metrics
 *
 * Query params:
 * - sort: 'hot' | 'new' | 'top' | 'rising' | 'trending' (default: 'hot')
 * - category?: string
 * - type?: 'agent' | 'skill'
 * - limit?: number (default: 20, max: 100)
 * - offset?: number (default: 0)
 * - timeframe?: 'day' | 'week' | 'month' | 'all' (default: 'all')
 */
app.get('/leaderboard', optionalAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)

    const sort = c.req.query('sort') || 'hot'
    const category = c.req.query('category')
    const type = c.req.query('type')
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100)
    const offset = Math.min(parseInt(c.req.query('offset') || '0'), 10000)
    const timeframe = c.req.query('timeframe') || 'all'

    // Build timeframe filter
    let timeWhere = ''
    const now = new Date()
    switch (timeframe) {
      case 'day':
        timeWhere = ' AND i.created_at > datetime(\'now\', \'-1 day\')'
        break
      case 'week':
        timeWhere = ' AND i.created_at > datetime(\'now\', \'-7 days\')'
        break
      case 'month':
        timeWhere = ' AND i.created_at > datetime(\'now\', \'-30 days\')'
        break
      case 'all':
      default:
        timeWhere = ''
    }

    // Build category/type filters
    let filters = []
    let bindings = []

    if (category) {
      filters.push('i.category = ?')
      bindings.push(category)
    }

    if (type) {
      filters.push('i.type = ?')
      bindings.push(type)
    }

    const filterWhere = filters.length > 0 ? ' AND ' + filters.join(' AND ') : ''

    // Query items
    const query = `
      SELECT
        i.id, i.slug, i.title, i.short_description,
        i.type, i.category, i.tags, i.author_id, i.upvotes, i.downvotes,
        i.rating_sum, i.rating_count, i.downloads, i.featured, i.version,
        i.icon_url, i.created_at, i.updated_at,
        u.username as author_username, u.karma as author_karma,
        COALESCE(uf.item_id IS NOT NULL, 0) as is_favorited
      FROM items i
      JOIN users u ON i.author_id = u.id
      LEFT JOIN favorites uf ON uf.item_id = i.id AND uf.user_id = ?
      WHERE i.status = 'published'${timeWhere}${filterWhere}
      ORDER BY
        CASE
          WHEN ? = 'hot' THEN ((i.upvotes - i.downvotes) / CAST(MAX(1, CAST((julianday('now') - julianday(i.created_at)) * 24 AS INTEGER)) AS FLOAT))
          WHEN ? = 'new' THEN i.created_at DESC
          WHEN ? = 'top' THEN (i.upvotes - i.downvotes) DESC
          WHEN ? = 'rising' THEN (i.upvotes - i.downvotes) / CAST(MAX(1, CAST((julianday('now') - julianday(i.created_at)) * 24 AS INTEGER)) AS FLOAT)
          ELSE ((i.upvotes - i.downvotes) / CAST(MAX(1, CAST((julianday('now') - julianday(i.created_at)) * 24 AS INTEGER)) AS FLOAT))
        END DESC
      LIMIT ? OFFSET ?
    `

    const rows = await db.prepare(query).bind(
      user ? user.id : null,
      sort, sort, sort, sort,
      limit,
      offset
    ).all()

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count FROM items i
      WHERE i.status = 'published'${timeWhere}${filterWhere}
    `
    const countResult = await db.prepare(countQuery).bind(...bindings).first()

    const items = (rows.results || []).map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      short_description: item.short_description,
      type: item.type,
      category: item.category,
      tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [],
      author: {
        id: item.author_id,
        username: item.author_username,
        karma: item.author_karma
      },
      stats: {
        upvotes: item.upvotes,
        downvotes: item.downvotes,
        downloads: item.downloads,
        rating: item.rating_count > 0 ? (item.rating_sum / item.rating_count) : null,
        rating_count: item.rating_count
      },
      featured: Boolean(item.featured),
      version: item.version,
      icon_url: item.icon_url,
      is_favorited: Boolean(user && item.is_favorited),
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    return c.json({
      items,
      pagination: {
        offset,
        limit,
        total: countResult?.count || 0,
        has_more: offset + limit < (countResult?.count || 0)
      },
      filters: {
        sort,
        category: category || null,
        type: type || null,
        timeframe
      }
    })
  } catch (e) {
    console.error('Leaderboard error:', e)
    return c.json({ error: 'Failed to fetch leaderboard' }, 500)
  }
})

/**
 * GET /api/categories
 * Returns list of categories with item counts
 */
app.get('/categories', async (c) => {
  try {
    const db = c.env.DB

    const rows = await db.prepare(
      `SELECT
         category,
         COUNT(*) as count,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_count
       FROM items
       GROUP BY category
       ORDER BY published_count DESC`
    ).all()

    const categories = (rows.results || []).map(row => ({
      category: row.category,
      total: row.count,
      published: row.published_count,
      icon_url: `/icons/${row.category.toLowerCase()}.svg` // Convention
    }))

    return c.json({ categories })
  } catch (e) {
    console.error('Categories error:', e)
    return c.json({ error: 'Failed to fetch categories' }, 500)
  }
})

/**
 * GET /api/trending
 * Returns trending/rising items
 *
 * Query params:
 * - limit?: number (default: 10)
 * - timeframe?: 'day' | 'week' (default: 'day')
 */
app.get('/trending', optionalAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50)
    const timeframe = c.req.query('timeframe') || 'day'

    const timeFilter = timeframe === 'week'
      ? "datetime('now', '-7 days')"
      : "datetime('now', '-1 day')"

    const rows = await db.prepare(
      `SELECT
         i.id, i.slug, i.title, i.short_description,
         i.type, i.category, i.tags, i.author_id, i.upvotes, i.downvotes,
         i.rating_sum, i.rating_count, i.downloads, i.featured,
         i.icon_url, i.created_at, i.updated_at,
         u.username as author_username, u.karma as author_karma,
         COALESCE(uf.item_id IS NOT NULL, 0) as is_favorited,
         (i.upvotes - i.downvotes) / CAST(MAX(1, CAST((julianday('now') - julianday(i.created_at)) * 24 + 1 AS INTEGER)) AS FLOAT) as rising_score
       FROM items i
       JOIN users u ON i.author_id = u.id
       LEFT JOIN favorites uf ON uf.item_id = i.id AND uf.user_id = ?
       WHERE i.status = 'published' AND i.created_at > ${timeFilter}
       ORDER BY rising_score DESC
       LIMIT ?`
    ).bind(user ? user.id : null, limit).all()

    const items = (rows.results || []).map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      short_description: item.short_description,
      type: item.type,
      category: item.category,
      tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [],
      author: {
        id: item.author_id,
        username: item.author_username,
        karma: item.author_karma
      },
      stats: {
        upvotes: item.upvotes,
        downvotes: item.downvotes,
        downloads: item.downloads,
        rating: item.rating_count > 0 ? (item.rating_sum / item.rating_count) : null,
        rating_count: item.rating_count
      },
      featured: Boolean(item.featured),
      icon_url: item.icon_url,
      is_favorited: Boolean(user && item.is_favorited),
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    return c.json({
      items,
      timeframe
    })
  } catch (e) {
    console.error('Trending error:', e)
    return c.json({ error: 'Failed to fetch trending items' }, 500)
  }
})

/**
 * GET /api/featured
 * Returns featured/curated items
 */
app.get('/featured', optionalAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100)

    const rows = await db.prepare(
      `SELECT
         i.id, i.slug, i.title, i.short_description,
         i.type, i.category, i.tags, i.author_id, i.upvotes, i.downvotes,
         i.rating_sum, i.rating_count, i.downloads,
         i.icon_url, i.created_at, i.updated_at,
         u.username as author_username, u.karma as author_karma,
         COALESCE(uf.item_id IS NOT NULL, 0) as is_favorited
       FROM items i
       JOIN users u ON i.author_id = u.id
       LEFT JOIN favorites uf ON uf.item_id = i.id AND uf.user_id = ?
       WHERE i.status = 'published' AND i.featured = 1
       ORDER BY i.updated_at DESC
       LIMIT ?`
    ).bind(user ? user.id : null, limit).all()

    const items = (rows.results || []).map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      short_description: item.short_description,
      type: item.type,
      category: item.category,
      tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [],
      author: {
        id: item.author_id,
        username: item.author_username,
        karma: item.author_karma
      },
      stats: {
        upvotes: item.upvotes,
        downvotes: item.downvotes,
        downloads: item.downloads,
        rating: item.rating_count > 0 ? (item.rating_sum / item.rating_count) : null,
        rating_count: item.rating_count
      },
      icon_url: item.icon_url,
      is_favorited: Boolean(user && item.is_favorited),
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    return c.json({ items })
  } catch (e) {
    console.error('Featured error:', e)
    return c.json({ error: 'Failed to fetch featured items' }, 500)
  }
})

export default app

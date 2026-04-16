import { Hono } from 'hono'
import { requireAuth, getUser } from '../lib/auth.js'

const app = new Hono()

/**
 * Hash API key using SHA-256
 */
async function hashKey(key) {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate a random API key
 */
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'opt_'
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

/**
 * GET /api/user/profile
 * Returns current authenticated user's profile
 */
app.get('/user/profile', requireAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)

    // Fetch user details and stats
    const userDetails = await db.prepare(
      `SELECT
         u.id, u.username, u.display_name, u.avatar_url, u.bio, u.karma,
         u.github_id, u.twitter_id, u.email, u.email_verified, u.created_at,
         COUNT(DISTINCT i.id) as items_count,
         COUNT(DISTINCT v.id) as votes_count,
         COUNT(DISTINCT r.id) as ratings_count,
         COUNT(DISTINCT f.item_id) as favorites_count
       FROM users u
       LEFT JOIN items i ON u.id = i.author_id AND i.status = 'published'
       LEFT JOIN votes v ON u.id = v.user_id
       LEFT JOIN ratings r ON u.id = r.user_id
       LEFT JOIN favorites f ON u.id = f.user_id
       WHERE u.id = ?
       GROUP BY u.id
       LIMIT 1`
    ).bind(user.id).first()

    if (!userDetails) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      user: {
        id: userDetails.id,
        username: userDetails.username,
        display_name: userDetails.display_name,
        avatar_url: userDetails.avatar_url,
        bio: userDetails.bio,
        karma: userDetails.karma,
        email: userDetails.email,
        email_verified: Boolean(userDetails.email_verified),
        github_id: userDetails.github_id,
        twitter_id: userDetails.twitter_id,
        created_at: userDetails.created_at,
        stats: {
          items_published: userDetails.items_count,
          votes_cast: userDetails.votes_count,
          ratings_given: userDetails.ratings_count,
          favorites: userDetails.favorites_count
        }
      }
    })
  } catch (e) {
    console.error('Get profile error:', e)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

/**
 * PATCH /api/user/profile
 * Update user profile
 */
app.patch('/user/profile', requireAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)
    const updates = await c.req.json()

    // Sanitize updates — only allow certain fields
    const allowed = ['display_name', 'avatar_url', 'bio']
    const sanitized = {}
    for (const key of allowed) {
      if (key in updates) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400)
    }

    // Build update query
    const fields = Object.keys(sanitized).map(k => `${k} = ?`).join(', ')
    const values = Object.values(sanitized)

    await db.prepare(
      `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(...values, user.id).run()

    return c.json({ success: true, updated_fields: Object.keys(sanitized) })
  } catch (e) {
    console.error('Update profile error:', e)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

/**
 * GET /api/user/api-keys
 * List user's API keys (prefix only, not full key)
 */
app.get('/user/api-keys', requireAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)

    const rows = await db.prepare(
      `SELECT id, name, prefix, created_at, last_used_at, revoked_at
       FROM api_keys
       WHERE user_id = ?
       ORDER BY created_at DESC`
    ).bind(user.id).all()

    const keys = (rows.results || []).map(key => ({
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      revoked: Boolean(key.revoked_at)
    }))

    return c.json({ api_keys: keys })
  } catch (e) {
    console.error('List API keys error:', e)
    return c.json({ error: 'Failed to fetch API keys' }, 500)
  }
})

/**
 * POST /api/user/api-keys
 * Generate a new API key
 *
 * Request: { name: string }
 * Response: Full key (returned ONLY once, cannot be retrieved later)
 */
app.post('/user/api-keys', requireAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)
    const { name } = await c.req.json()

    if (!name || name.trim().length === 0) {
      return c.json({ error: 'Name is required' }, 400)
    }

    if (name.length > 100) {
      return c.json({ error: 'Name must be at most 100 characters' }, 400)
    }

    // Generate new key
    const fullKey = generateApiKey()
    const keyHash = await hashKey(fullKey)
    const prefix = fullKey.substring(0, 10) + '...' + fullKey.substring(fullKey.length - 4)
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store hashed key (never store plaintext)
    await db.prepare(
      `INSERT INTO api_keys (id, user_id, name, key_hash, prefix)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(keyId, user.id, name.trim(), keyHash, prefix).run()

    return c.json({
      api_key: {
        id: keyId,
        key: fullKey, // ONLY returned here
        prefix,
        name: name.trim(),
        created_at: new Date().toISOString(),
        warning: 'This key will not be shown again. Save it securely.'
      }
    })
  } catch (e) {
    if (e.message && e.message.includes('UNIQUE')) {
      return c.json({ error: 'An API key with this name already exists' }, 409)
    }
    console.error('Create API key error:', e)
    return c.json({ error: 'Failed to create API key' }, 500)
  }
})

/**
 * DELETE /api/user/api-keys/:id
 * Revoke an API key
 */
app.delete('/user/api-keys/:id', requireAuth(), async (c) => {
  try {
    const { id } = c.req.param()
    const db = c.env.DB
    const user = getUser(c)

    // Verify ownership
    const key = await db.prepare(
      'SELECT user_id FROM api_keys WHERE id = ? LIMIT 1'
    ).bind(id).first()

    if (!key || key.user_id !== user.id) {
      return c.json({ error: 'API key not found' }, 404)
    }

    // Soft delete (mark as revoked)
    await db.prepare(
      'UPDATE api_keys SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run()

    return c.json({ success: true, revoked: true })
  } catch (e) {
    console.error('Revoke API key error:', e)
    return c.json({ error: 'Failed to revoke API key' }, 500)
  }
})

/**
 * GET /api/user/favorites
 * Get user's favorited items
 */
app.get('/user/favorites', requireAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100)
    const offset = parseInt(c.req.query('offset') || '0')

    const rows = await db.prepare(
      `SELECT
         i.id, i.slug, i.title, i.short_description,
         i.type, i.category, i.tags, i.author_id, i.upvotes, i.downvotes,
         i.rating_sum, i.rating_count, i.downloads, i.featured,
         i.icon_url, i.created_at,
         u.username as author_username, u.karma as author_karma,
         f.created_at as favorited_at
       FROM favorites f
       JOIN items i ON f.item_id = i.id
       JOIN users u ON i.author_id = u.id
       WHERE f.user_id = ? AND i.status = 'published'
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(user.id, limit, offset).all()

    const total = await db.prepare(
      `SELECT COUNT(*) as count FROM favorites
       WHERE user_id = ?`
    ).bind(user.id).first()

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
      favorited_at: item.favorited_at
    }))

    return c.json({
      items,
      pagination: {
        offset,
        limit,
        total: total?.count || 0,
        has_more: offset + limit < (total?.count || 0)
      }
    })
  } catch (e) {
    console.error('Get favorites error:', e)
    return c.json({ error: 'Failed to fetch favorites' }, 500)
  }
})

/**
 * GET /api/user/items
 * Get items authored by current user
 */
app.get('/user/items', requireAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100)
    const offset = parseInt(c.req.query('offset') || '0')
    const status = c.req.query('status') // 'published', 'pending', 'draft'

    let statusWhere = ''
    const bindings = [user.id]

    if (status && ['published', 'pending', 'draft'].includes(status)) {
      statusWhere = ' AND status = ?'
      bindings.push(status)
    }

    const rows = await db.prepare(
      `SELECT
         i.id, i.slug, i.title, i.short_description,
         i.type, i.category, i.tags, i.upvotes, i.downvotes,
         i.rating_sum, i.rating_count, i.downloads, i.featured, i.status,
         i.created_at, i.updated_at
       FROM items i
       WHERE i.author_id = ?${statusWhere}
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all()

    const total = await db.prepare(
      `SELECT COUNT(*) as count FROM items WHERE author_id = ?${statusWhere}`
    ).bind(...bindings).first()

    const items = (rows.results || []).map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      short_description: item.short_description,
      type: item.type,
      category: item.category,
      tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [],
      stats: {
        upvotes: item.upvotes,
        downvotes: item.downvotes,
        downloads: item.downloads,
        rating: item.rating_count > 0 ? (item.rating_sum / item.rating_count) : null,
        rating_count: item.rating_count
      },
      featured: Boolean(item.featured),
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    return c.json({
      items,
      pagination: {
        offset,
        limit,
        total: total?.count || 0,
        has_more: offset + limit < (total?.count || 0)
      }
    })
  } catch (e) {
    console.error('Get user items error:', e)
    return c.json({ error: 'Failed to fetch user items' }, 500)
  }
})

export default app

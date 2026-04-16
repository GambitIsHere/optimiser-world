import { Hono } from 'hono'
import { requireAuth, optionalAuth, getUser } from '../lib/auth.js'

const app = new Hono()

/**
 * GET /api/items/:slug
 * Retrieve a single item by slug with full details
 */
app.get('/items/:slug', optionalAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const db = c.env.DB
    const user = getUser(c)

    const item = await db.prepare(
      `SELECT
         i.id, i.slug, i.title, i.short_description, i.description, i.readme,
         i.type, i.category, i.tags, i.author_id, i.upvotes, i.downvotes,
         i.rating_sum, i.rating_count, i.downloads, i.version,
         i.install_command, i.compatibility, i.featured, i.status,
         i.icon_url, i.repo_url, i.demo_url,
         i.created_at, i.updated_at,
         u.username as author_username, u.display_name as author_display_name,
         u.avatar_url as author_avatar, u.karma as author_karma,
         COALESCE(uf.item_id IS NOT NULL, 0) as is_favorited,
         COALESCE(uv.direction, NULL) as user_vote_direction
       FROM items i
       JOIN users u ON i.author_id = u.id
       LEFT JOIN favorites uf ON uf.item_id = i.id AND uf.user_id = ?
       LEFT JOIN votes uv ON uv.item_id = i.id AND uv.user_id = ?
       WHERE i.slug = ? AND i.status = 'published'
       LIMIT 1`
    ).bind(user ? user.id : null, user ? user.id : null, slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Fetch recent reviews
    const reviews = await db.prepare(
      `SELECT
         r.id, r.content, r.upvotes, r.helpful_count, r.created_at,
         u.username, u.avatar_url, u.karma
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.item_id = ?
       ORDER BY r.upvotes DESC, r.created_at DESC
       LIMIT 10`
    ).bind(item.id).all()

    // Fetch comments
    const comments = await db.prepare(
      `SELECT
         c.id, c.user_id, c.content, c.upvotes, c.created_at, c.parent_id,
         u.username, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.item_id = ? AND c.parent_id IS NULL
       ORDER BY c.upvotes DESC, c.created_at DESC
       LIMIT 5`
    ).bind(item.id).all()

    return c.json({
      item: {
        id: item.id,
        slug: item.slug,
        title: item.title,
        short_description: item.short_description,
        description: item.description,
        readme: item.readme,
        type: item.type,
        category: item.category,
        tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [],
        author: {
          id: item.author_id,
          username: item.author_username,
          display_name: item.author_display_name,
          avatar_url: item.author_avatar,
          karma: item.author_karma
        },
        stats: {
          upvotes: item.upvotes,
          downvotes: item.downvotes,
          downloads: item.downloads,
          rating: item.rating_count > 0 ? (item.rating_sum / item.rating_count) : null,
          rating_count: item.rating_count
        },
        version: item.version,
        install_command: item.install_command,
        compatibility: item.compatibility ? (typeof item.compatibility === 'string' ? JSON.parse(item.compatibility) : item.compatibility) : {},
        featured: Boolean(item.featured),
        icon_url: item.icon_url,
        repo_url: item.repo_url,
        demo_url: item.demo_url,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_interaction: user ? {
          is_favorited: Boolean(item.is_favorited),
          vote_direction: item.user_vote_direction // 'up', 'down', or null
        } : null
      },
      reviews: reviews.results || [],
      comments: comments.results || []
    })
  } catch (e) {
    console.error('Get item error:', e)
    return c.json({ error: 'Failed to fetch item' }, 500)
  }
})

/**
 * POST /api/items/:slug/vote
 * Vote on an item (upvote/downvote)
 * Toggle behavior: voting same direction = undo vote
 *
 * Request: { direction: 'up' | 'down' }
 */
app.post('/items/:slug/vote', requireAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const { direction } = await c.req.json()
    const db = c.env.DB
    const user = getUser(c)

    if (!direction || !['up', 'down'].includes(direction)) {
      return c.json({ error: 'Direction must be "up" or "down"' }, 400)
    }

    // Get item
    const item = await db.prepare(
      'SELECT id FROM items WHERE slug = ? AND status = "published" LIMIT 1'
    ).bind(slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Check existing vote
    const existingVote = await db.prepare(
      'SELECT id, direction FROM votes WHERE user_id = ? AND item_id = ? LIMIT 1'
    ).bind(user.id, item.id).first()

    // Atomic transaction-like logic
    let action = 'created'

    if (existingVote) {
      if (existingVote.direction === direction) {
        // Same direction = remove vote
        await db.prepare('DELETE FROM votes WHERE id = ?').bind(existingVote.id).run()
        action = 'removed'
      } else {
        // Different direction = switch vote
        await db.prepare('UPDATE votes SET direction = ? WHERE id = ?')
          .bind(direction, existingVote.id).run()
        action = 'switched'
      }
    } else {
      // Create new vote
      const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.prepare(
        'INSERT INTO votes (id, user_id, item_id, direction) VALUES (?, ?, ?, ?)'
      ).bind(voteId, user.id, item.id, direction).run()
    }

    // Recalculate vote counts
    const counts = await db.prepare(
      `SELECT
         SUM(CASE WHEN direction = 'up' THEN 1 ELSE 0 END) as upvotes,
         SUM(CASE WHEN direction = 'down' THEN 1 ELSE 0 END) as downvotes
       FROM votes WHERE item_id = ?`
    ).bind(item.id).first()

    // Update item vote counts
    await db.prepare(
      'UPDATE items SET upvotes = ?, downvotes = ? WHERE id = ?'
    ).bind(
      counts?.upvotes || 0,
      counts?.downvotes || 0,
      item.id
    ).run()

    return c.json({
      success: true,
      action,
      vote: action !== 'removed' ? { direction } : null,
      stats: {
        upvotes: counts?.upvotes || 0,
        downvotes: counts?.downvotes || 0
      }
    })
  } catch (e) {
    console.error('Vote error:', e)
    return c.json({ error: 'Failed to vote' }, 500)
  }
})

/**
 * POST /api/items/:slug/rate
 * Rate an item (0-10 score)
 *
 * Request: { score: number }
 */
app.post('/items/:slug/rate', requireAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const { score } = await c.req.json()
    const db = c.env.DB
    const user = getUser(c)

    if (typeof score !== 'number' || score < 0 || score > 10) {
      return c.json({ error: 'Score must be a number between 0 and 10' }, 400)
    }

    // Get item
    const item = await db.prepare(
      'SELECT id FROM items WHERE slug = ? AND status = "published" LIMIT 1'
    ).bind(slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Check existing rating
    const existing = await db.prepare(
      'SELECT id, score FROM ratings WHERE user_id = ? AND item_id = ? LIMIT 1'
    ).bind(user.id, item.id).first()

    let action = 'created'
    if (existing) {
      await db.prepare('UPDATE ratings SET score = ? WHERE id = ?')
        .bind(score, existing.id).run()
      action = 'updated'
    } else {
      const ratingId = `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.prepare(
        'INSERT INTO ratings (id, user_id, item_id, score) VALUES (?, ?, ?, ?)'
      ).bind(ratingId, user.id, item.id, score).run()
    }

    // Recalculate rating aggregates
    const stats = await db.prepare(
      `SELECT
         SUM(score) as rating_sum,
         COUNT(*) as rating_count
       FROM ratings WHERE item_id = ?`
    ).bind(item.id).first()

    // Update item
    await db.prepare(
      'UPDATE items SET rating_sum = ?, rating_count = ? WHERE id = ?'
    ).bind(stats?.rating_sum || 0, stats?.rating_count || 0, item.id).run()

    return c.json({
      success: true,
      action,
      rating: { score },
      stats: {
        average_rating: stats?.rating_count ? (stats.rating_sum / stats.rating_count) : null,
        rating_count: stats?.rating_count || 0
      }
    })
  } catch (e) {
    console.error('Rate error:', e)
    return c.json({ error: 'Failed to rate item' }, 500)
  }
})

/**
 * POST /api/items/:slug/review
 * Write a review for an item
 *
 * Request: { content: string }
 */
app.post('/items/:slug/review', requireAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const { content } = await c.req.json()
    const db = c.env.DB
    const user = getUser(c)

    if (!content || content.trim().length < 10) {
      return c.json({ error: 'Review must be at least 10 characters' }, 400)
    }

    if (content.length > 5000) {
      return c.json({ error: 'Review must be at most 5000 characters' }, 400)
    }

    // Get item
    const item = await db.prepare(
      'SELECT id FROM items WHERE slug = ? AND status = "published" LIMIT 1'
    ).bind(slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Create review
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.prepare(
      'INSERT INTO reviews (id, user_id, item_id, content) VALUES (?, ?, ?, ?)'
    ).bind(reviewId, user.id, item.id, content.trim()).run()

    return c.json({
      success: true,
      review: {
        id: reviewId,
        content: content.trim(),
        upvotes: 0,
        created_at: new Date().toISOString()
      }
    })
  } catch (e) {
    console.error('Review error:', e)
    return c.json({ error: 'Failed to create review' }, 500)
  }
})

/**
 * POST /api/items/:slug/favorite
 * Add/remove item from favorites
 */
app.post('/items/:slug/favorite', requireAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const db = c.env.DB
    const user = getUser(c)

    // Get item
    const item = await db.prepare(
      'SELECT id FROM items WHERE slug = ? AND status = "published" LIMIT 1'
    ).bind(slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Check if already favorited
    const existing = await db.prepare(
      'SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ? LIMIT 1'
    ).bind(user.id, item.id).first()

    if (existing) {
      // Remove favorite
      await db.prepare('DELETE FROM favorites WHERE user_id = ? AND item_id = ?')
        .bind(user.id, item.id).run()
      return c.json({ success: true, action: 'removed' })
    } else {
      // Add favorite
      await db.prepare(
        'INSERT INTO favorites (user_id, item_id) VALUES (?, ?)'
      ).bind(user.id, item.id).run()
      return c.json({ success: true, action: 'added' })
    }
  } catch (e) {
    console.error('Favorite error:', e)
    return c.json({ error: 'Failed to toggle favorite' }, 500)
  }
})

/**
 * GET /api/items/:slug/comments
 * Fetch all comments for an item (paginated)
 */
app.get('/items/:slug/comments', optionalAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100)
    const offset = parseInt(c.req.query('offset') || '0')
    const db = c.env.DB
    const user = getUser(c)

    // Get item
    const item = await db.prepare(
      'SELECT id FROM items WHERE slug = ? AND status = "published" LIMIT 1'
    ).bind(slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Fetch comments
    const rows = await db.prepare(
      `SELECT
         c.id, c.user_id, c.content, c.upvotes, c.created_at, c.parent_id,
         u.username, u.avatar_url, u.karma,
         COALESCE(uc.comment_id IS NOT NULL, 0) as user_upvoted
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN (
         SELECT comment_id FROM comment_votes
         WHERE user_id = ? AND direction = 'up'
       ) uc ON uc.comment_id = c.id
       WHERE c.item_id = ?
       ORDER BY c.upvotes DESC, c.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(user ? user.id : null, item.id, limit, offset).all()

    const total = await db.prepare(
      'SELECT COUNT(*) as count FROM comments WHERE item_id = ?'
    ).bind(item.id).first()

    return c.json({
      comments: rows.results || [],
      pagination: {
        offset,
        limit,
        total: total?.count || 0,
        has_more: offset + limit < (total?.count || 0)
      }
    })
  } catch (e) {
    console.error('Fetch comments error:', e)
    return c.json({ error: 'Failed to fetch comments' }, 500)
  }
})

/**
 * POST /api/items/:slug/comment
 * Add a comment to an item
 *
 * Request: { content: string, parent_id?: string }
 */
app.post('/items/:slug/comment', requireAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const { content, parent_id } = await c.req.json()
    const db = c.env.DB
    const user = getUser(c)

    if (!content || content.trim().length < 1) {
      return c.json({ error: 'Comment cannot be empty' }, 400)
    }

    if (content.length > 2000) {
      return c.json({ error: 'Comment must be at most 2000 characters' }, 400)
    }

    // Get item
    const item = await db.prepare(
      'SELECT id FROM items WHERE slug = ? AND status = "published" LIMIT 1'
    ).bind(slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Validate parent comment if specified
    if (parent_id) {
      const parent = await db.prepare(
        'SELECT id FROM comments WHERE id = ? AND item_id = ? LIMIT 1'
      ).bind(parent_id, item.id).first()

      if (!parent) {
        return c.json({ error: 'Parent comment not found' }, 404)
      }
    }

    // Create comment
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.prepare(
      'INSERT INTO comments (id, user_id, item_id, parent_id, content) VALUES (?, ?, ?, ?, ?)'
    ).bind(commentId, user.id, item.id, parent_id || null, content.trim()).run()

    return c.json({
      success: true,
      comment: {
        id: commentId,
        user: { id: user.id, username: user.username },
        content: content.trim(),
        upvotes: 0,
        created_at: new Date().toISOString()
      }
    })
  } catch (e) {
    console.error('Create comment error:', e)
    return c.json({ error: 'Failed to create comment' }, 500)
  }
})

export default app

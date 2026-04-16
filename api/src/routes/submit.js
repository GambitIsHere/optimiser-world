import { Hono } from 'hono'
import { requireAuth, getUser } from '../lib/auth.js'

const app = new Hono()

/**
 * Generate a URL-safe slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/-$/, '')
}

/**
 * Validate item submission
 */
function validateSubmission(body) {
  const errors = []

  if (!body.title || body.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters')
  }
  if (body.title && body.title.length > 100) {
    errors.push('Title must be at most 100 characters')
  }

  if (!body.short_description || body.short_description.trim().length < 10) {
    errors.push('Short description must be at least 10 characters')
  }
  if (body.short_description && body.short_description.length > 200) {
    errors.push('Short description must be at most 200 characters')
  }

  if (body.description && body.description.length > 10000) {
    errors.push('Description must be at most 10000 characters')
  }

  if (!body.type || !['agent', 'skill'].includes(body.type)) {
    errors.push('Type must be "agent" or "skill"')
  }

  if (!body.category || body.category.trim().length === 0) {
    errors.push('Category is required')
  }

  if (body.tags && !Array.isArray(body.tags)) {
    errors.push('Tags must be an array')
  }
  if (body.tags && body.tags.length > 10) {
    errors.push('Maximum 10 tags allowed')
  }

  if (body.install_command && body.install_command.length > 500) {
    errors.push('Install command must be at most 500 characters')
  }

  if (body.version && !/^\d+\.\d+\.\d+/.test(body.version)) {
    errors.push('Version must follow semantic versioning (e.g., 1.0.0)')
  }

  return errors
}

/**
 * POST /api/submit
 * Create a new item (agent or skill)
 *
 * Request body:
 * {
 *   title: string (required, 5-100 chars),
 *   short_description: string (required, 10-200 chars),
 *   description?: string (0-10000 chars),
 *   readme?: string,
 *   type: 'agent' | 'skill' (required),
 *   category: string (required),
 *   tags?: string[] (max 10),
 *   install_command?: string,
 *   version?: string (semver, default: 1.0.0),
 *   compatibility?: { platform: string, minVersion: string }[],
 *   repo_url?: string,
 *   demo_url?: string,
 *   icon_url?: string
 * }
 *
 * Response:
 * - If author has karma > 100: immediate publish (status: 'published')
 * - Otherwise: pending review (status: 'pending')
 *
 * Post-insert: Generate embedding and upsert into Vectorize index
 */
app.post('/submit', requireAuth(), async (c) => {
  try {
    const db = c.env.DB
    const user = getUser(c)
    const body = await c.req.json()

    // Validate submission
    const errors = validateSubmission(body)
    if (errors.length > 0) {
      return c.json({ error: 'Validation failed', details: errors }, 400)
    }

    // Generate slug from title
    let slug = generateSlug(body.title)
    // Ensure uniqueness
    let counter = 1
    let originalSlug = slug
    while (counter < 100) {
      const existing = await db.prepare(
        'SELECT id FROM items WHERE slug = ? LIMIT 1'
      ).bind(slug).first()

      if (!existing) break

      slug = `${originalSlug}-${counter}`
      counter++
    }

    if (counter >= 100) {
      return c.json({ error: 'Could not generate unique slug' }, 400)
    }

    // Determine initial status based on author karma
    const status = user.karma >= 100 ? 'published' : 'pending'

    // Create item
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    await db.prepare(
      `INSERT INTO items (
        id, slug, title, short_description, description, readme,
        type, category, tags, author_id, version, install_command,
        compatibility, repo_url, demo_url, icon_url, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      itemId,
      slug,
      body.title.trim(),
      body.short_description.trim(),
      body.description ? body.description.trim() : null,
      body.readme ? body.readme.trim() : null,
      body.type,
      body.category.trim(),
      JSON.stringify(body.tags || []),
      user.id,
      body.version || '1.0.0',
      body.install_command ? body.install_command.trim() : null,
      JSON.stringify(body.compatibility || {}),
      body.repo_url ? body.repo_url.trim() : null,
      body.demo_url ? body.demo_url.trim() : null,
      body.icon_url ? body.icon_url.trim() : null,
      status,
      now,
      now
    ).run()

    // Generate embedding asynchronously (don't block response)
    if (c.env.AI && c.env.VECTORIZE) {
      // Combine title, description, and tags for embedding
      const embeddingText = [
        body.title,
        body.short_description,
        body.description || '',
        (body.tags || []).join(' ')
      ].filter(Boolean).join(' ').substring(0, 2048)

      try {
        const embeddingResponse = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text: [embeddingText]
        })

        if (embeddingResponse && embeddingResponse.data && embeddingResponse.data.length > 0) {
          const embedding = embeddingResponse.data[0]
          // Upsert into Vectorize
          await c.env.VECTORIZE.upsert([
            {
              id: itemId,
              values: embedding,
              metadata: {
                slug,
                title: body.title,
                type: body.type,
                category: body.category,
                author_id: user.id
              }
            }
          ])
        }
      } catch (e) {
        console.warn('Failed to generate embedding for item:', e.message)
        // Continue without embedding — FTS will still work
      }
    }

    // Fetch created item for response
    const created = await db.prepare(
      `SELECT
         id, slug, title, short_description, type, category, tags,
         version, status, created_at
       FROM items WHERE id = ? LIMIT 1`
    ).bind(itemId).first()

    return c.json({
      success: true,
      item: {
        id: created.id,
        slug: created.slug,
        title: created.title,
        short_description: created.short_description,
        type: created.type,
        category: created.category,
        tags: typeof created.tags === 'string' ? JSON.parse(created.tags) : created.tags,
        version: created.version,
        status: created.status,
        created_at: created.created_at
      },
      message: status === 'published'
        ? 'Item published successfully'
        : 'Item submitted for review (pending approval)'
    }, 201)
  } catch (e) {
    console.error('Submit error:', e)
    return c.json({
      error: 'Failed to submit item',
      details: c.env.ENVIRONMENT === 'development' ? e.message : undefined
    }, 500)
  }
})

/**
 * PATCH /api/items/:slug
 * Update an item (author-only)
 */
app.patch('/items/:slug', requireAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const db = c.env.DB
    const user = getUser(c)
    const updates = await c.req.json()

    // Get item
    const item = await db.prepare(
      'SELECT id, author_id FROM items WHERE slug = ? LIMIT 1'
    ).bind(slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Verify ownership
    if (item.author_id !== user.id) {
      return c.json({ error: 'Only author can edit this item' }, 403)
    }

    // Validate allowed updates
    const allowed = ['title', 'short_description', 'description', 'readme', 'category', 'tags', 'version', 'repo_url', 'demo_url', 'icon_url']
    const sanitized = {}

    for (const key of allowed) {
      if (key in updates) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400)
    }

    // Re-validate key fields if present
    if (sanitized.title && (sanitized.title.length < 5 || sanitized.title.length > 100)) {
      return c.json({ error: 'Title must be 5-100 characters' }, 400)
    }

    // Build update query
    const fields = Object.keys(sanitized).map(k => {
      if (k === 'tags') {
        return `${k} = ?`
      }
      return `${k} = ?`
    }).join(', ')

    const values = Object.keys(sanitized).map(k => {
      if (k === 'tags') {
        return JSON.stringify(sanitized[k])
      }
      return sanitized[k]
    })

    await db.prepare(
      `UPDATE items SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(...values, item.id).run()

    return c.json({ success: true, updated_fields: Object.keys(sanitized) })
  } catch (e) {
    console.error('Update item error:', e)
    return c.json({ error: 'Failed to update item' }, 500)
  }
})

/**
 * DELETE /api/items/:slug
 * Delete/archive an item (author-only)
 */
app.delete('/items/:slug', requireAuth(), async (c) => {
  try {
    const { slug } = c.req.param()
    const db = c.env.DB
    const user = getUser(c)

    // Get item
    const item = await db.prepare(
      'SELECT id, author_id FROM items WHERE slug = ? LIMIT 1'
    ).bind(slug).first()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Verify ownership
    if (item.author_id !== user.id) {
      return c.json({ error: 'Only author can delete this item' }, 403)
    }

    // Soft delete (archive instead of removing)
    await db.prepare(
      'UPDATE items SET status = "archived", updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(item.id).run()

    return c.json({ success: true, archived: true })
  } catch (e) {
    console.error('Delete item error:', e)
    return c.json({ error: 'Failed to delete item' }, 500)
  }
})

export default app

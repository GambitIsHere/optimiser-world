import { Hono } from 'hono'
import { reciprocalRankFusion, applyBoosts, sanitizeFtsQuery, buildSearchFilters } from '../lib/rrf.js'
import { optionalAuth, getUser } from '../lib/auth.js'
import { observeSearch } from '../learning/index.js'

const app = new Hono()

/**
 * POST /api/search
 *
 * Hybrid search combining semantic and keyword-based ranking
 *
 * Request body:
 * {
 *   query: string (required),
 *   category?: string,
 *   type?: 'agent' | 'skill',
 *   sort?: 'relevance' | 'hot' | 'new' | 'top',
 *   limit?: number (default 20),
 *   offset?: number (default 0)
 * }
 *
 * Algorithm:
 * 1. Generate embedding via Workers AI (if available)
 * 2. Run vector search against indexed items
 * 3. Run FTS5 keyword search against items table
 * 4. Merge results via Reciprocal Rank Fusion (RRF)
 * 5. Apply boost scoring (popularity, author karma, featured status)
 * 6. Apply sorting and pagination
 * 7. Return merged, ranked results
 *
 * Target latency: <800ms p95
 */
app.post('/search', optionalAuth(), async (c) => {
  try {
    const body = await c.req.json()
    const {
      query,
      category,
      type,
      sort = 'relevance',
      limit = 20,
      offset = 0
    } = body

    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return c.json({ error: 'Query is required and must be a non-empty string' }, 400)
    }

    if (limit < 1 || limit > 100) {
      return c.json({ error: 'Limit must be between 1 and 100' }, 400)
    }

    if (offset < 0 || offset > 10000) {
      return c.json({ error: 'Offset must be between 0 and 10000' }, 400)
    }

    const db = c.env.DB
    const user = getUser(c)
    const normalizedQuery = query.trim()

    // Build filter conditions
    const filters = buildSearchFilters(category, type, undefined, 'published')
    const filterWhere = filters.where.length > 0 ? ' AND ' + filters.where.join(' AND ') : ''

    // Step 1: Vector search (if Vectorize is configured)
    let semanticResults = []
    try {
      if (c.env.AI && c.env.VECTORIZE) {
        const embeddingResponse = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text: [normalizedQuery]
        })

        if (embeddingResponse && embeddingResponse.data && embeddingResponse.data.length > 0) {
          const queryEmbedding = embeddingResponse.data[0]

          // Query Vectorize index
          const vectorResults = await c.env.VECTORIZE.query(queryEmbedding, {
            topK: limit + offset + 20, // Fetch extra for merging with keyword results
            returnMetadata: true
          })

          // Fetch full item data from D1
          if (vectorResults.matches && vectorResults.matches.length > 0) {
            const vectorIds = vectorResults.matches.map(m => m.id)
            const placeholders = vectorIds.map(() => '?').join(',')

            const rows = await db.prepare(
              `SELECT
                 i.id, i.slug, i.title, i.short_description, i.description,
                 i.type, i.category, i.tags, i.author_id, i.upvotes, i.downvotes,
                 i.rating_sum, i.rating_count, i.downloads, i.featured,
                 i.version, i.icon_url, i.created_at, i.updated_at,
                 u.username as author_username, u.karma as author_karma,
                 COALESCE(uf.item_id IS NOT NULL, 0) as is_favorited
               FROM items i
               JOIN users u ON i.author_id = u.id
               LEFT JOIN favorites uf ON uf.item_id = i.id AND uf.user_id = ?
               WHERE i.id IN (${placeholders}) AND i.status = 'published'
               ORDER BY FIELD(i.id, ${placeholders.replace(/\?/g, '"?"')})`
            ).bind(user ? user.id : null, ...vectorIds, ...vectorIds).all()

            semanticResults = (rows.results || []).map((item, idx) => ({
              ...item,
              score: 1 / (idx + 60) // RFF base score
            }))
          }
        }
      }
    } catch (e) {
      console.warn('Vector search failed, falling back to keyword-only:', e.message)
    }

    // Step 2: FTS5 keyword search
    let keywordResults = []
    try {
      const ftsQuery = sanitizeFtsQuery(normalizedQuery)

      const ftsRows = await db.prepare(
        `SELECT
           i.id, i.slug, i.title, i.short_description, i.description,
           i.type, i.category, i.tags, i.author_id, i.upvotes, i.downvotes,
           i.rating_sum, i.rating_count, i.downloads, i.featured,
           i.version, i.icon_url, i.created_at, i.updated_at,
           u.username as author_username, u.karma as author_karma,
           COALESCE(uf.item_id IS NOT NULL, 0) as is_favorited,
           rank as fts_rank
         FROM items_fts fts
         JOIN items i ON fts.rowid = i.id
         JOIN users u ON i.author_id = u.id
         LEFT JOIN favorites uf ON uf.item_id = i.id AND uf.user_id = ?
         WHERE items_fts MATCH ? AND i.status = 'published'${filterWhere}
         ORDER BY rank
         LIMIT ?`
      ).bind(user ? user.id : null, ftsQuery, ...filters.bindings, limit + offset + 20).all()

      keywordResults = (ftsRows.results || []).map((item, idx) => ({
        ...item,
        score: 1 / (idx + 60) // RFF base score
      }))
    } catch (e) {
      console.warn('FTS search failed:', e.message)
    }

    // Step 3: Merge via Reciprocal Rank Fusion
    let results = reciprocalRankFusion(semanticResults, keywordResults)

    // Step 4: Apply boost scoring
    results = applyBoosts(results)

    // Step 5: Apply category/type filters (in-memory, for items found)
    if (category && results.length > 0) {
      results = results.filter(r => r.category === category)
    }
    if (type && results.length > 0) {
      results = results.filter(r => r.type === type)
    }

    // Step 6: Apply sorting
    if (sort === 'new') {
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sort === 'top') {
      results.sort((a, b) => {
        const aNet = a.upvotes - a.downvotes
        const bNet = b.upvotes - b.downvotes
        return bNet - aNet
      })
    } else if (sort === 'hot') {
      // Hot score is time-decay based
      results.sort((a, b) => {
        const aAge = Math.max(1, (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60))
        const bAge = Math.max(1, (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60))
        const aHot = ((a.upvotes - a.downvotes) / Math.pow(aAge, 1.5))
        const bHot = ((b.upvotes - b.downvotes) / Math.pow(bAge, 1.5))
        return bHot - aHot
      })
    }
    // relevance is default (RFF score already applied)

    // Step 7: Paginate
    const total = results.length
    const paginated = results.slice(offset, offset + limit)

    // Clean up internal fields for response
    const response = paginated.map(item => ({
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
      updated_at: item.updated_at,
      // Debug info (only in dev)
      ...(c.env.ENVIRONMENT === 'development' && {
        _relevanceScore: item.rffScore,
        _boostApplied: item.boostApplied,
        _sourcesFound: item.sourcesFound
      })
    }))

    // Record search observation (non-blocking)
    c.executionCtx.waitUntil(
      observeSearch(c.env.DB, c.env.CACHE, normalizedQuery, total, { category, type })
    )

    return c.json({
      success: true,
      query: normalizedQuery,
      results: response,
      pagination: {
        offset,
        limit,
        total,
        has_more: offset + limit < total
      },
      filters_applied: {
        category: category || null,
        type: type || null,
        sort
      }
    })
  } catch (e) {
    console.error('Search error:', e)
    return c.json({
      error: 'Search failed',
      details: c.env.ENVIRONMENT === 'development' ? e.message : undefined
    }, 500)
  }
})

/**
 * GET /api/search/suggestions
 * Returns autocomplete suggestions based on popular queries and items
 */
app.get('/search/suggestions', async (c) => {
  try {
    const q = c.req.query('q')

    if (!q || q.trim().length < 2) {
      return c.json({ suggestions: [] })
    }

    const db = c.env.DB
    const query = q.trim().toLowerCase()

    // Get matching item titles and tags
    const rows = await db.prepare(
      `SELECT DISTINCT title FROM items
       WHERE status = 'published' AND (
         title LIKE ? OR
         tags LIKE ?
       )
       LIMIT 10`
    ).bind(`%${query}%`, `%${query}%`).all()

    const suggestions = (rows.results || []).map(r => r.title)

    return c.json({ suggestions })
  } catch (e) {
    console.error('Suggestions error:', e)
    return c.json({ suggestions: [] })
  }
})

export default app

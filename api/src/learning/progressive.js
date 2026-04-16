/**
 * Progressive Disclosure for Marketplace Search
 * Inspired by claude-mem's 3-layer pattern:
 *   Layer 1: search → compact index (~50 tokens/result)
 *   Layer 2: timeline → contextual details
 *   Layer 3: get_observations → full content
 *
 * For the marketplace:
 *   Layer 1: Quick results → title, score, category (for feed/browsing)
 *   Layer 2: Detail results → + description, tags, install command (for item cards)
 *   Layer 3: Full results → + README, reviews, changelog (for item detail page)
 *
 * This saves bandwidth and improves perceived speed.
 */

export async function searchProgressive(db, query, layer = 1, options = {}) {
  const { category, type, limit = 20, offset = 0 } = options

  // Build base query
  let sql, countSql
  const params = []
  const countParams = []

  if (query) {
    const ftsQuery = query.split(/\s+/).map(t => `"${t}"`).join(' OR ')

    switch (layer) {
      case 1: // Compact index — minimal fields
        sql = `SELECT i.id, i.slug, i.title, i.type, i.category,
                      (i.upvotes - i.downvotes) as score, i.quality_score, i.featured
               FROM items_fts fts
               JOIN items i ON fts.rowid = i.id
               WHERE items_fts MATCH ? AND i.status = 'published'`
        break

      case 2: // Detail — add description, tags, author info
        sql = `SELECT i.id, i.slug, i.title, i.short_description, i.type, i.category,
                      i.tags, i.install_command, i.version,
                      (i.upvotes - i.downvotes) as score, i.upvotes, i.downvotes,
                      i.downloads, i.quality_score, i.featured, i.created_at,
                      i.github_stars, i.github_forks
               FROM items_fts fts
               JOIN items i ON fts.rowid = i.id
               WHERE items_fts MATCH ? AND i.status = 'published'`
        break

      case 3: // Full — everything including README
        sql = `SELECT i.*
               FROM items_fts fts
               JOIN items i ON fts.rowid = i.id
               WHERE items_fts MATCH ? AND i.status = 'published'`
        break

      default:
        sql = `SELECT i.id, i.slug, i.title, i.type, i.category,
                      (i.upvotes - i.downvotes) as score
               FROM items_fts fts
               JOIN items i ON fts.rowid = i.id
               WHERE items_fts MATCH ? AND i.status = 'published'`
    }

    params.push(ftsQuery)
    countParams.push(ftsQuery)
    countSql = `SELECT COUNT(*) as total FROM items_fts fts JOIN items i ON fts.rowid = i.id WHERE items_fts MATCH ? AND i.status = 'published'`
  } else {
    // No query — return by quality score
    const baseSelect = layer === 1
      ? `i.id, i.slug, i.title, i.type, i.category, (i.upvotes - i.downvotes) as score, i.quality_score, i.featured`
      : layer === 2
      ? `i.id, i.slug, i.title, i.short_description, i.type, i.category, i.tags, i.install_command, i.version, (i.upvotes - i.downvotes) as score, i.upvotes, i.downvotes, i.downloads, i.quality_score, i.featured, i.created_at, i.github_stars, i.github_forks`
      : `i.*`

    sql = `SELECT ${baseSelect} FROM items i WHERE i.status = 'published'`
    countSql = `SELECT COUNT(*) as total FROM items i WHERE i.status = 'published'`
  }

  // Apply filters
  if (category) {
    sql += ` AND i.category = ?`
    countSql += ` AND i.category = ?`
    params.push(category)
    countParams.push(category)
  }
  if (type) {
    sql += ` AND i.type = ?`
    countSql += ` AND i.type = ?`
    params.push(type)
    countParams.push(type)
  }

  sql += ` ORDER BY i.quality_score DESC, i.featured DESC LIMIT ? OFFSET ?`
  params.push(limit, offset)

  const [results, countResult] = await Promise.all([
    db.prepare(sql).bind(...params).all(),
    db.prepare(countSql).bind(...countParams).first(),
  ])

  return {
    results: results.results || [],
    total: countResult?.total || 0,
    layer,
    query,
  }
}

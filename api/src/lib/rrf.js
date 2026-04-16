/**
 * Reciprocal Rank Fusion (RRF)
 * Merges two ranked result lists using the RRF formula:
 * RRF_score = Σ 1 / (rank + k) for each result list
 * k = 60 is the standard constant to prevent rank 0 from dominating
 *
 * RRF is a pure ranking function — it doesn't compute scores from scratch
 * but rather combines existing rankings from different search methods.
 */

/**
 * Reciprocal Rank Fusion algorithm
 * Merges semantic and keyword search results into a single ranked list
 */
export function reciprocalRankFusion(semanticResults = [], keywordResults = [], k = 60) {
  const scoreMap = new Map()

  // Score semantic results
  semanticResults.forEach((item, rank) => {
    const itemId = item.id
    const rffScore = 1 / (rank + k)

    if (scoreMap.has(itemId)) {
      const existing = scoreMap.get(itemId)
      existing.rffScore += rffScore
      existing.sourcesFound++
    } else {
      scoreMap.set(itemId, {
        ...item,
        rffScore,
        sourcesFound: 1,
        semanticRank: rank
      })
    }
  })

  // Score keyword results
  keywordResults.forEach((item, rank) => {
    const itemId = item.id
    const rffScore = 1 / (rank + k)

    if (scoreMap.has(itemId)) {
      const existing = scoreMap.get(itemId)
      existing.rffScore += rffScore
      existing.sourcesFound++
      existing.keywordRank = rank
    } else {
      scoreMap.set(itemId, {
        ...item,
        rffScore,
        sourcesFound: 1,
        keywordRank: rank
      })
    }
  })

  // Convert to array and sort by RFF score (descending)
  const merged = Array.from(scoreMap.values()).sort((a, b) => {
    // Primary: RFF score
    if (b.rffScore !== a.rffScore) {
      return b.rffScore - a.rffScore
    }

    // Tiebreaker: items found in both sources rank higher
    if (b.sourcesFound !== a.sourcesFound) {
      return b.sourcesFound - a.sourcesFound
    }

    // Tiebreaker: if both in semantic, lower semantic rank wins
    if (a.semanticRank !== undefined && b.semanticRank !== undefined) {
      return a.semanticRank - b.semanticRank
    }

    return 0
  })

  return merged
}

/**
 * Apply boost scoring on top of RRF
 * Boosts results based on popularity, author reputation, and featured status
 * This should be called AFTER RRF merging but BEFORE final pagination
 */
export function applyBoosts(results) {
  return results.map(item => {
    let boost = 0

    // Popular items get a boost (Wilsonian confidence scoring)
    const netVotes = (item.upvotes || 0) - (item.downvotes || 0)
    if (netVotes > 100) boost += 0.3
    if (netVotes > 50) boost += 0.15
    if (netVotes > 20) boost += 0.1

    // High-download items are useful
    if ((item.downloads || 0) > 1000) boost += 0.3
    if ((item.downloads || 0) > 500) boost += 0.2
    if ((item.downloads || 0) > 100) boost += 0.1

    // High-karma authors are more credible
    const authorKarma = item.author_karma || 0
    if (authorKarma > 1000) boost += 0.2
    if (authorKarma > 500) boost += 0.1
    if (authorKarma > 100) boost += 0.05

    // Well-rated items (rating_count >= 5 to avoid gaming)
    if (item.rating_count && item.rating_count >= 5) {
      const avgRating = item.rating_sum / item.rating_count
      if (avgRating >= 9) boost += 0.2
      if (avgRating >= 8) boost += 0.1
    }

    // Featured items get prominent boost
    if (item.featured) boost += 0.25

    // Newly updated items get a small recency boost
    if (item.updated_at) {
      const daysSinceUpdate = Math.max(
        0,
        (Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceUpdate < 7) boost += 0.15
      if (daysSinceUpdate < 3) boost += 0.1
    }

    return {
      ...item,
      rffScore: (item.rffScore || 0) + boost,
      boostApplied: boost
    }
  }).sort((a, b) => b.rffScore - a.rffScore)
}

/**
 * Build search filters for D1 queries
 * Returns { where: string[], bindings: any[] }
 */
export function buildSearchFilters(category, type, isPaid, status = 'published') {
  const where = []
  const bindings = []

  where.push('i.status = ?')
  bindings.push(status)

  if (category) {
    where.push('i.category = ?')
    bindings.push(category)
  }

  if (type) {
    where.push('i.type = ?')
    bindings.push(type)
  }

  if (isPaid !== undefined) {
    // isPaid is not in current schema, but reserve for future use
    // where.push('i.is_paid = ?')
    // bindings.push(isPaid ? 1 : 0)
  }

  return { where, bindings }
}

/**
 * Sanitize FTS query string
 * Escapes special characters and builds proper FTS query
 */
export function sanitizeFtsQuery(query) {
  // Remove leading/trailing whitespace
  query = query.trim()

  // Split into terms
  const terms = query.split(/\s+/).filter(t => t.length > 0)

  // Build FTS5 query — each term in quotes for exact phrase matching
  // with OR between terms for broader matching
  return terms.map(term => `"${term.replace(/"/g, '')}"*`).join(' OR ')
}

/**
 * Calculate relevance score for post-search ranking
 * Used when RRF and boosts aren't sufficient
 */
export function calculateRelevanceScore(query, item) {
  let score = 0
  const queryTerms = query.toLowerCase().split(/\s+/)

  // Exact title match
  if (item.title && item.title.toLowerCase() === query.toLowerCase()) {
    score += 10
  }

  // Title contains all query terms
  if (item.title) {
    const titleLower = item.title.toLowerCase()
    const allTermsInTitle = queryTerms.every(term => titleLower.includes(term))
    if (allTermsInTitle) score += 5
  }

  // Query term frequency in title (higher weight)
  if (item.title) {
    const titleLower = item.title.toLowerCase()
    queryTerms.forEach(term => {
      const matches = (titleLower.match(new RegExp(term, 'g')) || []).length
      score += matches * 0.5
    })
  }

  // Query term frequency in description (lower weight)
  if (item.description) {
    const descLower = item.description.toLowerCase()
    queryTerms.forEach(term => {
      const matches = (descLower.match(new RegExp(term, 'g')) || []).length
      score += matches * 0.1
    })
  }

  // Tags match
  if (item.tags) {
    try {
      const tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags
      queryTerms.forEach(term => {
        if (tags.some(tag => tag.toLowerCase().includes(term))) {
          score += 2
        }
      })
    } catch (e) {
      // Tags not valid JSON, skip
    }
  }

  return score
}

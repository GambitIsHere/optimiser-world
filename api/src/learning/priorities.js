/**
 * Updates scraper priorities based on learning insights
 * Search misses become scraper queries — the marketplace discovers what users want
 */

export async function updateScraperPriorities(db, kv) {
  const stats = { updated: 0 }

  // Get the latest unmet_demand insight
  const insight = await db.prepare(
    `SELECT data FROM insights WHERE type = 'unmet_demand' ORDER BY created_at DESC LIMIT 1`
  ).first()

  if (!insight) return stats

  const misses = JSON.parse(insight.data)

  // Convert search misses into scraper queries
  // Only promote queries searched 3+ times (real demand, not one-off)
  const priorities = misses
    .filter(m => m.count >= 3)
    .map(m => ({
      query: m.query,
      demand: m.count,
      // Build a GitHub-targeted query from the user's search
      githubQuery: `${m.query} stars:>3`,
      firecrawlQuery: `${m.query} github repository claude MCP skill agent`,
    }))

  if (priorities.length > 0) {
    await kv.put('scraper:dynamic-priorities', JSON.stringify(priorities), { expirationTtl: 86400 * 7 })
    stats.updated = priorities.length
  }

  return stats
}

/**
 * Get current dynamic scraper priorities
 * Called by the scraper to add user-demand queries to its run
 */
export async function getDynamicPriorities(kv) {
  const data = await kv.get('scraper:dynamic-priorities', 'json')
  return data || []
}

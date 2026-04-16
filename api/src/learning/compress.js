/**
 * Compresses raw observations into actionable insights
 * Similar to claude-mem's observation → summary compression
 */

export async function compressObservations(db) {
  const stats = { observationsProcessed: 0, insightsGenerated: 0 }

  // Get unprocessed observations from the last 24 hours
  const cutoff = new Date(Date.now() - 86400000).toISOString()
  const observations = await db.prepare(
    'SELECT * FROM observations WHERE processed = 0 AND created_at > ? ORDER BY created_at'
  ).bind(cutoff).all()

  const rows = observations.results || []
  stats.observationsProcessed = rows.length
  if (rows.length === 0) return stats

  // Group by type
  const grouped = {}
  for (const obs of rows) {
    const type = obs.type
    if (!grouped[type]) grouped[type] = []
    grouped[type].push({ ...obs, data: JSON.parse(obs.data) })
  }

  // Compress search observations → trending queries insight
  if (grouped.search) {
    const queryCounts = {}
    for (const obs of grouped.search) {
      const q = obs.data.query?.toLowerCase().trim()
      if (q) queryCounts[q] = (queryCounts[q] || 0) + 1
    }

    const topQueries = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }))

    if (topQueries.length > 0) {
      await db.prepare(
        `INSERT INTO insights (type, data, created_at) VALUES (?, ?, datetime('now'))`
      ).bind('trending_queries', JSON.stringify(topQueries)).run()
      stats.insightsGenerated++
    }
  }

  // Compress search misses → unmet demand insight
  if (grouped.search_miss) {
    const missCounts = {}
    for (const obs of grouped.search_miss) {
      const q = obs.data.query?.toLowerCase().trim()
      if (q) missCounts[q] = (missCounts[q] || 0) + 1
    }

    const topMisses = Object.entries(missCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }))

    if (topMisses.length > 0) {
      await db.prepare(
        `INSERT INTO insights (type, data, created_at) VALUES (?, ?, datetime('now'))`
      ).bind('unmet_demand', JSON.stringify(topMisses)).run()
      stats.insightsGenerated++
    }
  }

  // Compress vote observations → momentum insight
  if (grouped.vote) {
    const itemVelocity = {}
    for (const obs of grouped.vote) {
      const slug = obs.data.itemSlug
      if (!itemVelocity[slug]) itemVelocity[slug] = { up: 0, down: 0 }
      if (obs.data.direction === 'up') itemVelocity[slug].up++
      else itemVelocity[slug].down++
    }

    const momentum = Object.entries(itemVelocity)
      .map(([slug, v]) => ({ slug, netVotes: v.up - v.down, velocity: v.up + v.down }))
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 20)

    if (momentum.length > 0) {
      await db.prepare(
        `INSERT INTO insights (type, data, created_at) VALUES (?, ?, datetime('now'))`
      ).bind('vote_momentum', JSON.stringify(momentum)).run()
      stats.insightsGenerated++
    }
  }

  // Compress usage reports → reliability insight
  if (grouped.usage_report) {
    const itemReliability = {}
    for (const obs of grouped.usage_report) {
      const slug = obs.data.itemSlug
      if (!itemReliability[slug]) itemReliability[slug] = { success: 0, failure: 0, totalDuration: 0 }
      if (obs.data.outcome === 'success') itemReliability[slug].success++
      else itemReliability[slug].failure++
      itemReliability[slug].totalDuration += obs.data.durationMs || 0
    }

    const reliability = Object.entries(itemReliability)
      .map(([slug, r]) => ({
        slug,
        successRate: r.success / (r.success + r.failure),
        totalRuns: r.success + r.failure,
        avgDuration: r.totalDuration / (r.success + r.failure),
      }))
      .filter(r => r.totalRuns >= 3) // minimum sample size
      .sort((a, b) => b.successRate - a.successRate)

    if (reliability.length > 0) {
      await db.prepare(
        `INSERT INTO insights (type, data, created_at) VALUES (?, ?, datetime('now'))`
      ).bind('reliability_scores', JSON.stringify(reliability)).run()
      stats.insightsGenerated++
    }
  }

  // Mark observations as processed
  const ids = rows.map(r => r.id)
  if (ids.length > 0) {
    // Process in batches of 100
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100)
      const placeholders = batch.map(() => '?').join(',')
      await db.prepare(`UPDATE observations SET processed = 1 WHERE id IN (${placeholders})`).bind(...batch).run()
    }
  }

  return stats
}

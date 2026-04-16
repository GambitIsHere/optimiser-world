/**
 * Recalculates item quality scores using real usage data
 * Usage outcomes are the strongest quality signal — more reliable than stars
 */

export async function recalculateQualityScores(db) {
  const stats = { updated: 0 }

  // Get the latest reliability insight
  const insight = await db.prepare(
    `SELECT data FROM insights WHERE type = 'reliability_scores' ORDER BY created_at DESC LIMIT 1`
  ).first()

  if (!insight) return stats

  const reliabilityData = JSON.parse(insight.data)

  for (const item of reliabilityData) {
    // Calculate usage-weighted quality adjustment
    // High success rate with many runs = big positive boost
    // Low success rate = quality penalty
    const reliabilityBoost = Math.round(
      (item.successRate - 0.5) * 20 * Math.min(item.totalRuns / 10, 3) // max 3x multiplier
    )

    try {
      await db.prepare(
        `UPDATE items SET
          quality_score = MAX(0, MIN(100, quality_score + ?)),
          updated_at = datetime('now')
        WHERE slug = ?`
      ).bind(reliabilityBoost, item.slug).run()
      stats.updated++
    } catch (e) {
      console.error(`[quality] Failed to update ${item.slug}:`, e.message)
    }
  }

  // Also boost items with high vote momentum
  const momentumInsight = await db.prepare(
    `SELECT data FROM insights WHERE type = 'vote_momentum' ORDER BY created_at DESC LIMIT 1`
  ).first()

  if (momentumInsight) {
    const momentum = JSON.parse(momentumInsight.data)
    for (const item of momentum.slice(0, 10)) {
      if (item.netVotes > 5) {
        try {
          await db.prepare(
            `UPDATE items SET
              quality_score = MIN(100, quality_score + ?),
              updated_at = datetime('now')
            WHERE slug = ?`
          ).bind(Math.min(5, Math.floor(item.netVotes / 3)), item.slug).run()
          stats.updated++
        } catch (e) {
          // Non-critical
        }
      }
    }
  }

  return stats
}

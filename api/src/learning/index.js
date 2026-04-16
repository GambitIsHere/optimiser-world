/**
 * Self-Learning System for Optimiser.World
 * Inspired by claude-mem's observation → summary → context injection pattern
 *
 * The marketplace continuously learns from:
 * - Search queries (what users want but can't find → scraper priorities)
 * - Vote patterns (what's actually good vs. what's just popular)
 * - Install/usage data (real-world validation of quality)
 * - Report outcomes (success/failure rates → quality signals)
 *
 * This data feeds back into:
 * - Scraper query priorities (discover what users are searching for)
 * - Search boost scoring (promote items with high success rates)
 * - Quality scores (usage outcomes override star counts)
 * - Category trending (detect emerging categories)
 */

import { compressObservations } from './compress.js'
import { updateScraperPriorities } from './priorities.js'
import { recalculateQualityScores } from './quality.js'

/**
 * Record an observation (event) in the learning system
 */
export async function observe(db, event) {
  const { type, data, userId, timestamp } = event

  await db.prepare(
    `INSERT INTO observations (type, data, user_id, created_at) VALUES (?, ?, ?, ?)`
  ).bind(type, JSON.stringify(data), userId || null, timestamp || new Date().toISOString()).run()

  return { recorded: true, type }
}

/**
 * Record a search observation — tracks what users search for
 */
export async function observeSearch(db, kv, query, resultCount, filters) {
  await observe(db, {
    type: 'search',
    data: { query, resultCount, filters, hasResults: resultCount > 0 }
  })

  // Track zero-result queries — these become scraper priorities
  if (resultCount === 0) {
    await observe(db, {
      type: 'search_miss',
      data: { query, filters }
    })

    // Increment miss counter in KV
    const key = `search_miss:${query.toLowerCase().trim()}`
    const count = parseInt(await kv.get(key) || '0') + 1
    await kv.put(key, String(count), { expirationTtl: 86400 * 30 }) // 30 day TTL
  }
}

/**
 * Record a vote observation
 */
export async function observeVote(db, itemSlug, direction, userId) {
  await observe(db, {
    type: 'vote',
    data: { itemSlug, direction },
    userId,
  })
}

/**
 * Record an install/download observation
 */
export async function observeInstall(db, itemSlug, source, userId) {
  await observe(db, {
    type: 'install',
    data: { itemSlug, source }, // source: 'cli', 'web', 'plugin'
    userId,
  })
}

/**
 * Record a usage report observation
 */
export async function observeUsageReport(db, itemSlug, outcome, durationMs, userId) {
  await observe(db, {
    type: 'usage_report',
    data: { itemSlug, outcome, durationMs },
    userId,
  })
}

/**
 * Run the learning cycle — compress observations into insights
 * Called on a schedule (e.g., daily) or after enough observations accumulate
 */
export async function runLearningCycle(env) {
  const db = env.DB
  const kv = env.CACHE

  const stats = {
    observationsProcessed: 0,
    insightsGenerated: 0,
    scraperPrioritiesUpdated: 0,
    qualityScoresUpdated: 0,
    startedAt: new Date().toISOString(),
  }

  try {
    // Step 1: Compress recent observations into insights
    const insights = await compressObservations(db)
    stats.observationsProcessed = insights.observationsProcessed
    stats.insightsGenerated = insights.insightsGenerated

    // Step 2: Update scraper priorities based on search misses and trends
    const priorities = await updateScraperPriorities(db, kv)
    stats.scraperPrioritiesUpdated = priorities.updated

    // Step 3: Recalculate quality scores using usage data
    const quality = await recalculateQualityScores(db)
    stats.qualityScoresUpdated = quality.updated

    stats.finishedAt = new Date().toISOString()

    // Save learning cycle stats
    await kv.put('learning:last-cycle', JSON.stringify(stats), { expirationTtl: 86400 * 7 })
  } catch (e) {
    stats.error = e.message
    console.error('[learning] Cycle failed:', e)
  }

  return stats
}

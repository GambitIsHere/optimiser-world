/**
 * Scoring functions for ranking items
 * Implements popular ranking algorithms used in social platforms
 */

/**
 * Reddit-style hot score
 * Gives high weight to recent items with good voting
 * Formula: sign(score) * log10(max(1, abs(score))) + (timestamp - t0) / 45000
 *
 * Simplified version focusing on vote velocity:
 * hot_score = (upvotes - downvotes) / hours_age^1.5
 */
export function hotScore(upvotes, downvotes, createdAt) {
  const net = (upvotes || 0) - (downvotes || 0)
  const ageMs = Math.max(0, Date.now() - new Date(createdAt).getTime())
  const ageHours = Math.max(1, ageMs / (1000 * 60 * 60))

  // Prevent time decay from making old items with 0 votes go negative
  if (net <= 0 && ageHours > 24) {
    return -1000
  }

  return net / Math.pow(ageHours, 1.5)
}

/**
 * Rising score
 * Emphasizes vote velocity — how fast an item is gaining traction
 * Formula: (votes / hours) * log2(votes)
 *
 * This highlights items that are trending, even if they're newer
 */
export function risingScore(upvotes, downvotes, createdAt) {
  const net = Math.max(1, (upvotes || 0) - (downvotes || 0))
  const ageMs = Math.max(0, Date.now() - new Date(createdAt).getTime())
  const ageHours = Math.max(1, ageMs / (1000 * 60 * 60))

  // Vote velocity (votes per hour)
  const velocity = net / ageHours

  // Log boost to prevent very high vote counts from dominating
  const logBoost = Math.log2(Math.max(2, net))

  return velocity * logBoost
}

/**
 * Controversy score
 * Highlights items with both upvotes and downvotes (high engagement)
 * Useful for "most discussed" rankings
 * Formula: min(upvotes, downvotes) ^ 2 / (upvotes + downvotes)
 */
export function controversyScore(upvotes, downvotes) {
  const up = upvotes || 0
  const down = downvotes || 0
  const total = up + down

  if (total === 0) return 0

  // Controversy is when there's strong disagreement
  return Math.min(up, down) * Math.min(up, down) / total
}

/**
 * Top score (cumulative)
 * Simple net vote score with recency decay
 * Used for "best of all time" with light time weighting
 */
export function topScore(upvotes, downvotes, createdAt) {
  const net = (upvotes || 0) - (downvotes || 0)
  const ageMs = Math.max(0, Date.now() - new Date(createdAt).getTime())
  const ageMonths = Math.max(1, ageMs / (1000 * 60 * 60 * 24 * 30))

  // Very light decay: months^0.25 is almost flat
  return net / Math.pow(ageMonths, 0.25)
}

/**
 * Bayesian confidence score
 * Accounts for both rating average and sample size
 * Prevents items with few high ratings from ranking too high
 */
export function bayesianConfidence(ratingSum, ratingCount, globalAvg = 5) {
  if (ratingCount === 0) return globalAvg

  const average = ratingSum / ratingCount

  // Weight factor — how many ratings to "trust" the average
  const weightFactor = 10
  const weightedAverage = (ratingCount * average + weightFactor * globalAvg) / (ratingCount + weightFactor)

  return weightedAverage
}

/**
 * Quality score combining multiple signals
 * Used as a tiebreaker or primary score for curated lists
 */
export function qualityScore(item) {
  let score = 0

  // Base: net votes
  const netVotes = (item.upvotes || 0) - (item.downvotes || 0)
  score += Math.min(netVotes, 100) * 0.5 // Cap at 100 to prevent vote manipulation

  // Rating signal (if available)
  if (item.rating_count && item.rating_count >= 3) {
    const avgRating = item.rating_sum / item.rating_count
    score += avgRating * 10
  }

  // Download frequency signal
  const downloads = item.downloads || 0
  score += Math.log10(Math.max(1, downloads)) * 5

  // Author reputation
  const authorKarma = item.author_karma || 0
  score += Math.log10(Math.max(1, authorKarma)) * 2

  // Recency boost (items updated recently get small boost)
  if (item.updated_at) {
    const daysSinceUpdate = (Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 7) {
      score += 10
    } else if (daysSinceUpdate < 30) {
      score += 5
    }
  }

  // Featured items
  if (item.featured) {
    score += 50
  }

  return score
}

/**
 * Decay function for time-based filtering
 * Returns a multiplier (0-1) based on item age
 * Useful for "show me recent items" queries
 */
export function timeDecayMultiplier(createdAt, halfLifeHours = 168) {
  const ageMs = Math.max(0, Date.now() - new Date(createdAt).getTime())
  const ageHours = ageMs / (1000 * 60 * 60)

  // Exponential decay with specified half-life
  return Math.pow(0.5, ageHours / halfLifeHours)
}

/**
 * Combined scoring function
 * Blends multiple scoring methods based on context
 */
export function combinedScore(item, context = {}) {
  const {
    method = 'hot', // 'hot', 'rising', 'top', 'quality'
    weights = {}
  } = context

  let score = 0

  switch (method) {
    case 'hot':
      score = hotScore(item.upvotes, item.downvotes, item.created_at)
      break

    case 'rising':
      score = risingScore(item.upvotes, item.downvotes, item.created_at)
      break

    case 'top':
      score = topScore(item.upvotes, item.downvotes, item.created_at)
      break

    case 'quality':
      score = qualityScore(item)
      break

    case 'controversy':
      score = controversyScore(item.upvotes, item.downvotes)
      break

    default:
      score = topScore(item.upvotes, item.downvotes, item.created_at)
  }

  // Apply time decay if specified
  if (weights.timeDecay) {
    const decay = timeDecayMultiplier(item.created_at, weights.timeDecayHalfLife || 168)
    score *= decay
  }

  // Apply recency bonus if specified
  if (weights.recencyBonus) {
    const daysSinceUpdate = (Date.now() - new Date(item.updated_at || item.created_at).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 7) {
      score *= 1.2
    }
  }

  return score
}

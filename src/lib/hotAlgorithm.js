/**
 * Reddit-style hot score algorithm
 * Score = (upvotes - downvotes) / (hours_since_posted ^ 1.5)
 */
export function hotScore(upvotes, downvotes, createdAt) {
  const net = upvotes - downvotes
  const ageHours = Math.max(1, (Date.now() - new Date(createdAt).getTime()) / 3600000)
  return net / Math.pow(ageHours, 1.5)
}

/**
 * Rising algorithm — items gaining votes faster than age suggests
 */
export function risingScore(upvotes, downvotes, createdAt) {
  const net = upvotes - downvotes
  const ageHours = Math.max(1, (Date.now() - new Date(createdAt).getTime()) / 3600000)
  // Higher score for items with high vote-to-age ratio
  return (net / ageHours) * Math.log2(Math.max(2, net))
}

/**
 * Sort items by different criteria
 */
export function sortItems(items, sortBy = 'hot') {
  const sorted = [...items]
  switch (sortBy) {
    case 'hot':
      return sorted.sort((a, b) => hotScore(b.upvotes, b.downvotes, b.createdAt) - hotScore(a.upvotes, a.downvotes, a.createdAt))
    case 'new':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'top':
      return sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    case 'rising':
      return sorted.sort((a, b) => risingScore(b.upvotes, b.downvotes, b.createdAt) - risingScore(a.upvotes, a.downvotes, a.createdAt))
    default:
      return sorted
  }
}

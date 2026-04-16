/**
 * Conditional class merge utility
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

/**
 * Format large numbers (1234 → 1.2k)
 */
export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num)
}

/**
 * Format relative time (2 hours ago, 3 days ago)
 */
export function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ]
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s)
    if (count >= 1) return `${count}${label} ago`
  }
  return 'just now'
}

/**
 * Get karma tier
 */
export function getKarmaTier(karma) {
  if (karma >= 10000) return { tier: 'diamond', color: '#5B8DEF', label: 'Diamond' }
  if (karma >= 1000) return { tier: 'gold', color: '#FBBF24', label: 'Gold' }
  if (karma >= 100) return { tier: 'silver', color: '#94A3B8', label: 'Silver' }
  return { tier: 'bronze', color: '#CD7F32', label: 'Bronze' }
}

/**
 * Slugify text
 */
export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

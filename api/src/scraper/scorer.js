/**
 * Score a GitHub repo for marketplace quality ranking
 * Returns a 0-100 score broken down by category
 */
export function scoreRepo(repoData, validation, readmeContent) {
  const scores = {}

  // 1. Popularity (0-25 points)
  const stars = repoData.stargazers_count || 0
  const forks = repoData.forks_count || 0
  const watchers = repoData.watchers_count || 0
  scores.popularity = Math.min(
    25,
    Math.log2(stars + 1) * 3 + // stars (logarithmic)
      Math.log2(forks + 1) * 4 + // forks weighted higher (shows real usage)
      Math.log2(watchers + 1) * 1
  )

  // 2. Activity / Freshness (0-20 points)
  const pushedAt = new Date(repoData.pushed_at)
  const daysSincePush = (Date.now() - pushedAt.getTime()) / 86400000
  if (daysSincePush < 7) scores.freshness = 20
  else if (daysSincePush < 30) scores.freshness = 16
  else if (daysSincePush < 90) scores.freshness = 12
  else if (daysSincePush < 180) scores.freshness = 6
  else scores.freshness = 2

  // 3. Documentation quality (0-20 points)
  scores.documentation = 0
  if (readmeContent) {
    const len = readmeContent.length
    if (len > 2000) scores.documentation += 8 // substantial README
    else if (len > 500) scores.documentation += 4
    if (readmeContent.includes('## ')) scores.documentation += 3 // has sections
    if (readmeContent.includes('```')) scores.documentation += 3 // has code examples
    if (readmeContent.match(/install|usage|getting started/i))
      scores.documentation += 3 // has setup instructions
    if (repoData.license) scores.documentation += 3 // has license
  }
  scores.documentation = Math.min(20, scores.documentation)

  // 4. Validation confidence (0-20 points) — how clearly it's a skill/agent
  scores.confidence = Math.min(20, validation.confidence * 0.2)

  // 5. Community signals (0-15 points)
  scores.community = 0
  if (repoData.has_issues) scores.community += 3
  if (repoData.has_wiki) scores.community += 2
  if (!repoData.fork) scores.community += 5 // original work valued higher
  if (repoData.open_issues_count > 0 && repoData.open_issues_count < 50)
    scores.community += 3 // active but not abandoned
  if ((repoData.topics || []).length >= 3) scores.community += 2 // well-tagged
  scores.community = Math.min(15, scores.community)

  // Total
  const total = Object.values(scores).reduce((a, b) => a + b, 0)

  return {
    total: Math.round(total),
    breakdown: scores,
    tier: total >= 70 ? 'featured' : total >= 50 ? 'quality' : total >= 30 ? 'standard' : 'new'
  }
}

/**
 * Determine the best category for a repo
 */
export function categorizeRepo(repoData, readmeContent, topics) {
  const text = `${repoData.description || ''} ${readmeContent || ''} ${topics.join(' ')}`.toLowerCase()

  const categorySignals = {
    'cro-growth': [
      'conversion',
      'cro',
      'growth',
      'a/b test',
      'funnel',
      'optimization',
      'analytics tracking'
    ],
    devops: [
      'deploy',
      'ci/cd',
      'docker',
      'kubernetes',
      'vercel',
      'aws',
      'infrastructure',
      'github action',
      'devops'
    ],
    content: ['content', 'writing', 'copy', 'blog', 'seo', 'marketing', 'documentation'],
    analytics: ['analytics', 'data', 'dashboard', 'metrics', 'monitoring', 'posthog', 'ga4', 'mixpanel'],
    design: [
      'design',
      'ui',
      'ux',
      'figma',
      'css',
      'tailwind',
      'component',
      'design system'
    ],
    product: ['product', 'research', 'user', 'feedback', 'survey', 'roadmap', 'planning'],
    finance: ['finance', 'billing', 'stripe', 'payment', 'invoice', 'accounting'],
    'starter-kits': ['starter', 'boilerplate', 'template', 'scaffold', 'kit']
  }

  let bestCategory = 'product' // default
  let bestScore = 0

  for (const [category, keywords] of Object.entries(categorySignals)) {
    const hits = keywords.filter(kw => text.includes(kw)).length
    if (hits > bestScore) {
      bestScore = hits
      bestCategory = category
    }
  }

  return bestCategory
}

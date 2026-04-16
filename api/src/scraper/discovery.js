import { FirecrawlClient } from './firecrawl.js'
import { GitHubClient } from './github.js'
import { validateRepo } from './validator.js'
import { scoreRepo, categorizeRepo } from './scorer.js'
import { ingestRepo } from './ingester.js'

/**
 * Discovery queries — Firecrawl searches the entire web
 * These find repos, blog posts, tutorials, and marketplace listings
 */
const WEB_DISCOVERY_QUERIES = [
  // Direct skill/agent discovery
  'Claude Code skill SKILL.md github.com',
  'MCP server for Claude github repository stars',
  'Claude Code plugin marketplace skill',
  'anthropic claude agent automation github',

  // High-quality MCP servers
  'best MCP servers for Claude 2025 2026',
  'awesome MCP servers list github',
  'model context protocol server repository',

  // AI agent repos
  'AI agent Claude Code automation workflow github',
  'claude code agent devops deployment github',
  'claude code skill CRO conversion optimization',

  // Ecosystem discovery
  'claude code plugin skill install npm',
  '.claude skills directory github',
  'firecrawl mcp server tools',

  // Blog/tutorial discovery (leads to repos)
  'how to build a Claude Code skill tutorial',
  'building MCP server for Claude step by step',
  'best AI automation agents 2026',
]

/**
 * Extract GitHub repo URLs from Firecrawl search results
 */
function extractGitHubUrls(results) {
  const repoPattern = /https?:\/\/github\.com\/([^\/]+)\/([^\/\s\?#]+)/g
  const repos = new Set()

  for (const result of results) {
    const text = `${result.url || ''} ${result.markdown || ''} ${result.description || ''}`
    let match
    while ((match = repoPattern.exec(text)) !== null) {
      const owner = match[1]
      const repo = match[2].replace(/\.git$/, '')
      // Skip non-repo GitHub pages
      if (!['topics', 'trending', 'explore', 'settings', 'notifications', 'marketplace'].includes(repo)) {
        repos.add(`${owner}/${repo}`)
      }
    }
  }

  return Array.from(repos)
}

/**
 * Run Firecrawl-powered discovery
 * Searches the web, finds GitHub repos, validates & ingests them
 */
export async function runFirecrawlDiscovery(env, options = {}) {
  const firecrawl = new FirecrawlClient(env.FIRECRAWL_API_KEY)
  const github = new GitHubClient(env.GITHUB_TOKEN)

  const stats = {
    queriesRun: 0,
    urlsDiscovered: 0,
    reposExtracted: 0,
    validated: 0,
    ingested: 0,
    errors: 0,
  }

  const allRepoSlugs = new Set()

  // Load existing items to avoid re-processing
  try {
    const existing = await env.DB.prepare('SELECT slug FROM items WHERE scraped_at IS NOT NULL').all()
    for (const row of (existing.results || [])) {
      allRepoSlugs.add(row.slug)
    }
  } catch (e) {
    console.error('[firecrawl-discovery] Failed to load existing items:', e)
  }

  // Phase 1: Firecrawl web search → extract GitHub URLs
  for (const query of WEB_DISCOVERY_QUERIES) {
    stats.queriesRun++
    console.log(`[firecrawl] Searching: "${query}"`)

    try {
      const results = await firecrawl.search(query, 10)
      stats.urlsDiscovered += results.length

      const repoSlugs = extractGitHubUrls(results)

      for (const repoSlug of repoSlugs) {
        if (allRepoSlugs.has(repoSlug.replace('/', '-').toLowerCase())) continue
        allRepoSlugs.add(repoSlug.replace('/', '-').toLowerCase())
        stats.reposExtracted++

        const [owner, repo] = repoSlug.split('/')

        try {
          // Get repo metadata from GitHub
          const repoData = await github.getRepo(owner, repo)

          // Validate
          const validation = await validateRepo(github, owner, repo, repoData)
          if (!validation.isValid) continue
          stats.validated++

          // Scrape README via Firecrawl (cleaner markdown than raw GitHub)
          let readme = ''
          try {
            const scraped = await firecrawl.scrape(`https://github.com/${owner}/${repo}`)
            readme = scraped.markdown || ''
          } catch {
            readme = await github.getRawFile(owner, repo, 'README.md') || ''
          }

          // Score & categorize
          const score = scoreRepo(repoData, validation, readme)
          const topics = repoData.topics || []
          const category = categorizeRepo(repoData, readme, topics)

          // Ingest
          const result = await ingestRepo(env, repoData, validation, score, readme, category)
          if (result.action === 'created' || result.action === 'updated') stats.ingested++

          console.log(`[firecrawl] ${result.action}: ${repoSlug} (score: ${score.total})`)
        } catch (e) {
          stats.errors++
          console.error(`[firecrawl] Error processing ${repoSlug}:`, e.message)
        }

        await new Promise(r => setTimeout(r, 300))
      }
    } catch (e) {
      stats.errors++
      console.error(`[firecrawl] Search failed for "${query}":`, e.message)
    }

    await new Promise(r => setTimeout(r, 500))
  }

  // Phase 2: Scrape known awesome-lists and directories
  const AWESOME_LISTS = [
    'https://github.com/punkpeye/awesome-mcp-servers',
    'https://github.com/wong2/awesome-mcp-servers',
    'https://github.com/anthropics/anthropic-cookbook',
    'https://github.com/topics/mcp-server',
    'https://github.com/topics/claude-code',
  ]

  for (const listUrl of AWESOME_LISTS) {
    try {
      console.log(`[firecrawl] Scraping awesome list: ${listUrl}`)
      const scraped = await firecrawl.scrape(listUrl)
      const repoSlugs = extractGitHubUrls([scraped])

      for (const repoSlug of repoSlugs.slice(0, 50)) { // Cap at 50 per list
        if (allRepoSlugs.has(repoSlug.replace('/', '-').toLowerCase())) continue
        allRepoSlugs.add(repoSlug.replace('/', '-').toLowerCase())

        const [owner, repo] = repoSlug.split('/')
        try {
          const repoData = await github.getRepo(owner, repo)
          if (repoData.stargazers_count < 3) continue // quality gate

          const validation = await validateRepo(github, owner, repo, repoData)
          if (!validation.isValid) continue
          stats.validated++

          const readme = await github.getRawFile(owner, repo, 'README.md') || ''
          const score = scoreRepo(repoData, validation, readme)
          const topics = repoData.topics || []
          const category = categorizeRepo(repoData, readme, topics)

          await ingestRepo(env, repoData, validation, score, readme, category)
          stats.ingested++
        } catch (e) {
          stats.errors++
        }

        await new Promise(r => setTimeout(r, 300))
      }
    } catch (e) {
      stats.errors++
      console.error(`[firecrawl] Failed to scrape ${listUrl}:`, e.message)
    }
  }

  console.log(`[firecrawl-discovery] Complete:`, JSON.stringify(stats))
  return stats
}

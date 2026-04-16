/**
 * Enriches marketplace items using Firecrawl
 * - Scrapes item's GitHub page for clean README content
 * - Searches for tutorials, blog posts, and usage examples
 * - Finds related items by searching for similar tools
 */
import { FirecrawlClient } from './firecrawl.js'

export async function enrichItem(env, item) {
  if (!env.FIRECRAWL_API_KEY) return null
  const firecrawl = new FirecrawlClient(env.FIRECRAWL_API_KEY)

  const enrichments = {}

  // 1. Get clean README from GitHub (Firecrawl handles JS rendering)
  if (item.github_url) {
    try {
      const scraped = await firecrawl.scrape(item.github_url)
      if (scraped.markdown && scraped.markdown.length > (item.readme?.length || 0)) {
        enrichments.readme = scraped.markdown
      }
    } catch (e) {
      console.error(`[enricher] Failed to scrape ${item.github_url}:`, e.message)
    }
  }

  // 2. Search for tutorials and blog posts about this tool
  try {
    const results = await firecrawl.search(`"${item.title}" tutorial OR guide OR "how to use"`, 5)
    const tutorials = results
      .filter(r => r.url && !r.url.includes('github.com'))
      .map(r => ({
        title: r.title,
        url: r.url,
        snippet: (r.description || '').slice(0, 200),
      }))
      .slice(0, 3)

    if (tutorials.length > 0) {
      enrichments.tutorials = JSON.stringify(tutorials)
    }
  } catch (e) {
    console.error(`[enricher] Tutorial search failed for ${item.title}:`, e.message)
  }

  // 3. Find similar/related tools
  try {
    const results = await firecrawl.search(`${item.category} ${item.type} alternative to "${item.title}" github`, 5)
    const related = extractGitHubUrls(results).slice(0, 5)
    if (related.length > 0) {
      enrichments.related_repos = JSON.stringify(related)
    }
  } catch (e) {
    // Not critical
  }

  // 4. Save enrichments to DB
  if (Object.keys(enrichments).length > 0) {
    const setClauses = Object.keys(enrichments).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(enrichments), item.id]
    try {
      await env.DB.prepare(
        `UPDATE items SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`
      ).bind(...values).run()
    } catch (e) {
      console.error(`[enricher] DB update failed for ${item.slug}:`, e.message)
    }
  }

  return enrichments
}

function extractGitHubUrls(results) {
  const repoPattern = /https?:\/\/github\.com\/([^\/]+)\/([^\/\s\?#]+)/g
  const repos = new Set()
  for (const result of results) {
    const text = `${result.url || ''} ${result.markdown || ''} ${result.description || ''}`
    let match
    while ((match = repoPattern.exec(text)) !== null) {
      repos.add(`${match[1]}/${match[2].replace(/\.git$/, '')}`)
    }
  }
  return Array.from(repos)
}

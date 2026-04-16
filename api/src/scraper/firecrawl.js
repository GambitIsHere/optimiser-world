/**
 * Firecrawl-powered web scraper for Optimiser.World
 * Uses Firecrawl to search the web, scrape pages, and extract structured data
 */

const FIRECRAWL_API = 'https://api.firecrawl.dev/v2'

export class FirecrawlClient {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  async _fetch(endpoint, body) {
    const res = await fetch(`${FIRECRAWL_API}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`Firecrawl ${res.status}: ${err.error || res.statusText}`)
    }
    return res.json()
  }

  /**
   * Search the web for skills/agents/MCP servers
   */
  async search(query, limit = 10) {
    const data = await this._fetch('/search', { query, limit })
    return data.data?.web || data.data || []
  }

  /**
   * Scrape a single URL to clean markdown
   */
  async scrape(url) {
    const data = await this._fetch('/scrape', {
      url,
      formats: ['markdown'],
      onlyMainContent: true,
    })
    return {
      markdown: data.data?.markdown || '',
      metadata: data.data?.metadata || {},
      url,
    }
  }

  /**
   * Batch scrape multiple URLs
   */
  async batchScrape(urls) {
    const results = []
    // Process in chunks of 5 to avoid rate limits
    for (let i = 0; i < urls.length; i += 5) {
      const chunk = urls.slice(i, i + 5)
      const promises = chunk.map(url => this.scrape(url).catch(e => ({ url, markdown: '', error: e.message })))
      results.push(...await Promise.all(promises))
      if (i + 5 < urls.length) await new Promise(r => setTimeout(r, 1000))
    }
    return results
  }

  /**
   * Map all URLs on a site (useful for discovering skill repos on org pages)
   */
  async map(url) {
    const data = await this._fetch('/map', { url })
    return data.links || []
  }
}

const GITHUB_API = 'https://api.github.com'

/**
 * GitHub API client using the REST API
 * Handles rate limiting, retries, and raw file fetching
 */
export class GitHubClient {
  constructor(token) {
    this.token = token
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'OptimiserWorld-Scraper/1.0',
    }
    if (token) {
      this.headers['Authorization'] = `token ${token}`
    }
    this.rateLimitRemaining = 5000
    this.rateLimitReset = 0
  }

  async _fetch(url, options = {}) {
    // Respect rate limits
    if (this.rateLimitRemaining < 10) {
      const waitMs = (this.rateLimitReset * 1000) - Date.now()
      if (waitMs > 0) {
        console.log(`[github] Rate limited, waiting ${Math.ceil(waitMs / 1000)}s`)
        await new Promise(r => setTimeout(r, Math.min(waitMs, 60000)))
      }
    }

    const res = await fetch(url, { ...options, headers: { ...this.headers, ...options.headers } })

    // Track rate limits
    this.rateLimitRemaining = parseInt(res.headers.get('x-ratelimit-remaining') || '5000')
    this.rateLimitReset = parseInt(res.headers.get('x-ratelimit-reset') || '0')

    if (!res.ok) {
      if (res.status === 403 && this.rateLimitRemaining === 0) {
        throw new Error('GitHub rate limit exceeded')
      }
      if (res.status === 404) {
        return null
      }
      throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
    }

    return res.json()
  }

  /**
   * Search repositories
   */
  async searchRepos(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      sort: options.sort || 'stars',
      order: 'desc',
      per_page: String(options.perPage || 30),
      page: String(options.page || 1),
    })
    return this._fetch(`${GITHUB_API}/search/repositories?${params}`)
  }

  /**
   * Get full repo metadata
   */
  async getRepo(owner, repo) {
    return this._fetch(`${GITHUB_API}/repos/${owner}/${repo}`)
  }

  /**
   * Get repo contents (file listing or file content)
   */
  async getContents(owner, repo, path = '') {
    return this._fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`)
  }

  /**
   * Get raw file content (for SKILL.md, README.md, etc.)
   * Tries main branch first, then master
   */
  async getRawFile(owner, repo, path) {
    // Try main branch first
    const mainUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`
    const res = await fetch(mainUrl, {
      headers: { 'User-Agent': 'OptimiserWorld-Scraper/1.0' }
    })

    if (res.ok) {
      return res.text()
    }

    // Try master branch
    const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${path}`
    const res2 = await fetch(masterUrl, {
      headers: { 'User-Agent': 'OptimiserWorld-Scraper/1.0' }
    })

    if (res2.ok) {
      return res2.text()
    }

    return null
  }

  /**
   * Get repo topics
   */
  async getTopics(owner, repo) {
    const data = await this._fetch(`${GITHUB_API}/repos/${owner}/${repo}/topics`, {
      headers: { 'Accept': 'application/vnd.github.mercy-preview+json' }
    })
    return data?.names || []
  }

  /**
   * Get recent commits (to assess activity)
   */
  async getRecentCommits(owner, repo, days = 90) {
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const params = new URLSearchParams({ since, per_page: '1' })
    const data = await this._fetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?${params}`)
    return data || []
  }

  /**
   * Get community profile (has README, CONTRIBUTING, LICENSE, etc.)
   */
  async getCommunityProfile(owner, repo) {
    try {
      return await this._fetch(`${GITHUB_API}/repos/${owner}/${repo}/community/profile`)
    } catch {
      return null
    }
  }
}

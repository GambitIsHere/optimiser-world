const API_BASE = import.meta.env.VITE_API_URL || '/api'

class OptimiserClient {
  constructor() {
    this.apiKey = null
    this.baseUrl = API_BASE
  }

  setApiKey(key) {
    this.apiKey = key
  }

  async _fetch(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey
    }

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }))
        throw new ApiError(res.status, error.error || 'Request failed')
      }

      return res.json()
    } catch (err) {
      if (err instanceof ApiError) throw err
      // Network error — API not available
      console.warn(`API unavailable for ${path}, using mock data`)
      return null
    }
  }

  // Search
  async search(query, filters = {}) {
    return this._fetch('/search', {
      method: 'POST',
      body: JSON.stringify({ query, ...filters }),
    })
  }

  // Items
  async getItem(slug) {
    return this._fetch(`/items/${slug}`)
  }

  async vote(slug, direction) {
    return this._fetch(`/items/${slug}/vote`, {
      method: 'POST',
      body: JSON.stringify({ direction }),
    })
  }

  async unvote(slug) {
    return this._fetch(`/items/${slug}/vote`, { method: 'DELETE' })
  }

  async rate(slug, score) {
    return this._fetch(`/items/${slug}/rate`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    })
  }

  async review(slug, content) {
    return this._fetch(`/items/${slug}/review`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async favorite(slug) {
    return this._fetch(`/items/${slug}/favorite`, { method: 'POST' })
  }

  async unfavorite(slug) {
    return this._fetch(`/items/${slug}/favorite`, { method: 'DELETE' })
  }

  // Feed
  async getLeaderboard(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this._fetch(`/leaderboard${qs ? '?' + qs : ''}`)
  }

  async getCategories() {
    return this._fetch('/categories')
  }

  // User
  async getProfile() {
    return this._fetch('/user/profile')
  }

  async getApiKeys() {
    return this._fetch('/user/api-keys')
  }

  async createApiKey(name) {
    return this._fetch('/user/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async deleteApiKey(id) {
    return this._fetch(`/user/api-keys/${id}`, { method: 'DELETE' })
  }

  // Submit
  async submitItem(data) {
    return this._fetch('/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Usage report
  async report(data) {
    return this._fetch('/report', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Health
  async health() {
    return this._fetch('/health')
  }
}

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

// Singleton
export const api = new OptimiserClient()
export { ApiError }

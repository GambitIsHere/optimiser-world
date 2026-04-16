import { getConfig } from './config.js'

const API_BASE = 'https://api.optimiser.world'

export async function apiRequest(path, options = {}) {
  const config = getConfig()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }

  return res.json()
}

export async function search(query, filters = {}) {
  return apiRequest('/api/search', {
    method: 'POST',
    body: JSON.stringify({ query, ...filters }),
  })
}

export async function getItem(slug) {
  return apiRequest(`/api/items/${slug}`)
}

export async function getProfile() {
  return apiRequest('/api/user/profile')
}

export async function report(data) {
  return apiRequest('/api/report', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

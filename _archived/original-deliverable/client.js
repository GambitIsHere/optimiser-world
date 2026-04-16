// API client for Optimiser.World backend.
// Hits https://api.optimiser.world. Falls back to mock data if the API is unreachable
// or returns an empty result — so the site renders even without a live backend.

import {
  ITEMS, COLLECTIONS, findBySlug, getTopItems, getHot, getRising,
  getByCategory, getTrendingTags, getTopContributors, getFeatured, getStats,
} from '../lib/mockData.js';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.optimiser.world';
const TIMEOUT_MS = 4000;

// ─── Low-level fetch with timeout ───
async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ─── Helper: try API, fall back to mock ───
async function tryApi(apiCall, mockFallback) {
  try {
    const result = await apiCall();
    // If API returns empty / malformed, use mock
    if (!result || (result.items && result.items.length === 0)) {
      return { data: mockFallback(), source: 'mock-empty' };
    }
    return { data: result, source: 'api' };
  } catch (e) {
    return { data: mockFallback(), source: 'mock-error' };
  }
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API (what pages call)
// ═══════════════════════════════════════════════════════════

// GET /api/leaderboard
export async function fetchLeaderboard({ sort = 'hot', category, type, limit = 30 } = {}) {
  const params = new URLSearchParams({ sort, limit: String(limit) });
  if (category) params.set('category', category);
  if (type) params.set('type', type);

  return tryApi(
    () => request(`/api/leaderboard?${params}`),
    () => {
      let items = [...ITEMS];
      if (category) items = items.filter((i) => i.category === category);
      if (type) items = items.filter((i) => i.type === type);
      if (sort === 'hot') items = getHot(limit);
      else if (sort === 'new') items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      else if (sort === 'top') items.sort((a, b) => b.stats.upvotes - a.stats.upvotes);
      else if (sort === 'rising') items = getRising(limit);
      return { items: items.slice(0, limit), total: items.length };
    }
  );
}

// GET /api/items/:slug
export async function fetchItem(slug) {
  return tryApi(
    () => request(`/api/items/${slug}`),
    () => {
      const item = findBySlug(slug);
      if (!item) return null;
      return { item };
    }
  );
}

// POST /api/search
export async function searchItems(query, { category, type, limit = 20 } = {}) {
  return tryApi(
    () => request('/api/search', { method: 'POST', body: JSON.stringify({ query, category, type, limit }) }),
    () => {
      const q = query.toLowerCase();
      let results = ITEMS.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        i.short_description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q)) ||
        i.author.username.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
      if (category) results = results.filter((i) => i.category === category);
      if (type) results = results.filter((i) => i.type === type);
      // Simple relevance: title match > description match
      results.sort((a, b) => {
        const aT = a.title.toLowerCase().includes(q) ? 1 : 0;
        const bT = b.title.toLowerCase().includes(q) ? 1 : 0;
        if (aT !== bT) return bT - aT;
        return b.stats.upvotes - a.stats.upvotes;
      });
      return { results: results.slice(0, limit), total: results.length };
    }
  );
}

// GET /api/categories  (we compute locally either way — deterministic)
export async function fetchCategories() {
  const { CATEGORIES } = await import('../lib/categories.js');
  const counts = {};
  for (const item of ITEMS) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }
  return {
    data: CATEGORIES.map((c) => ({ ...c, count: counts[c.slug] || 0 })),
    source: 'local',
  };
}

// GET /api/trending
export async function fetchTrending() {
  return tryApi(
    () => request('/api/trending'),
    () => ({
      items: getHot(10),
      tags: getTrendingTags(),
      contributors: getTopContributors(),
    })
  );
}

// GET /api/featured
export async function fetchFeatured() {
  return tryApi(
    () => request('/api/featured'),
    () => ({ items: getFeatured() })
  );
}

// GET /api/collections  (mock-only for now — backend endpoint TBD)
export async function fetchCollections() {
  return { data: { collections: COLLECTIONS }, source: 'local' };
}

export async function fetchCollection(slug) {
  const col = COLLECTIONS.find((c) => c.slug === slug);
  if (!col) return { data: null, source: 'local' };
  return { data: { collection: col }, source: 'local' };
}

// Stats (for hero/landing counters)
export async function fetchStats() {
  return { data: getStats(), source: 'local' };
}

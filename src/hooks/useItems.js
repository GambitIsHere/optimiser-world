import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import { MOCK_ITEMS, CATEGORIES, TRENDING_TAGS } from '../lib/mockData'

/**
 * Hook that fetches items from the API with automatic mock-data fallback.
 * Provides a seamless bridge so every page works offline (mock) or online (live).
 */
export function useItems({ sort = 'hot', category = 'all', type = 'all', limit = 50 } = {}) {
  const [items, setItems] = useState(MOCK_ITEMS)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const params = { sort, limit: String(limit) }
        if (category !== 'all') params.category = category
        if (type !== 'all') params.type = type

        const data = await api.getLeaderboard(params)
        if (!cancelled && data?.items?.length) {
          setItems(data.items)
          setIsLive(true)
        }
      } catch {
        // API unavailable — keep mock data
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [sort, category, type, limit])

  return { items, loading, isLive }
}

/**
 * Fetch a single item by slug, falling back to mock data lookup.
 */
export function useItem(slug) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await api.getItem(slug)
        if (!cancelled && data) {
          setItem(data)
          setIsLive(true)
          setLoading(false)
          return
        }
      } catch {
        // fall through to mock
      }

      // Mock fallback
      if (!cancelled) {
        const mock = MOCK_ITEMS.find((i) => i.slug === slug || i.id === slug)
        setItem(mock || null)
        setLoading(false)
      }
    }

    if (slug) load()
    return () => { cancelled = true }
  }, [slug])

  return { item, loading, isLive }
}

/**
 * Hybrid search: tries the API's RRF search endpoint first,
 * falls back to client-side filtering of mock data.
 */
export function useHybridSearch(debounceMs = 300) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const timerRef = useRef(null)

  const search = (q, filters = {}) => {
    setQuery(q)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(async () => {
      // Try API first
      try {
        const data = await api.search(q, filters)
        if (data?.results?.length) {
          setResults(data.results)
          setIsLive(true)
          setLoading(false)
          return
        }
      } catch {
        // fall through
      }

      // Client-side mock fallback
      const lq = q.toLowerCase()
      const filtered = MOCK_ITEMS.filter((item) => {
        const matchesQuery =
          item.title.toLowerCase().includes(lq) ||
          item.description?.toLowerCase().includes(lq) ||
          item.shortDescription?.toLowerCase().includes(lq) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(lq))
        const matchesCat = !filters.category || filters.category === 'all' || item.category === filters.category
        const matchesType = !filters.type || filters.type === 'all' || item.type === filters.type
        return matchesQuery && matchesCat && matchesType
      })

      filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      setResults(filtered)
      setIsLive(false)
      setLoading(false)
    }, debounceMs)
  }

  return { query, results, loading, isLive, search }
}

/**
 * Re-export statics for pages that only need categories/tags.
 */
export { CATEGORIES, TRENDING_TAGS }

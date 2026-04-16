import { useState, useCallback } from 'react'
import { api } from '../api/client'

/**
 * Generic hook for API calls with loading state and mock fallback
 */
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const call = useCallback(async (apiMethod, ...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiMethod.call(api, ...args)
      return result
    } catch (err) {
      setError(err.message || 'Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { call, loading, error, clearError: () => setError(null) }
}

/**
 * Hook for search with debouncing
 */
export function useSearch(debounceMs = 300) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const timerRef = { current: null }

  const search = useCallback((q, filters = {}) => {
    setQuery(q)

    if (timerRef.current) clearTimeout(timerRef.current)

    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const data = await api.search(q, filters)
      if (data?.results) {
        setResults(data.results)
      }
      setLoading(false)
    }, debounceMs)
  }, [debounceMs])

  return { results, loading, query, search }
}

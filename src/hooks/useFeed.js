import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sortItems } from '../lib/hotAlgorithm'

export default function useFeed(items = []) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize from URL params
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'hot')
  const [category, setCategory] = useState(() => searchParams.get('category') || 'all')
  const [type, setType] = useState(() => searchParams.get('type') || 'all')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')

  // Sync state changes to URL params
  useEffect(() => {
    const newParams = new URLSearchParams()
    if (sortBy !== 'hot') newParams.set('sort', sortBy)
    if (category !== 'all') newParams.set('category', category)
    if (type !== 'all') newParams.set('type', type)
    if (searchQuery) newParams.set('search', searchQuery)

    setSearchParams(newParams, { replace: true })
  }, [sortBy, category, type, searchQuery, setSearchParams])

  // Apply filters and sorting
  const filteredItems = useMemo(() => {
    let filtered = [...items]

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter((item) => item.category === category)
    }

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter((item) => item.type === type)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.author?.username?.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    filtered = sortItems(filtered, sortBy)

    return filtered
  }, [items, sortBy, category, type, searchQuery])

  return {
    filteredItems,
    sortBy,
    setSortBy,
    category,
    setCategory,
    type,
    setType,
    searchQuery,
    setSearchQuery,
  }
}

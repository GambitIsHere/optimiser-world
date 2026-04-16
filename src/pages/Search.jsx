import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import SortToggle from '../components/ui/SortToggle'
import CategoryIcon from '../components/ui/CategoryIcon'
import { MOCK_ITEMS, CATEGORIES } from '../lib/mockData'
import { cn, formatNumber, timeAgo } from '../utils'

export default function Search() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('hot')
  const searchTimeout = useRef(null)

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    if (query.trim()) {
      setIsSearching(true)
      searchTimeout.current = setTimeout(() => {
        const filtered = MOCK_ITEMS.filter((item) => {
          const matchesQuery =
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.tags.some((tag) =>
              tag.toLowerCase().includes(query.toLowerCase())
            )
          const matchesCategory =
            selectedCategory === 'all' || item.category === selectedCategory
          const matchesType = typeFilter === 'all' || item.type === typeFilter

          return matchesQuery && matchesCategory && matchesType
        })

        // Sort results
        let sorted = [...filtered]
        if (sortBy === 'hot') {
          sorted.sort((a, b) => b.upvotes - a.upvotes)
        } else if (sortBy === 'new') {
          sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        } else if (sortBy === 'trending') {
          sorted.sort((a, b) => b.rating - a.rating)
        }

        setResults(sorted)
        setIsSearching(false)
      }, 300)
    } else {
      setResults([])
      setIsSearching(false)
    }

    return () => clearTimeout(searchTimeout.current)
  }, [query, selectedCategory, typeFilter, sortBy])

  return (
    <div className="min-h-screen bg-bg">
      {/* Search Header */}
      <div className="bg-surface/30 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

          {/* Search Input */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input
              autoFocus
              type="text"
              placeholder="Search agents, skills, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface/60 border border-white/[0.06] rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-surface/80 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-white/40" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-surface/60 border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-surface/60 border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
            >
              <option value="all">All Types</option>
              <option value="agent">Agents</option>
              <option value="skill">Skills</option>
            </select>

            <div className="ml-auto">
              <SortToggle
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { label: 'Hot', value: 'hot' },
                  { label: 'New', value: 'new' },
                  { label: 'Rating', value: 'trending' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {isSearching && query.trim() && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">Searching intelligence...</p>
          </div>
        )}

        {!isSearching && query.trim() && results.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-3">
              No results for "{query}"
            </h3>
            <p className="text-white/60 mb-6">
              Try browsing categories or adjusting your search
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="p-3 rounded-lg bg-surface/40 hover:bg-surface/60 transition-colors"
                >
                  <p className="text-sm font-medium text-mint">{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((item) => (
              <Link
                key={item.id}
                to={`/item/${item.slug}`}
                className="block"
              >
                <GlassCard className="p-6 hover" hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={cn(
                            'px-2 py-1 rounded text-xs font-semibold',
                            item.type === 'agent'
                              ? 'bg-blue/20 text-blue'
                              : 'bg-violet/20 text-violet'
                          )}
                        >
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                        {item.featured && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-amber/20 text-amber">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-white/60 text-sm mb-3">
                        {item.shortDescription}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded text-xs bg-white/5 text-white/60 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 rounded text-xs bg-white/5 text-white/60 border border-white/10">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-mint font-semibold mb-1">
                        {formatNumber(item.upvotes)} votes
                      </div>
                      <div className="text-white/40 text-xs">
                        {formatNumber(item.downloads)} downloads
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        {timeAgo(item.updatedAt)}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}

        {!query.trim() && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">
              Start typing to search for agents and skills
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

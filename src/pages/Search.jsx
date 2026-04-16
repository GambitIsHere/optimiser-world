import { useState } from 'react'
import { Search as SearchIcon, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import GlassCard from '../components/ui/GlassCard'
import SortToggle from '../components/ui/SortToggle'
import CategoryIcon from '../components/ui/CategoryIcon'
import { CATEGORIES } from '../lib/mockData'
import { useHybridSearch } from '../hooks/useItems'
import { cn, formatNumber, timeAgo } from '../utils'

export default function Search() {
  const { query, results, loading: isSearching, isLive, search } = useHybridSearch(300)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('hot')

  const handleQueryChange = (e) => {
    search(e.target.value, { category: selectedCategory, type: typeFilter, sort: sortBy })
  }

  return (
    <div className="min-h-screen bg-[#EEEFE9]">
      <SEO title="Search" description="Search for AI agents and skills across the marketplace." path="/search" />
      {/* Search Header */}
      <div className="bg-white border-b border-[#D0D1C9] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-[#151515] mb-6">Search</h1>

          {/* Search Input */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6E66]" size={20} />
            <input
              autoFocus
              type="text"
              placeholder="Search agents, skills, tags..."
              value={query}
              onChange={handleQueryChange}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#D0D1C9] rounded-lg text-[#151515] placeholder-[#6B6E66] focus:outline-none focus:border-[#D0D1C9] focus:bg-[#E3E4DD] transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[#6B6E66]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-white border border-[#D0D1C9] rounded-lg text-[#151515] text-sm focus:outline-none focus:border-[#D0D1C9]"
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
              className="px-3 py-2 bg-white border border-[#D0D1C9] rounded-lg text-[#151515] text-sm focus:outline-none focus:border-[#D0D1C9]"
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
            <p className="text-[#6B6E66] text-lg">Searching intelligence...</p>
          </div>
        )}

        {!isSearching && query.trim() && results.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-[#151515] mb-3">
              No results for "{query}"
            </h3>
            <p className="text-[#6B6E66] mb-6">
              Try browsing categories or adjusting your search
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/c/${cat.slug}`}
                  className="p-3 rounded-lg bg-[#E3E4DD] hover:bg-white transition-colors"
                >
                  <p className="text-sm font-medium text-[#F54E00]">{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-[#6B6E66] text-sm">
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
                              ? 'bg-[#1D4AFF]/20 text-[#1D4AFF]'
                              : 'bg-[#C79EF5]/20 text-[#C79EF5]'
                          )}
                        >
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                        {item.featured && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-[#F7B200]/20 text-[#F7B200]">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-[#151515] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-[#6B6E66] text-sm mb-3">
                        {item.shortDescription}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded text-xs bg-[#E3E4DD] text-[#6B6E66] border border-[#D0D1C9]"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 rounded text-xs bg-[#E3E4DD] text-[#6B6E66] border border-[#D0D1C9]">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#F54E00] font-semibold mb-1">
                        {formatNumber(item.upvotes)} votes
                      </div>
                      <div className="text-[#6B6E66] text-xs">
                        {formatNumber(item.downloads)} downloads
                      </div>
                      <div className="text-[#6B6E66] text-xs mt-1">
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
            <p className="text-[#6B6E66] text-lg">
              Start typing to search for agents and skills
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import SortToggle from '../components/ui/SortToggle'
import GlassCard from '../components/ui/GlassCard'
import ItemCard from '../components/marketplace/ItemCard'
import TagPill from '../components/marketplace/TagPill'
import KarmaBadge from '../components/marketplace/KarmaBadge'
import { MOCK_ITEMS, CATEGORIES, TRENDING_TAGS } from '../lib/mockData'
import useFeed from '../hooks/useFeed'
import { cn } from '../utils'

export default function Browse() {
  const { filteredItems, sortBy, setSortBy, category, setCategory, type, setType } =
    useFeed(MOCK_ITEMS)
  const [showFilters, setShowFilters] = useState(false)

  // Get unique authors sorted by karma for "Top Contributors"
  const topContributors = useMemo(() => {
    const authorMap = {}
    MOCK_ITEMS.forEach((item) => {
      if (!authorMap[item.author.username]) {
        authorMap[item.author.username] = item.author
      }
    })
    return Object.values(authorMap)
      .sort((a, b) => b.karma - a.karma)
      .slice(0, 5)
  }, [])

  // Get editor's picks (3 featured items)
  const editorsPicks = MOCK_ITEMS.filter((item) => item.featured)
    .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    .slice(0, 3)

  const handleClearFilters = () => {
    setCategory('all')
    setType('all')
    setSortBy('hot')
  }

  const hasActiveFilters = category !== 'all' || type !== 'all'

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface/30 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-40 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Marketplace</h1>
            <div className="hidden md:block">
              <SortToggle
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { label: 'Hot', value: 'hot' },
                  { label: 'New', value: 'new' },
                  { label: 'Top', value: 'top' },
                  { label: 'Rising', value: 'rising' },
                ]}
              />
            </div>
          </div>

          {/* Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              {category !== 'all' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <GlassCard className="px-3 py-1.5 flex items-center gap-2">
                    <span className="text-sm text-white">
                      {CATEGORIES.find((c) => c.slug === category)?.name}
                    </span>
                    <button
                      onClick={() => setCategory('all')}
                      className="hover:text-mint transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </GlassCard>
                </motion.div>
              )}

              {type !== 'all' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <GlassCard className="px-3 py-1.5 flex items-center gap-2">
                    <span className="text-sm text-white capitalize">{type}</span>
                    <button
                      onClick={() => setType('all')}
                      className="hover:text-mint transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </GlassCard>
                </motion.div>
              )}

              <button
                onClick={handleClearFilters}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Category Filter */}
              <GlassCard className="p-4">
                <h3 className="font-semibold text-white mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategory('all')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded transition-colors duration-200',
                      category === 'all'
                        ? 'bg-mint/20 text-mint'
                        : 'text-white/60 hover:text-white'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">All</span>
                    </div>
                  </button>

                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(category === cat.slug ? 'all' : cat.slug)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded transition-colors duration-200',
                        category === cat.slug
                          ? 'bg-mint/20 text-mint'
                          : 'text-white/60 hover:text-white'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-xs text-white/40">{cat.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Type Filter */}
              <GlassCard className="p-4">
                <h3 className="font-semibold text-white mb-4">Type</h3>
                <div className="space-y-2">
                  {['all', 'agent', 'skill'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(type === t ? 'all' : t)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded text-sm transition-colors duration-200',
                        type === t
                          ? 'bg-mint/20 text-mint'
                          : 'text-white/60 hover:text-white'
                      )}
                    >
                      {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-1">
            <div className="md:hidden mb-6">
              <SortToggle
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { label: 'Hot', value: 'hot' },
                  { label: 'New', value: 'new' },
                  { label: 'Top', value: 'top' },
                  { label: 'Rising', value: 'rising' },
                ]}
              />
            </div>

            {filteredItems.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <p className="text-white/60 text-lg mb-4">No items found</p>
                <button
                  onClick={handleClearFilters}
                  className="text-mint hover:text-mint/80 transition-colors"
                >
                  Clear filters
                </button>
              </GlassCard>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {filteredItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ItemCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Trending Tags */}
              <GlassCard className="p-4">
                <h3 className="font-semibold text-white mb-4">Trending Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TAGS.map((tag) => (
                    <TagPill key={tag} label={tag} color="blue" />
                  ))}
                </div>
              </GlassCard>

              {/* Top Contributors */}
              <GlassCard className="p-4">
                <h3 className="font-semibold text-white mb-4">Top Contributors</h3>
                <div className="space-y-3">
                  {topContributors.map((author) => (
                    <div key={author.username} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `hsl(${author.karma % 360}, 70%, 50%)` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {author.displayName[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {author.displayName}
                        </p>
                      </div>
                      <KarmaBadge karma={author.karma} />
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Editor's Picks */}
              {editorsPicks.length > 0 && (
                <GlassCard className="p-4">
                  <h3 className="font-semibold text-white mb-4">Editor's Picks</h3>
                  <div className="space-y-3">
                    {editorsPicks.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

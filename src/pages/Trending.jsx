import { MOCK_ITEMS, CATEGORIES, TRENDING_TAGS } from '../lib/mockData'
import GlassCard from '../components/ui/GlassCard'
import CategoryIcon from '../components/ui/CategoryIcon'
import TagPill from '../components/marketplace/TagPill'
import { cn, formatNumber, timeAgo } from '../utils'

export default function Trending() {
  // Calculate hot score for items
  const calculateHotScore = (item) => {
    const age = Date.now() - new Date(item.updatedAt).getTime()
    const hours = age / (1000 * 60 * 60)
    const votes = item.upvotes + item.downloads * 0.1
    return votes / (Math.pow(hours + 2, 1.8))
  }

  // Group items by category and get top 3 by hot score
  const getTopItemsByCategory = (categoryId) => {
    return MOCK_ITEMS.filter((item) => item.category === categoryId)
      .sort((a, b) => calculateHotScore(b) - calculateHotScore(a))
      .slice(0, 3)
  }

  const colorMap = {
    'cro-growth': '#00E5A0',
    'devops': '#5B8DEF',
    'content': '#A855F7',
    'analytics': '#FBBF24',
    'design': '#EC4899',
    'product': '#F97316',
    'finance': '#FBBF24',
    'starter-kits': '#00E5A0',
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Trending Now</h1>
          <p className="text-white/60 text-lg">
            The hottest agents and skills, updated hourly
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {CATEGORIES.filter((cat) => cat.count > 0).map((category) => {
              const items = getTopItemsByCategory(category.id)
              const accentColor = colorMap[category.id] || '#00E5A0'

              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <h2 className="text-2xl font-bold text-white">
                      {category.name}
                    </h2>
                    <span className="ml-auto text-white/40 text-sm">
                      {category.count} total
                    </span>
                  </div>

                  {/* Items Grid */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {items.map((item, idx) => (
                      <GlassCard key={item.id} className="p-6 hover" hover>
                        {/* Rank Badge */}
                        <div className="mb-4 flex items-start justify-between">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                            style={{
                              backgroundColor: `${accentColor}30`,
                              color: accentColor,
                            }}
                          >
                            #{idx + 1}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-xs font-semibold',
                              item.type === 'agent'
                                ? 'bg-blue/20 text-blue'
                                : 'bg-violet/20 text-violet'
                            )}
                          >
                            {item.type.charAt(0).toUpperCase() +
                              item.type.slice(1)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-white mb-2">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">
                          {item.shortDescription}
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-mint to-blue flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-bg">
                              {item.author.displayName
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">
                              {item.author.displayName}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: accentColor }}
                            >
                              {formatNumber(item.upvotes)}
                            </p>
                            <p className="text-white/60 text-xs">Upvotes</p>
                          </div>
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: accentColor }}
                            >
                              {formatNumber(item.downloads)}
                            </p>
                            <p className="text-white/60 text-xs">Downloads</p>
                          </div>
                        </div>

                        {/* Updated */}
                        <p className="text-white/40 text-xs mt-4">
                          Updated {timeAgo(item.updatedAt)}
                        </p>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sidebar - Trending Tags */}
          <div>
            <GlassCard className="p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">
                Trending Tags
              </h3>

              <div className="flex flex-wrap gap-3">
                {TRENDING_TAGS.map((tag) => (
                  <TagPill
                    key={tag}
                    label={tag}
                    color={
                      [
                        'mint',
                        'blue',
                        'violet',
                        'amber',
                        'red',
                        'pink',
                        'orange',
                      ][Math.floor(Math.random() * 7)]
                    }
                  />
                ))}
              </div>

              {/* Tag Stats */}
              <div className="mt-8 pt-8 border-t border-white/[0.06] space-y-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Top Tag</p>
                  <p className="text-white font-semibold">automation</p>
                  <p className="text-white/40 text-xs">234 items</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm mb-1">Growing Tag</p>
                  <p className="text-white font-semibold">ai-agents</p>
                  <p className="text-white/40 text-xs">
                    +45 items this month
                  </p>
                </div>

                <div>
                  <p className="text-white/60 text-sm mb-1">Most Rated</p>
                  <p className="text-white font-semibold">claude-code</p>
                  <p className="text-white/40 text-xs">9.1 avg rating</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

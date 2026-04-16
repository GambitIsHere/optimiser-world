import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import SortToggle from '../components/ui/SortToggle'
import GlassCard from '../components/ui/GlassCard'
import CategoryIcon from '../components/ui/CategoryIcon'
import ItemCard from '../components/marketplace/ItemCard'
import { CATEGORIES } from '../lib/mockData'
import { useItems } from '../hooks/useItems'
import useFeed from '../hooks/useFeed'

export default function Category() {
  const { slug } = useParams()

  // Find the category
  const categoryData = useMemo(
    () => CATEGORIES.find((c) => c.slug === slug),
    [slug]
  )

  // Fetch items for this category from API (falls back to mock)
  const { items: categoryItems } = useItems({
    category: categoryData?.id || 'all',
  })

  // Use the feed hook to handle sorting/filtering
  const { filteredItems, sortBy, setSortBy } = useFeed(categoryItems)

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category not found</h1>
          <p className="text-white/60">The category you're looking for doesn't exist.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Header */}
      <div
        className="relative py-20 px-6 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${categoryData.color}15 0%, ${categoryData.color}05 100%)`,
        }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0.5px)',
            backgroundSize: '40px 40px',
            color: categoryData.color,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto relative z-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="p-4 rounded-2xl"
              style={{ backgroundColor: `${categoryData.color}20` }}
            >
              <CategoryIcon
                iconName={categoryData.icon}
                size={32}
                color={categoryData.color}
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {categoryData.name}
              </h1>
              <p className="text-white/60 text-lg">
                {categoryData.count} agents and skills available
              </p>
            </div>
          </div>

          {/* Category description (generic) */}
          <p className="text-white/70 text-lg max-w-2xl">
            Explore our collection of {categoryData.name.toLowerCase()} tools and skills.
            Discover agents and skills built by the community to help you with your{' '}
            {categoryData.name.toLowerCase()} needs.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header with sort controls */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              All {categoryData.name}
            </h2>
          </div>
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

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-white/60 text-lg">
              No items found in this category
            </p>
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

        {/* Stats Section */}
        {filteredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 pt-12 border-t border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Category Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="p-6 text-center">
                <div className="text-2xl font-bold text-mint mb-2">
                  {filteredItems.length}
                </div>
                <div className="text-sm text-white/60">Items</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <div className="text-2xl font-bold text-mint mb-2">
                  {filteredItems.reduce((sum, item) => sum + item.upvotes, 0).toLocaleString()}
                </div>
                <div className="text-sm text-white/60">Total Votes</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <div className="text-2xl font-bold text-mint mb-2">
                  {filteredItems.reduce((sum, item) => sum + item.downloads, 0).toLocaleString()}
                </div>
                <div className="text-sm text-white/60">Total Downloads</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <div className="text-2xl font-bold text-mint mb-2">
                  {(
                    filteredItems.reduce((sum, item) => sum + item.rating, 0) /
                    filteredItems.length
                  ).toFixed(1)}
                </div>
                <div className="text-sm text-white/60">Avg Rating</div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

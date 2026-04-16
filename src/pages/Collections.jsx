import { Link } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import KarmaBadge from '../components/marketplace/KarmaBadge'
import { MOCK_COLLECTIONS } from '../lib/mockData'
import { formatNumber, timeAgo } from '../utils'

export default function Collections() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Collections</h1>
          <p className="text-white/60 text-lg">
            Curated bundles of agents and skills for common workflows
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_COLLECTIONS.map((collection) => (
            <Link
              key={collection.id}
              to={`/collection/${collection.slug}`}
              className="block"
            >
              <GlassCard className="p-6 hover h-full flex flex-col" hover>
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {collection.title}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {collection.description}
                  </p>
                </div>

                {/* Curator Info */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint to-blue flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-bg">
                      {collection.curator.displayName
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {collection.curator.displayName}
                    </p>
                    <p className="text-white/40 text-xs">
                      @{collection.curator.username}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div>
                    <p className="text-mint font-semibold">
                      {collection.itemCount}
                    </p>
                    <p className="text-white/60 text-xs">Items</p>
                  </div>
                  <div>
                    <p className="text-mint font-semibold">
                      {formatNumber(collection.upvotes)}
                    </p>
                    <p className="text-white/60 text-xs">Upvotes</p>
                  </div>
                  <div>
                    <p className="text-mint font-semibold">
                      {formatNumber(collection.downloads)}
                    </p>
                    <p className="text-white/60 text-xs">Downloads</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-semibold">
                      {collection.rating}
                    </span>
                    <span className="text-white/40 text-xs">
                      ({formatNumber(collection.ratingCount)})
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">
                    Updated {timeAgo(collection.updatedAt)}
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

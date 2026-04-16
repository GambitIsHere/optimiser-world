import { useParams } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import KarmaBadge from '../components/marketplace/KarmaBadge'
import { MOCK_COLLECTIONS, MOCK_ITEMS } from '../lib/mockData'
import { cn, formatNumber, timeAgo } from '../utils'

export default function CollectionDetail() {
  const { slug } = useParams()

  // Find collection by slug
  const collection = MOCK_COLLECTIONS.find((col) => col.slug === slug)

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#EEEFE9] flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-[#151515] mb-2">
            Collection not found
          </h2>
          <p className="text-[#6B6E66]">
            The collection you're looking for doesn't exist
          </p>
        </GlassCard>
      </div>
    )
  }

  // Get items in collection
  const collectionItems = MOCK_ITEMS.filter((item) =>
    collection.itemSlugs.includes(item.slug)
  )

  return (
    <div className="min-h-screen bg-[#EEEFE9]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#E3E4DD] to-[#EEEFE9] border-b border-[#D0D1C9]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-[#151515] mb-4">
            {collection.title}
          </h1>
          <p className="text-[#2E2E2E] mb-8 max-w-2xl">
            {collection.description}
          </p>

          {/* Collection Info */}
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-[#F54E00] font-bold text-2xl">
                {collection.itemCount}
              </p>
              <p className="text-[#6B6E66] text-sm">Items</p>
            </div>

            <div>
              <p className="text-[#F54E00] font-bold text-2xl">
                {formatNumber(collection.upvotes)}
              </p>
              <p className="text-[#6B6E66] text-sm">Upvotes</p>
            </div>

            <div>
              <p className="text-[#F54E00] font-bold text-2xl">
                {formatNumber(collection.downloads)}
              </p>
              <p className="text-[#6B6E66] text-sm">Downloads</p>
            </div>

            <div>
              <p className="text-[#F54E00] font-bold text-2xl">
                {collection.rating}
              </p>
              <p className="text-[#6B6E66] text-sm">
                Rating ({formatNumber(collection.ratingCount)})
              </p>
            </div>
          </div>

          {/* Curator */}
          <div className="mt-8 pt-8 border-t border-[#D0D1C9] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F54E00] to-[#FFF287] flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {collection.curator.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[#151515] font-semibold">
                Curated by {collection.curator.displayName}
              </p>
              <p className="text-[#6B6E66] text-sm">
                @{collection.curator.username}
              </p>
            </div>
            <div className="ml-auto">
              <KarmaBadge karma={collection.curator.karma} />
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-[#151515] mb-8">
          Items in this collection
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {collectionItems.map((item) => (
            <GlassCard key={item.id} className="p-6">
              <div className="mb-3">
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs font-semibold inline-block',
                    item.type === 'agent'
                      ? 'bg-blue/20 text-blue'
                      : 'bg-violet/20 text-violet'
                  )}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                {item.featured && (
                  <span className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-amber/20 text-amber">
                    Featured
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-[#151515] mb-2">
                {item.title}
              </h3>

              <p className="text-[#6B6E66] text-sm mb-4">
                {item.shortDescription}
              </p>

              {/* Author */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#D0D1C9]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F54E00] to-[#FFF287] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {item.author.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#151515] text-xs font-medium truncate">
                    {item.author.displayName}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-[#6B6E66]">
                <span>{formatNumber(item.upvotes)} votes</span>
                <span>{formatNumber(item.downloads)} downloads</span>
                <span>{timeAgo(item.updatedAt)}</span>
              </div>
            </GlassCard>
          ))}
        </div>

        {collectionItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6B6E66]">No items in this collection</p>
          </div>
        )}
      </div>
    </div>
  )
}

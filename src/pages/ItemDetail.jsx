import { useParams, Link } from 'react-router-dom'
import { useItem } from '../hooks/useItems'
import { MOCK_COMMENTS } from '../lib/mockData'
import SEO from '../components/ui/SEO'
import ItemDetailView from '../components/marketplace/ItemDetail'

export default function ItemDetailPage() {
  const { id } = useParams()
  const { item, loading } = useItem(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-mint/30 border-t-mint rounded-full animate-spin" />
          <span className="text-white/40 text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Item not found</h2>
        <p className="text-white/50 mb-4">The item you're looking for doesn't exist.</p>
        <Link to="/browse" className="text-mint hover:underline">Back to marketplace</Link>
      </div>
    )
  }

  const comments = MOCK_COMMENTS.filter(c => c.itemSlug === item.slug)

  return (
    <>
      <SEO
        title={item.title}
        description={item.shortDescription || item.description}
        path={`/item/${item.slug}`}
        type="article"
      />
      <ItemDetailView item={item} comments={comments} />
    </>
  )
}

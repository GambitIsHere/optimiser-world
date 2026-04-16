import { useParams, Link } from 'react-router-dom'
import { MOCK_ITEMS, MOCK_COMMENTS } from '../lib/mockData'
import ItemDetailView from '../components/marketplace/ItemDetail'

export default function ItemDetailPage() {
  const { id } = useParams()
  const item = MOCK_ITEMS.find(i => i.slug === id || i.id === id)

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

  return <ItemDetailView item={item} comments={comments} />
}

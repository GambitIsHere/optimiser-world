import { useParams, Link } from 'react-router-dom'
import { useItem } from '../hooks/useItems'
import { MOCK_COMMENTS } from '../lib/mockData'
import SEO from '../components/ui/SEO'
import ItemDetailView from '../components/marketplace/ItemDetail'

export default function ItemDetailPage() {
  const { slug } = useParams()
  const { item, loading } = useItem(slug)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D0D1C9] border-t-[#F54E00] rounded-full animate-spin" />
          <span className="text-[#6B6E66] text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-[#151515] mb-2">Item not found</h2>
        <p className="text-[#6B6E66] mb-4">The item you're looking for doesn't exist.</p>
        <Link to="/browse" className="text-[#F54E00] hover:underline">Back to marketplace</Link>
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

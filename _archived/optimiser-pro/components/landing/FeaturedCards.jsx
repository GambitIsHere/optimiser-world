import { Link } from 'react-router-dom'
import { useItems } from '../../hooks/useItems'
import { sortItems } from '../../lib/hotAlgorithm'
import GlassCard from '../ui/GlassCard'
import VoteWidget from '../marketplace/VoteWidget'
import TagPill from '../marketplace/TagPill'
import useVote from '../../hooks/useVote'
import { Bot, Zap } from 'lucide-react'

function FeaturedCard({ item }) {
  const { upvotes, downvotes, userVote, handleVote } = useVote(item.upvotes, item.downvotes, item.slug)
  const TypeIcon = item.type === 'agent' ? Bot : Zap
  const typeColor = item.type === 'agent' ? 'text-violet' : 'text-mint'

  return (
    <GlassCard hover className="p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeColor} bg-white/5`}>
          <TypeIcon size={12} /> {item.type}
        </span>
        <VoteWidget upvotes={upvotes} downvotes={downvotes} userVote={userVote} onVote={handleVote} />
      </div>
      <Link to={`/item/${item.slug}`} className="text-xl font-bold text-white hover:text-mint transition-colors mb-2">
        {item.title}
      </Link>
      <p className="text-white/50 text-sm mb-4 flex-1">{item.shortDescription}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {item.tags.slice(0, 3).map(tag => <TagPill key={tag} label={tag} />)}
      </div>
    </GlassCard>
  )
}

export default function FeaturedCards() {
  const { items } = useItems({ sort: 'hot', limit: 6 })
  const featured = sortItems(items, 'hot').slice(0, 3)

  return (
    <section className="max-w-6xl mx-auto px-6">
      <h2 className="text-2xl font-bold text-white mb-6">Trending this week</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featured.map(item => <FeaturedCard key={item.id} item={item} />)}
      </div>
    </section>
  )
}

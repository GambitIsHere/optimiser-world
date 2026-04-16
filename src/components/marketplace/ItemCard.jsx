import { Link } from 'react-router-dom'
import { Download, MessageSquare, Bot, Zap } from 'lucide-react'
import VoteWidget from './VoteWidget'
import TagPill from './TagPill'
import KarmaBadge from './KarmaBadge'
import GlassCard from '../ui/GlassCard'
import useVote from '../../hooks/useVote'
import { timeAgo, cn, formatNumber } from '../../utils'

export default function ItemCard({ item }) {
  const { upvotes, downvotes, userVote, handleVote } = useVote(
    item.upvotes,
    item.downvotes,
    item.slug
  )

  const typeColorClasses = item.type === 'agent'
    ? 'bg-[#1D4AFF]/15 text-[#1D4AFF]'
    : 'bg-[#7DD3C0]/15 text-[#7DD3C0]'
  const typeIcon = item.type === 'agent' ? Bot : Zap
  const TypeIcon = typeIcon

  return (
    <GlassCard hover className="p-4 flex gap-3">
      {/* Vote widget */}
      <div className="flex-shrink-0 pt-1">
        <VoteWidget
          upvotes={upvotes}
          downvotes={downvotes}
          userVote={userVote}
          onVote={handleVote}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top meta row */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              typeColorClasses
            )}
          >
            <TypeIcon size={12} />
            {item.type}
          </span>
          <span className="text-[#6B6E66] text-xs">{item.category}</span>
          {item.featured && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#F7B200]/15 text-[#F7B200]">
              Featured
            </span>
          )}
          <span className="text-[#6B6E66] text-xs ml-auto">{timeAgo(item.createdAt)}</span>
        </div>

        {/* Title */}
        <Link
          to={`/item/${item.slug}`}
          className="block text-[#151515] font-semibold hover:text-[#F54E00] transition-colors line-clamp-2 mb-1"
        >
          {item.title}
        </Link>

        {/* Description */}
        <p className="text-[#6B6E66] text-sm line-clamp-3 mb-3">
          {item.shortDescription}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-[#6B6E66]">
            <Link
              to={`/u/${item.author.username}`}
              className="flex items-center gap-1.5 hover:text-[#2E2E2E] transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-[#E3E4DD] flex items-center justify-center text-[10px] font-bold text-[#6B6E66]">
                {item.author.displayName.charAt(0)}
              </div>
              <span>@{item.author.username}</span>
            </Link>
            <KarmaBadge karma={item.author.karma} />
            <span className="flex items-center gap-1">
              <Download size={12} /> {formatNumber(item.downloads)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {item.comments}
            </span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

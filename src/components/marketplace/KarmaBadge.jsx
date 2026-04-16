import { Sparkles, Star, Circle } from 'lucide-react'
import { getKarmaTier, formatNumber } from '../../utils'

const tierColors = {
  diamond: '#5B8DEF',
  gold: '#FBBF24',
  silver: '#9CA3AF',
  bronze: '#92400E',
}

export default function KarmaBadge({ karma }) {
  const tier = getKarmaTier(karma)

  const iconProps = {
    size: 16,
    color: tierColors[tier.tier],
  }

  let IconComponent = null

  switch (tier.icon) {
    case 'sparkles':
      IconComponent = <Sparkles {...iconProps} />
      break
    case 'star':
      IconComponent = <Star {...iconProps} fill={tierColors[tier.tier]} />
      break
    case 'circle':
      IconComponent = <Circle {...iconProps} />
      break
    default:
      IconComponent = <Circle {...iconProps} />
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
      {IconComponent}
      <span className="text-xs font-semibold text-white/80">{formatNumber(karma)}</span>
    </div>
  )
}

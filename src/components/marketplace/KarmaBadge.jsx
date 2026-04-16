import { Sparkles, Star, Circle } from 'lucide-react'
import { getKarmaTier, formatNumber } from '../../utils'

const tierColors = {
  diamond: '#5B8DEF',
  gold: '#FBBF24',
  silver: '#9CA3AF',
  bronze: '#92400E',
}

const tierIcons = {
  diamond: 'sparkles',
  gold: 'star',
  silver: 'circle',
  bronze: 'circle',
}

export default function KarmaBadge({ karma }) {
  const tier = getKarmaTier(karma)

  const iconProps = {
    size: 16,
    color: tierColors[tier.tier],
  }

  let IconComponent = null

  switch (tierIcons[tier.tier]) {
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
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#E3E4DD] border border-[#D0D1C9]">
      {IconComponent}
      <span className="text-xs font-semibold text-[#151515]">{formatNumber(karma)}</span>
    </div>
  )
}

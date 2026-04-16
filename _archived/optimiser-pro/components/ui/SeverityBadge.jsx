import { cn } from '../../utils'

const severityConfig = {
  critical: { bg: 'bg-red/15', text: 'text-red', border: 'border-red/30', label: 'Critical' },
  high: { bg: 'bg-orange/15', text: 'text-orange', border: 'border-orange/30', label: 'High' },
  medium: { bg: 'bg-amber/15', text: 'text-amber', border: 'border-amber/30', label: 'Medium' },
  low: { bg: 'bg-blue/15', text: 'text-blue', border: 'border-blue/30', label: 'Low' },
}

export default function SeverityBadge({ severity }) {
  const config = severityConfig[severity] || severityConfig.medium
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.bg, config.text, config.border)}>
      {config.label}
    </span>
  )
}

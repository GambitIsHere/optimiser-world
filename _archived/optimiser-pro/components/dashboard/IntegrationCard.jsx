import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import { cn } from '../../utils'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function IntegrationCard({ integration, delay = 0 }) {
  const IconComponent = LucideIcons[integration.icon] || LucideIcons.Plug
  const connected = integration.status === 'connected'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-6 magnetic-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
          <IconComponent className={cn('w-5 h-5', connected ? 'text-mint' : 'text-white/25')} />
        </div>
        <StatusBadge status={integration.status} />
      </div>

      <h3 className="text-white font-semibold text-sm mb-1">{integration.name}</h3>

      {connected ? (
        <p className="text-xs text-white/25">Last sync: {timeAgo(integration.lastSync)}</p>
      ) : (
        <button className="mt-3 text-xs font-medium text-mint hover:text-mint/80 transition-colors cursor-pointer">
          Connect now →
        </button>
      )}
    </motion.div>
  )
}

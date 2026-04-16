import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { cn } from '../../utils'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const iconColors = {
  fix_merged: 'text-mint',
  issue_found: 'text-red',
  experiment_started: 'text-violet',
  integration: 'text-blue',
  flow_discovered: 'text-blue',
  scan_complete: 'text-mint',
}

export default function ActivityFeed({ activities }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Recent activity</h3>
      <div className="space-y-4">
        {activities.map((act, i) => {
          const IconComponent = LucideIcons[act.icon] || LucideIcons.Circle
          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className={cn('w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0', iconColors[act.type] || 'text-white/30')}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/70 leading-snug">{act.message}</p>
                <p className="text-xs text-white/25 mt-0.5">{timeAgo(act.timestamp)}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

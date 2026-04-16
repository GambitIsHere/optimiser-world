import { motion } from 'framer-motion'
import { AlertTriangle, TrendingDown, Brain } from 'lucide-react'
import SeverityBadge from '../ui/SeverityBadge'
import { cn } from '../../utils'

export default function IssueCard({ issue, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={() => onClick?.(issue)}
      className="glass-card p-6 magnetic-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <SeverityBadge severity={issue.severity} />
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <Brain className="w-3.5 h-3.5 text-violet" />
          <span>{issue.aiConfidence}% confident</span>
        </div>
      </div>

      <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{issue.title}</h3>

      <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-2">{issue.rootCause}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-red" />
          <span className="text-sm font-mono font-bold text-red">€{issue.estimatedImpact.toLocaleString()}</span>
          <span className="text-xs text-white/25">/{issue.impactUnit?.replace('EUR/', '') || 'mo'}</span>
        </div>
        <span className="text-xs text-white/20">{issue.flow}</span>
      </div>
    </motion.div>
  )
}

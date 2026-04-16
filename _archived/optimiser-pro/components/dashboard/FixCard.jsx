import { motion } from 'framer-motion'
import { GitPullRequest, FlaskConical, ArrowUpRight } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import { cn } from '../../utils'

export default function FixCard({ fix, delay = 0 }) {
  const isCode = fix.type === 'code'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCode ? (
            <GitPullRequest className="w-4 h-4 text-blue" />
          ) : (
            <FlaskConical className="w-4 h-4 text-violet" />
          )}
          <span className="text-xs font-mono text-white/30">
            {isCode ? `PR #${fix.prNumber}` : `Experiment #${fix.experimentId}`}
          </span>
        </div>
        <StatusBadge status={fix.status} />
      </div>

      <h3 className="text-white font-semibold text-sm mb-3">{fix.title}</h3>

      {isCode && fix.diff && (
        <div className="bg-bg rounded-lg p-3 mb-3 font-mono text-xs overflow-x-auto">
          {fix.diff.split('\n').map((line, i) => (
            <div key={i} className={cn(
              'whitespace-pre',
              line.startsWith('+') ? 'text-mint' : line.startsWith('-') ? 'text-red' : 'text-white/30'
            )}>
              {line}
            </div>
          ))}
        </div>
      )}

      {!isCode && fix.hypothesis && (
        <p className="text-xs text-white/40 leading-relaxed mb-3">{fix.hypothesis}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="w-3.5 h-3.5 text-mint" />
          <span className="text-sm font-mono font-bold text-mint">
            {fix.measuredLift || fix.predictedLift || 'Pending'}
          </span>
          <span className="text-xs text-white/25">{fix.liftMetric}</span>
        </div>
        {isCode && fix.ciStatus && (
          <StatusBadge status={fix.ciStatus} />
        )}
      </div>
    </motion.div>
  )
}

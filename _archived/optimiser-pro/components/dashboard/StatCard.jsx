import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../utils'

export default function StatCard({ label, value, trend, trendDirection = 'up', icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs text-white/30 uppercase tracking-wider font-medium">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-mint" />
          </div>
        )}
      </div>
      <p className="text-3xl font-extrabold text-mint font-mono mb-2">{value}</p>
      {trend && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', trendDirection === 'up' ? 'text-mint' : 'text-red')}>
          {trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </motion.div>
  )
}

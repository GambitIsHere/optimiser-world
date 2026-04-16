import { motion } from 'framer-motion'
import { Activity, AlertTriangle, GitMerge, TrendingUp } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import { DASHBOARD_STATS, MOCK_ACTIVITY } from '../data/mockData'

export default function Dashboard() {
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Command Centre</h1>
        <p className="text-sm text-white/30 mb-8">Real-time intelligence overview</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Active flows" value={DASHBOARD_STATS.activeFlows} icon={Activity} delay={0} trend="+1 this week" trendDirection="up" />
            <StatCard label="Issues found" value={DASHBOARD_STATS.issuesFound} icon={AlertTriangle} delay={0.06} trend="2 critical" trendDirection="down" />
            <StatCard label="Fixes shipped" value={DASHBOARD_STATS.fixesShipped} icon={GitMerge} delay={0.12} trend="+2 this month" trendDirection="up" />
            <StatCard label="Lift achieved" value={DASHBOARD_STATS.liftAchieved} icon={TrendingUp} delay={0.18} trend="Trending up" trendDirection="up" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Quick status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/50">
                <div className="w-2 h-2 rounded-full bg-mint" />
                <span className="text-white/60">4 integrations active</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/50">
                <div className="w-2 h-2 rounded-full bg-blue" />
                <span className="text-white/60">1 experiment running</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/50">
                <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
                <span className="text-white/60">2 critical issues</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div>
          <ActivityFeed activities={MOCK_ACTIVITY} />
        </div>
      </div>
    </div>
  )
}

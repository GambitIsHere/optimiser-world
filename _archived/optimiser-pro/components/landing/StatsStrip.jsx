import { motion } from 'framer-motion'
import { Activity, AlertTriangle, GitMerge, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Flows monitored', value: '2.4M+', icon: Activity, color: 'text-blue' },
  { label: 'Issues detected', value: '180K+', icon: AlertTriangle, color: 'text-violet' },
  { label: 'Fixes shipped', value: '42K+', icon: GitMerge, color: 'text-mint' },
  { label: 'Revenue recovered', value: '€8.2M', icon: TrendingUp, color: 'text-amber' },
]

export default function StatsStrip() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Icon size={20} className={`${color} mx-auto mb-2`} />
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{value}</div>
                <div className="text-sm text-white/40 mt-1">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

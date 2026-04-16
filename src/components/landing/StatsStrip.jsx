import { STATS } from '../../lib/mockData'
import GlassCard from '../ui/GlassCard'
import { Bot, Zap, ThumbsUp, Users } from 'lucide-react'
import { formatNumber } from '../../utils'

const stats = [
  { label: 'Agents', value: STATS.agents, icon: Bot },
  { label: 'Skills', value: STATS.skills, icon: Zap },
  { label: 'Total Votes', value: STATS.totalVotes, icon: ThumbsUp },
  { label: 'Contributors', value: STATS.contributors, icon: Users },
]

export default function StatsStrip() {
  return (
    <GlassCard className="mx-auto max-w-4xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <Icon size={20} className="text-mint mx-auto mb-2" />
            <div className="text-2xl font-bold text-mint">{formatNumber(value)}</div>
            <div className="text-sm text-white/50">{label}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

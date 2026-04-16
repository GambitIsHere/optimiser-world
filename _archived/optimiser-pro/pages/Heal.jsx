import { useState } from 'react'
import { motion } from 'framer-motion'
import FixCard from '../components/dashboard/FixCard'
import { MOCK_FIXES } from '../data/mockData'

export default function Heal() {
  const [tab, setTab] = useState('code')

  const codeFixes = MOCK_FIXES.filter(f => f.type === 'code')
  const funnelFixes = MOCK_FIXES.filter(f => f.type === 'funnel')
  const activeFixes = tab === 'code' ? codeFixes : funnelFixes

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Fix Centre</h1>
        <p className="text-sm text-white/30 mb-8">Code fixes and funnel experiments</p>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'code', label: 'Code Fixes', count: codeFixes.length },
          { key: 'funnel', label: 'Funnel Fixes', count: funnelFixes.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t.key
                ? 'bg-mint/10 text-mint border border-mint/20'
                : 'bg-surface text-white/40 border border-white/[0.06] hover:text-white/60'
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeFixes.map((fix, i) => (
          <FixCard key={fix.id} fix={fix} delay={i * 0.06} />
        ))}
      </div>
    </div>
  )
}

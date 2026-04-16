import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain } from 'lucide-react'
import IssueCard from '../components/dashboard/IssueCard'
import SeverityBadge from '../components/ui/SeverityBadge'
import AITyping from '../components/ui/AITyping'
import { MOCK_ISSUES } from '../data/mockData'

const sorted = [...MOCK_ISSUES].sort((a, b) => b.estimatedImpact - a.estimatedImpact)

export default function Diagnose() {
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Intelligence Feed</h1>
        <p className="text-sm text-white/30 mb-8">AI-diagnosed issues, sorted by revenue impact</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to feed
            </button>

            <div className="glass-card p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <SeverityBadge severity={selected.severity} />
                  <h2 className="text-xl font-bold text-white mt-3">{selected.title}</h2>
                  <p className="text-sm text-white/30 mt-1">Flow: {selected.flow} &middot; Step: {selected.affectedStep}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold text-red">€{selected.estimatedImpact.toLocaleString()}</p>
                  <p className="text-xs text-white/25">estimated monthly impact</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-violet" />
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">AI Analysis</h3>
                  <span className="text-xs text-violet/60">{selected.aiConfidence}% confidence</span>
                </div>
                <div className="bg-surface-2/50 rounded-lg p-4">
                  <AITyping text={selected.rootCause} speed={15} />
                </div>
              </div>

              {selected.metrics && (
                <div>
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Key Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(selected.metrics).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-surface-2/50">
                        <p className="text-xs text-white/30 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm font-mono font-bold text-white">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {sorted.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} onClick={setSelected} delay={i * 0.06} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

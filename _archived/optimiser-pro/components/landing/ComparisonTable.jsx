import { motion } from 'framer-motion'
import { Check, X, Minus } from 'lucide-react'

const features = [
  'Full intelligence loop',
  'Auto-discover user flows',
  'AI root-cause analysis',
  'Code fix PRs',
  'A/B experiment generation',
  'Revenue impact estimates',
  'Session replay correlation',
  'Performance-to-UX mapping',
]

const competitors = [
  {
    name: 'Optimiser.Pro',
    highlight: true,
    values: [true, true, true, true, true, true, true, true],
  },
  {
    name: 'ELU',
    highlight: false,
    values: [false, false, false, true, false, false, false, false],
  },
  {
    name: 'Hotjar',
    highlight: false,
    values: [false, false, 'partial', false, false, false, true, false],
  },
  {
    name: 'Manual',
    highlight: false,
    values: ['partial', false, 'partial', false, false, 'partial', false, false],
  },
]

function CellIcon({ value }) {
  if (value === true) return <Check className="w-4 h-4 text-mint" />
  if (value === false) return <X className="w-4 h-4 text-white/15" />
  return <Minus className="w-4 h-4 text-white/30" />
}

export default function ComparisonTable() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Optimiser.Pro?
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            The only platform that closes the full loop from analytics signal to shipped fix.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-4 px-6 text-white/40 font-medium">Feature</th>
                  {competitors.map(c => (
                    <th key={c.name} className={`py-4 px-6 text-center font-semibold ${c.highlight ? 'text-mint' : 'text-white/60'}`}>
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr key={feature} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-3.5 px-6 text-white/70">{feature}</td>
                    {competitors.map(c => (
                      <td key={c.name} className={`py-3.5 px-6 text-center ${c.highlight ? 'bg-mint/[0.03]' : ''}`}>
                        <span className="inline-flex justify-center">
                          <CellIcon value={c.values[i]} />
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

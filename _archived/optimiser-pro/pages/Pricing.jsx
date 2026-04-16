import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import PricingCards from '../components/landing/PricingCards'
import Footer from '../components/landing/Footer'

const featureMatrix = [
  { feature: 'Flow discovery', pro: 'Unlimited', max: 'Unlimited' },
  { feature: 'AI diagnosis', pro: true, max: true },
  { feature: 'Funnel Heal (A/B)', pro: true, max: true },
  { feature: 'Code Heal (PRs)', pro: false, max: true },
  { feature: 'Integrations', pro: '3', max: 'Unlimited' },
  { feature: 'Team members', pro: '1', max: 'Unlimited' },
  { feature: 'Slack alerts', pro: false, max: true },
  { feature: 'Revenue impact', pro: false, max: true },
  { feature: 'Custom triggers', pro: false, max: true },
  { feature: 'Priority support', pro: false, max: true },
  { feature: 'API access', pro: false, max: true },
]

function CellValue({ value }) {
  if (value === true) return <Check className="w-4 h-4 text-mint mx-auto" />
  if (value === false) return <X className="w-4 h-4 text-white/15 mx-auto" />
  return <span className="text-white/70">{value}</span>
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-bg pt-20">
      <PricingCards />

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            Feature comparison
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-4 px-6 text-white/40 font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-white/60 font-semibold">PRO</th>
                  <th className="py-4 px-6 text-center text-mint font-semibold">MAX</th>
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map(row => (
                  <tr key={row.feature} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-3 px-6 text-white/60">{row.feature}</td>
                    <td className="py-3 px-6 text-center"><CellValue value={row.pro} /></td>
                    <td className="py-3 px-6 text-center bg-mint/[0.03]"><CellValue value={row.max} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

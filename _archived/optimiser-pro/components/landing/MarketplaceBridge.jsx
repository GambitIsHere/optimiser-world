import { motion } from 'framer-motion'
import { Store } from 'lucide-react'

export default function MarketplaceBridge() {
  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet/10 border border-violet/20 text-violet text-sm font-medium mb-6">
          <Store size={14} />
          Community marketplace
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Extend with community-built agents &amp; skills
        </h2>
        <p className="text-white/40 max-w-xl mx-auto">
          Browse, vote, and deploy AI agents and automation skills built by the Optimiser community. Install in one click. Contribute your own.
        </p>
      </motion.div>
    </section>
  )
}

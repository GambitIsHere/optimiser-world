import { motion } from 'framer-motion'

const partners = ['PostHog', 'Google Analytics', 'Mixpanel', 'GitHub', 'Vercel', 'Supabase', 'Slack']

export default function SocialProof() {
  return (
    <section className="py-12 px-6 border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs text-white/25 uppercase tracking-widest mb-6">
          Integrates with your stack
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {partners.map(p => (
            <div key={p} className="px-5 py-2.5 rounded-lg bg-surface/60 border border-white/[0.04] text-sm text-white/30 font-medium">
              {p}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

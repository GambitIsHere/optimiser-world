import { motion } from 'framer-motion'
import { Eye, Stethoscope, Wrench } from 'lucide-react'

const steps = [
  {
    icon: Eye,
    title: 'Observe',
    description: 'Connect GA4, PostHog, or Mixpanel. Auto-discover every user flow. See where users enter, move, stall, and leave.',
    color: 'text-blue',
    bg: 'bg-blue/10',
    border: 'border-blue/20',
  },
  {
    icon: Stethoscope,
    title: 'Diagnose',
    description: 'AI agents cross-reference drop-offs, session replays, and performance metrics to surface root causes — not just data.',
    color: 'text-violet',
    bg: 'bg-violet/10',
    border: 'border-violet/20',
  },
  {
    icon: Wrench,
    title: 'Heal',
    description: 'Generate A/B experiments or targeted code fixes. Open PRs with full context. Measure the lift. The loop restarts.',
    color: 'text-mint',
    bg: 'bg-mint/10',
    border: 'border-mint/20',
  },
]

export default function ThreeStepFlow() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            The intelligence loop
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            From signal to shipped fix in one continuous cycle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting lines (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[33%] right-[33%] h-px bg-gradient-to-r from-blue/30 via-violet/30 to-mint/30 -translate-y-1/2" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card p-8 magnetic-hover relative"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${step.bg} border ${step.border} mb-5`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-white/30">0{i + 1}</span>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: "We found a mobile signup blocker in 20 minutes that we'd missed for 6 months. The AI diagnosis was spot-on — our resume upload was killing conversions.",
    author: 'Elena Vasquez',
    role: 'Head of Growth, Bootcamp.io',
  },
  {
    quote: "Optimiser.Pro doesn't just show you dashboards. It tells you what's wrong and opens a PR to fix it. We shipped 14 fixes in our first month.",
    author: 'Marcus Chen',
    role: 'CTO, FinFlow',
  },
  {
    quote: "The revenue impact estimates changed how our team prioritizes. We stopped guessing and started fixing the issues that actually cost us money.",
    author: 'Sarah Okonkwo',
    role: 'VP Product, Relay',
  },
]

export default function TestimonialCards() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-12"
        >
          Trusted by product teams
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card p-8"
            >
              <p className="text-white/60 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div>
                <p className="text-white font-semibold text-sm">{t.author}</p>
                <p className="text-white/30 text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

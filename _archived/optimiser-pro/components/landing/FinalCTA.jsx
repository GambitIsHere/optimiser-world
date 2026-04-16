import { motion } from 'framer-motion'
import { ArrowRight, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import MagneticButton from '../ui/MagneticButton'

export default function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="glass-card p-12 md:p-16 relative overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,160,0.08)_0%,transparent_60%)]" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Stop guessing. Start healing.
            </h2>
            <p className="text-lg text-white/40 mb-8 max-w-lg mx-auto">
              Connect your analytics, let AI find what's broken, and ship fixes that move revenue — all in one loop.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/login">
                <MagneticButton variant="primary" className="px-8 py-3 text-lg">
                  Start free <ArrowRight size={18} className="inline ml-2" />
                </MagneticButton>
              </Link>
              <Link to="/about">
                <MagneticButton variant="secondary" className="px-8 py-3 text-lg">
                  How it works
                </MagneticButton>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/25">
              <span className="flex items-center gap-1.5"><Shield size={12} /> SOC 2 compliant</span>
              <span>No credit card required</span>
              <span>Setup in 5 minutes</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

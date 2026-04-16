import { Link } from 'react-router-dom'
import { ArrowRight, Activity } from 'lucide-react'
import CollectiveCanvas from './CollectiveCanvas'
import MagneticButton from '../ui/MagneticButton'

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <CollectiveCanvas className="z-0" opacity={0.4} nodeCount={180} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,160,0.06)_0%,transparent_70%)] z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint/10 border border-mint/20 text-mint text-sm font-medium mb-8">
          <Activity size={14} />
          AI-powered product intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          Your product{' '}
          <span className="text-mint">heals itself.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          Observe every user flow. Diagnose revenue leaks with AI. Ship fixes before your customers notice.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/login">
            <MagneticButton variant="primary" className="px-8 py-3 text-lg">
              Start observing <ArrowRight size={18} className="inline ml-2" />
            </MagneticButton>
          </Link>
          <Link to="/pricing">
            <MagneticButton variant="secondary" className="px-8 py-3 text-lg">
              View plans
            </MagneticButton>
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/30">Free tier available &middot; No credit card required</p>
      </div>
    </section>
  )
}

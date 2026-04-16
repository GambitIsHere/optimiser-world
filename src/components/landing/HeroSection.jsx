import { Link } from 'react-router-dom'
import { ArrowRight, Upload } from 'lucide-react'
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
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          The internet's intelligence,{' '}
          <span className="text-mint">organised.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          Browse, vote, and deploy AI agents and skills built by the Optimiser community.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/browse">
            <MagneticButton variant="primary" className="px-8 py-3 text-lg">
              Browse marketplace <ArrowRight size={18} className="inline ml-2" />
            </MagneticButton>
          </Link>
          <Link to="/submit">
            <MagneticButton variant="secondary" className="px-8 py-3 text-lg">
              <Upload size={18} className="inline mr-2" /> Upload yours
            </MagneticButton>
          </Link>
        </div>
      </div>
    </section>
  )
}

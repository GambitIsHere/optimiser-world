import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div>
          <p className="text-lg font-bold text-white mb-1">Optimiser<span className="text-mint">.Pro</span></p>
          <p className="text-xs text-white/30">Observe. Diagnose. Heal. Optimise.</p>
        </div>
        <div className="flex gap-12">
          <div>
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Product</p>
            <div className="flex flex-col gap-2">
              <Link to="/pricing" className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer">Pricing</Link>
              <Link to="/about" className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer">About</Link>
              <Link to="/login" className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer">Login</Link>
            </div>
          </div>
          <div>
            <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Resources</p>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-white/40">Documentation</span>
              <span className="text-sm text-white/40">Changelog</span>
              <span className="text-sm text-white/40">Status</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/[0.04] text-center">
        <p className="text-xs text-white/20">© 2026 Optimiser.Pro. All rights reserved.</p>
      </div>
    </footer>
  )
}

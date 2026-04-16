import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../lib/categories.js';

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-[#151515] bg-[#E3E4DD]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">

        {/* ── Big editorial mark ── */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-7 h-7 bg-[#151515] rounded-[5px]">
                <div className="absolute inset-[5px] bg-[#F54E00] rounded-[2px]" />
              </div>
              <span className="font-bold text-2xl tracking-tight">
                optimiser<span className="text-[#6B6E66] font-medium">.world</span>
              </span>
            </div>
            <p className="max-w-md text-[#2E2E2E] text-[15px] leading-relaxed">
              A Reddit-shaped marketplace for the skills and agents that actually do the work.
              Every job leaves a vote behind. <span className="hl">Hot skills rise. Broken ones sink.</span>
            </p>
          </div>

          <div className="font-mono text-[11px] text-[#6B6E66] uppercase tracking-wider text-right">
            <div>Shipped from Lisbon &nbsp;·&nbsp; London &nbsp;·&nbsp; Mountain View</div>
            <div className="mt-1">An open marketplace · MIT licensed</div>
          </div>
        </div>

        {/* ── Column grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-[#D0D1C9]">

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-4">Marketplace</h4>
            <ul className="space-y-2 text-[14px]">
              <li><Link to="/browse" className="hover:text-[#F54E00]">Browse all</Link></li>
              <li><Link to="/browse?type=agent" className="hover:text-[#F54E00]">Agents</Link></li>
              <li><Link to="/browse?type=skill" className="hover:text-[#F54E00]">Skills</Link></li>
              <li><Link to="/search" className="hover:text-[#F54E00]">Search</Link></li>
              <li><Link to="/trending" className="hover:text-[#F54E00]">Trending</Link></li>
              <li><Link to="/collections" className="hover:text-[#F54E00]">Collections</Link></li>
            </ul>
          </div>

          <div className="col-span-2">
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-4">Categories</h4>
            <ul className="space-y-2 text-[14px] grid grid-cols-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/c/${c.slug}`} className="inline-flex items-center gap-2 hover:text-[#F54E00]">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.hex }} />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-4">Platform</h4>
            <ul className="space-y-2 text-[14px]">
              <li><a href="https://docs.optimiser.world" className="hover:text-[#F54E00]">Docs</a></li>
              <li><a href="https://docs.optimiser.world/cli" className="hover:text-[#F54E00]">CLI</a></li>
              <li><a href="https://docs.optimiser.world/api" className="hover:text-[#F54E00]">API</a></li>
              <li><a href="https://github.com/optimiser/world" className="hover:text-[#F54E00]">GitHub</a></li>
              <li><a href="#" className="hover:text-[#F54E00]">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-4">About</h4>
            <ul className="space-y-2 text-[14px]">
              <li><a href="#" className="hover:text-[#F54E00]">Blog</a></li>
              <li><a href="#" className="hover:text-[#F54E00]">Changelog</a></li>
              <li><a href="#" className="hover:text-[#F54E00]">Roadmap</a></li>
              <li><a href="#" className="hover:text-[#F54E00]">Privacy</a></li>
              <li><a href="#" className="hover:text-[#F54E00]">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* ── Bottom mark ── */}
        <div className="pt-8 flex items-center justify-between flex-wrap gap-4">
          <div className="font-mono text-[11px] text-[#6B6E66]">
            © 2026 Optimiser.World. Community-ranked, community-owned.
          </div>
          <div className="font-mono text-[11px] text-[#6B6E66] flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="live-dot"></span>
              <span>All systems operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { NavLink, Link, useLocation } from 'react-router-dom';

export default function TopNav() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#EEEFE9]/85 border-b border-[#D0D1C9]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">

        {/* ── Left: logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-5 h-5 bg-[#151515] rounded-[4px]">
            <div className="absolute inset-[3.5px] bg-[#F54E00] rounded-[2px] transition-transform group-hover:rotate-45" />
          </div>
          <span className="font-bold text-[15px] tracking-tight">
            optimiser<span className="text-[#6B6E66] font-medium">.world</span>
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#FFF287] rounded ml-1">v2.0</span>
        </Link>

        {/* ── Center: nav pills ── */}
        <nav className="hidden md:flex items-center gap-1 bg-white border border-[#151515] rounded-full p-1 shadow-[3px_3px_0_#151515]">
          <NavPill to="/browse" label="Browse" active={location.pathname.startsWith('/browse') || location.pathname.startsWith('/c/')} />
          <NavPill to="/search" label="Search" active={location.pathname.startsWith('/search')} />
          <NavPill to="/trending" label="Trending" active={location.pathname.startsWith('/trending')} />
          <NavPill to="/collections" label="Collections" active={location.pathname.startsWith('/collection')} />
          <a href="https://docs.optimiser.world" target="_blank" rel="noreferrer" className="nav-pill">Docs</a>
        </nav>

        {/* ── Right: CTA ── */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="hidden sm:block text-[13px] font-semibold px-3 py-2 rounded-full hover:bg-white/70 transition">
            Sign in
          </button>
          <button className="text-[13px] font-semibold px-4 py-2 rounded-full bg-[#F54E00] text-white border border-[#151515] shadow-[3px_3px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_#151515] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#151515] transition">
            Get started →
          </button>
        </div>
      </div>
    </header>
  );
}

function NavPill({ to, label, active }) {
  return (
    <NavLink to={to} className="nav-pill" data-active={active || undefined}>
      {label}
    </NavLink>
  );
}

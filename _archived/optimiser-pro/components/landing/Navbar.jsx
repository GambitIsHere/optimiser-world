import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { cn } from '../../utils'

export default function Navbar() {
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Marketplace', path: '/browse' },
  ]

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bg/80 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white">
          Optimiser<span className="text-mint">.Pro</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors',
                  isActive ? 'text-mint' : 'text-white/50 hover:text-white'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-mint text-bg text-sm font-semibold rounded-lg hover:opacity-90 transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-white/50 hover:text-white transition font-medium"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-mint text-bg text-sm font-semibold rounded-lg hover:opacity-90 transition"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white/60 hover:text-white transition cursor-pointer"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-white/[0.06] px-6 py-4 space-y-3">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-mint' : 'text-white/60'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-white/[0.06]">
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 bg-mint text-bg text-sm font-semibold rounded-lg">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 bg-mint text-bg text-sm font-semibold rounded-lg">
                Get started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

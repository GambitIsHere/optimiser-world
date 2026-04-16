import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Globe,
  Compass,
  Flame,
  PlusCircle,
  FolderOpen,
  LayoutDashboard,
  Settings,
  GitBranch,
  Stethoscope,
  Wrench,
  Plug,
  Search,
  DollarSign,
  Info,
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import MagneticButton from './MagneticButton'
import Navbar from '../landing/Navbar'
import { cn } from '../../utils'

// Pages that should render WITHOUT the sidebar (full-width marketing)
const fullWidthPages = ['/', '/about', '/pricing', '/login']

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  const isFullWidth = fullWidthPages.includes(location.pathname)

  // Marketplace nav
  const marketplaceNav = [
    { id: 'home', label: 'Home', icon: Globe, path: '/' },
    { id: 'browse', label: 'Browse', icon: Compass, path: '/browse' },
    { id: 'trending', label: 'Trending', icon: Flame, path: '/trending' },
    { id: 'submit', label: 'Submit', icon: PlusCircle, path: '/submit' },
    { id: 'collections', label: 'Collections', icon: FolderOpen, path: '/collections' },
  ]

  // Dashboard nav (when authenticated)
  const dashboardNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'flows', label: 'Flows', icon: GitBranch, path: '/flows' },
    { id: 'diagnose', label: 'Diagnose', icon: Stethoscope, path: '/diagnose' },
    { id: 'heal', label: 'Heal', icon: Wrench, path: '/heal' },
    { id: 'connect', label: 'Connect', icon: Plug, path: '/connect' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ]

  // Full-width layout for marketing pages
  if (isFullWidth) {
    return (
      <>
        <Navbar />
        <Outlet />
      </>
    )
  }

  return (
    <div className="flex h-screen bg-bg">
      {/* Skip to content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-mint focus:text-bg focus:rounded-lg focus:font-medium">
        Skip to content
      </a>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-surface-3 border-r border-white/[0.06] p-6 overflow-y-auto" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <NavLink to="/" className="mb-8 block">
          <h1 className="text-2xl font-bold text-white">
            Optimiser<span className="text-mint">.Pro</span>
          </h1>
        </NavLink>

        {/* Marketplace Navigation */}
        <nav className="flex-1 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-white/20 px-4 mb-2">Marketplace</p>
          {marketplaceNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer',
                    isActive
                      ? 'bg-surface-2 text-mint'
                      : 'text-white/60 hover:text-white/80 hover:bg-surface-2/50'
                  )
                }
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            )
          })}

          {/* Intelligence section (authenticated) */}
          {isAuthenticated && (
            <>
              <div className="h-px bg-white/[0.06] my-4" />
              <p className="text-[10px] uppercase tracking-widest text-white/20 px-4 mb-2">Intelligence</p>
              {dashboardNav.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer',
                        isActive
                          ? 'bg-surface-2 text-mint'
                          : 'text-white/60 hover:text-white/80 hover:bg-surface-2/50'
                      )
                    }
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                )
              })}
            </>
          )}
        </nav>

        {/* Auth Section */}
        <div className="space-y-3 pt-4 border-t border-white/[0.06]">
          {!isAuthenticated ? (
            <MagneticButton
              variant="secondary"
              className="w-full"
              onClick={() => {
                window.location.href = '/login'
              }}
            >
              Login
            </MagneticButton>
          ) : (
            <>
              {user && (
                <div className="flex items-center gap-2 px-4 py-2.5 text-sm">
                  <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username || user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-mint font-bold text-sm">
                        {(user.username || user.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 font-medium text-sm truncate">{user.username || user.name}</p>
                    {user.karma && <p className="text-white/40 text-xs">{user.karma} karma</p>}
                  </div>
                </div>
              )}

              <MagneticButton
                variant="ghost"
                className="w-full"
                onClick={logout}
              >
                Logout
              </MagneticButton>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 md:ml-60 overflow-auto pb-20 md:pb-0" role="main">
        <div className="p-6 md:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-surface-3/90 backdrop-blur-xl border-t border-white/[0.06] px-4 py-2 flex justify-around z-50" aria-label="Mobile navigation">
        {[
          ...marketplaceNav.slice(0, 3),
          ...(isAuthenticated ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }] : []),
          { id: 'search', label: 'Search', icon: Search, path: '/search' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-center p-3 rounded-lg transition-colors duration-200',
                  isActive ? 'text-mint' : 'text-white/60'
                )
              }
            >
              <Icon size={22} aria-hidden="true" />
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

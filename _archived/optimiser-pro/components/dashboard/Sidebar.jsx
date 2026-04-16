import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, GitBranch, Stethoscope, Wrench, Plug, Settings2, LogOut } from 'lucide-react'
import { cn } from '../../utils'
import { useAuth } from '../../lib/AuthContext'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: GitBranch, label: 'Flows', path: '/flows' },
  { icon: Stethoscope, label: 'Diagnose', path: '/diagnose' },
  { icon: Wrench, label: 'Heal', path: '/heal' },
  { icon: Plug, label: 'Connect', path: '/connect' },
  { icon: Settings2, label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 flex-col items-center py-6 bg-surface/80 backdrop-blur-xl border-r border-white/[0.06] z-50">
        <Link to="/dashboard" className="mb-8 cursor-pointer">
          <span className="text-lg font-extrabold text-mint">O</span>
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-2">
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer',
                  active ? 'bg-mint/10 text-mint' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                )}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            )
          })}
        </nav>

        <button
          onClick={logout}
          title="Logout"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-white/20 hover:text-red transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 bg-surface/90 backdrop-blur-xl border-t border-white/[0.06] z-50">
        {navItems.slice(0, 5).map(item => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer',
                active ? 'text-mint' : 'text-white/30'
              )}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          )
        })}
      </nav>
    </>
  )
}

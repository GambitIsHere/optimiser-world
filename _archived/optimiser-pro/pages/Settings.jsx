import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, CreditCard, Users, Bell, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'

const sectionDefs = [
  {
    icon: User,
    title: 'Profile',
    fields: [
      { key: 'name', label: 'Name', value: 'Srikant', type: 'text' },
      { key: 'email', label: 'Email', value: 'srikant@optimiser.pro', type: 'email' },
      { key: 'timezone', label: 'Timezone', value: 'Europe/Amsterdam (UTC+2)', type: 'text' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Billing',
    fields: [
      { key: 'plan', label: 'Plan', value: 'MAX (€49/mo)', type: 'text' },
      { key: 'billing_date', label: 'Next billing', value: 'May 16, 2026', type: 'text' },
      { key: 'payment', label: 'Payment', value: '•••• 4242', type: 'text' },
    ],
  },
  {
    icon: Users,
    title: 'Team',
    fields: [
      { key: 'members', label: 'Members', value: '3 active members', type: 'text' },
      { key: 'invite', label: 'Invite link', value: 'optimiser.pro/join/abc123', type: 'text' },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    fields: [
      { key: 'email_alerts', label: 'Email alerts', type: 'toggle', defaultOn: true },
      { key: 'slack_alerts', label: 'Slack alerts', type: 'toggle', defaultOn: true },
      { key: 'weekly_digest', label: 'Weekly digest', type: 'toggle', defaultOn: true },
      { key: 'critical_only', label: 'Critical issues only', type: 'toggle', defaultOn: false },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    fields: [
      { key: '2fa', label: 'Two-factor auth', type: 'toggle', defaultOn: false },
      { key: 'sessions', label: 'Active sessions', value: '2 devices', type: 'text' },
    ],
  },
]

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 cursor-pointer ${on ? 'bg-mint/30' : 'bg-white/10'}`}
      role="switch"
      aria-checked={on}
    >
      <motion.div
        className={`absolute top-[3px] w-4 h-4 rounded-full ${on ? 'bg-mint' : 'bg-white/40'}`}
        animate={{ left: on ? 21 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [toggles, setToggles] = useState(() => {
    const init = {}
    sectionDefs.forEach(s => s.fields.forEach(f => {
      if (f.type === 'toggle') init[f.key] = f.defaultOn ?? false
    }))
    return init
  })

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-white/30 mb-8">Manage your account and preferences</p>
      </motion.div>

      <div className="space-y-6 max-w-2xl">
        {sectionDefs.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                <section.icon className="w-4 h-4 text-mint" />
              </div>
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.fields.map(field => (
                <div key={field.key} className="flex items-center justify-between">
                  <span className="text-sm text-white/40">{field.label}</span>
                  {field.type === 'toggle' ? (
                    <Toggle on={toggles[field.key]} onToggle={() => handleToggle(field.key)} />
                  ) : (
                    <span className="text-sm text-white/70">{field.value}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDefs.length * 0.08 }}
          className="glass-card p-6 border-red/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Sign out</p>
              <p className="text-xs text-white/30 mt-0.5">End your current session</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red border border-red/20 rounded-lg hover:bg-red/10 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

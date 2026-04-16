import { motion } from 'framer-motion'
import { User, CreditCard, Users, Bell } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const sections = [
  {
    icon: User,
    title: 'Profile',
    fields: [
      { label: 'Name', value: 'Srikant', type: 'text' },
      { label: 'Email', value: 'srikant@optimiser.pro', type: 'email' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Billing',
    fields: [
      { label: 'Plan', value: 'MAX (€49/mo)', type: 'text' },
      { label: 'Next billing', value: 'May 16, 2026', type: 'text' },
    ],
  },
  {
    icon: Users,
    title: 'Team',
    fields: [
      { label: 'Members', value: '3 active members', type: 'text' },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    fields: [
      { label: 'Email alerts', value: 'Enabled', type: 'toggle' },
      { label: 'Slack alerts', value: 'Enabled', type: 'toggle' },
      { label: 'Weekly digest', value: 'Enabled', type: 'toggle' },
    ],
  },
]

export default function Settings() {
  const { user } = useAuth()

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-white/30 mb-8">Manage your account and preferences</p>
      </motion.div>

      <div className="space-y-6 max-w-2xl">
        {sections.map((section, i) => (
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
                <div key={field.label} className="flex items-center justify-between">
                  <span className="text-sm text-white/40">{field.label}</span>
                  {field.type === 'toggle' ? (
                    <div className="w-9 h-5 rounded-full bg-mint/20 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-mint" />
                    </div>
                  ) : (
                    <span className="text-sm text-white/70">{field.value}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

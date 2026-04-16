import { motion } from 'framer-motion'

export default function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-6 border-b border-white/[0.06]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-3 text-sm font-medium transition-colors duration-200 relative ${
            activeTab === tab.id ? 'text-mint' : 'text-white/40 hover:text-white/60'
          }`}
        >
          {tab.label}

          {activeTab === tab.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-mint"
              layoutId="tabUnderline"
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

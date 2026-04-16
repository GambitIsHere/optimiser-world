import { motion } from 'framer-motion'

export default function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-6 border-b border-[#D0D1C9]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-3 text-sm font-medium transition-colors duration-200 relative ${
            activeTab === tab.id ? 'text-[#F54E00]' : 'text-[#6B6E66] hover:text-[#2E2E2E]'
          }`}
        >
          {tab.label}

          {activeTab === tab.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F54E00]"
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

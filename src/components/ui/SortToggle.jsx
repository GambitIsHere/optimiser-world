import { motion } from 'framer-motion'

export default function SortToggle({ value, onChange, options }) {
  return (
    <div className="inline-flex bg-surface-2 rounded-lg p-1 border border-white/[0.06]">
      <div className="relative flex">
        {options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`relative z-10 px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
              value === option.value ? 'text-bg' : 'text-white/60 hover:text-white/80'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {option.label}
          </motion.button>
        ))}

        {/* Sliding background indicator */}
        <motion.div
          className="absolute inset-y-0 bg-mint rounded-md z-0"
          layoutId="sortToggleIndicator"
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          style={{
            width: `${100 / options.length}%`,
            left: `${(options.findIndex((o) => o.value === value) * 100) / options.length}%`,
          }}
        />
      </div>
    </div>
  )
}

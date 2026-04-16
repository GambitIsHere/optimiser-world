import { motion } from 'framer-motion'
import { cn } from '../../utils'

export default function MagneticButton({
  children,
  variant = 'primary',
  className,
  onClick,
  disabled = false,
}) {
  const variantClasses = {
    primary: 'bg-mint text-bg font-bold hover:opacity-90',
    secondary: 'bg-surface-2 border border-white/10 text-white hover:bg-surface hover:border-white/20',
    ghost: 'transparent text-white/60 hover:text-white',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        'px-4 py-2 rounded-lg transition-all duration-200 font-medium',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </motion.button>
  )
}

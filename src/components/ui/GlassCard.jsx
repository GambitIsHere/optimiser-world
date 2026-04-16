import { cn } from '../../utils'

export default function GlassCard({ children, className, hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface/60 backdrop-blur-xl border border-white/[0.06] rounded-xl',
        hover && 'transition-all duration-200 hover:border-white/10 hover:bg-surface/80 cursor-pointer hover:scale-[1.01]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

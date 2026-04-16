import { cn } from '../../utils'

export default function GlassCard({ children, className, hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-[#151515] rounded-[10px] shadow-[3px_3px_0_#151515]',
        hover && 'transition-all duration-120 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#151515] cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

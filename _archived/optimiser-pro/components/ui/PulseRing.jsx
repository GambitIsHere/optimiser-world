import { cn } from '../../utils'

export default function PulseRing({ label = 'Loading...', size = 'md', className }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' }
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative rounded-full', sizes[size])}>
        <div className="absolute inset-0 rounded-full border-2 border-mint animate-ping opacity-30" />
        <div className="absolute inset-0 rounded-full border-2 border-mint opacity-60" style={{ animation: 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
        <div className="absolute inset-1 rounded-full bg-mint/20" />
      </div>
      <span className="text-sm text-white/50 font-mono tracking-wide">{label}</span>
    </div>
  )
}

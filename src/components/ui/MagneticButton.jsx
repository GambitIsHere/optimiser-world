import { cn } from '../../utils'

export default function MagneticButton({ children, className, variant = 'primary', ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold text-[14px] px-5 py-2.5 rounded-full border border-[#151515] shadow-[3px_3px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_#151515] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#151515] transition'
  const variants = {
    primary: 'bg-[#F54E00] text-white',
    secondary: 'bg-white text-[#151515]',
  }

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

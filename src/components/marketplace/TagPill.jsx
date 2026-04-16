import { cn } from '../../utils'

const colorMap = {
  mint: '#00E5A0',
  blue: '#5B8DEF',
  violet: '#A855F7',
  amber: '#FBBF24',
  red: '#FF6B6B',
  pink: '#EC4899',
  orange: '#F97316',
}

export default function TagPill({ label, color = 'blue' }) {
  const bgColor = colorMap[color] || colorMap.blue
  const bgHex = bgColor.replace('#', '')
  const opacity = Math.round((15 / 100) * 255)
    .toString(16)
    .padStart(2, '0')

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium inline-block"
      style={{
        backgroundColor: `${bgColor}${opacity}`,
        color: bgColor,
      }}
    >
      {label}
    </span>
  )
}

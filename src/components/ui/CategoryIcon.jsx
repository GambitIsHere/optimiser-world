import {
  TrendingUp,
  Server,
  PenTool,
  BarChart2,
  Palette,
  Lightbulb,
  DollarSign,
  Package,
} from 'lucide-react'

const iconMap = {
  TrendingUp,
  Server,
  PenTool,
  BarChart2,
  Palette,
  Lightbulb,
  DollarSign,
  Package,
}

export default function CategoryIcon({ iconName, size = 20, color = 'currentColor' }) {
  const Icon = iconMap[iconName]

  if (!Icon) {
    return null
  }

  return <Icon size={size} color={color} />
}

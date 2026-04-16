import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../lib/mockData'
import CategoryIcon from '../ui/CategoryIcon'
import GlassCard from '../ui/GlassCard'

export default function CategoryGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6">
      <h2 className="text-2xl font-bold text-white mb-6">Explore by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map(cat => (
          <Link key={cat.id} to={`/browse/${cat.slug}`}>
            <GlassCard hover className="p-4 flex items-center gap-3" style={{ borderLeft: `3px solid ${cat.color}` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: cat.color + '15' }}>
                <CategoryIcon iconName={cat.icon} size={20} color={cat.color} />
              </div>
              <div>
                <div className="text-white font-medium text-sm">{cat.name}</div>
                <div className="text-white/40 text-xs">{cat.count} items</div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  )
}

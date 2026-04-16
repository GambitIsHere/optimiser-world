import { motion } from 'framer-motion'
import IntegrationCard from '../components/dashboard/IntegrationCard'
import { MOCK_INTEGRATIONS } from '../data/mockData'

export default function Connect() {
  const connected = MOCK_INTEGRATIONS.filter(i => i.status === 'connected')
  const available = MOCK_INTEGRATIONS.filter(i => i.status !== 'connected')

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Integrations</h1>
        <p className="text-sm text-white/30 mb-8">Connect your analytics, code, and deployment stack</p>
      </motion.div>

      {connected.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Connected</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connected.map((int, i) => (
              <IntegrationCard key={int.id} integration={int} delay={i * 0.06} />
            ))}
          </div>
        </section>
      )}

      {available.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Available</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((int, i) => (
              <IntegrationCard key={int.id} integration={int} delay={i * 0.06} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

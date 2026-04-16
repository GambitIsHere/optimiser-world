import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import FlowGraph from '../components/dashboard/FlowGraph'
import { MOCK_FLOWS } from '../data/mockData'

export default function Flows() {
  const [selectedFlow, setSelectedFlow] = useState(MOCK_FLOWS[0])
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Flow Map</h1>
        <p className="text-sm text-white/30 mb-8">Discovered user flows and conversion paths</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-6">
        {MOCK_FLOWS.map(flow => (
          <button
            key={flow.id}
            onClick={() => { setSelectedFlow(flow); setSelectedNode(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              selectedFlow.id === flow.id
                ? 'bg-mint/10 text-mint border border-mint/20'
                : 'bg-surface text-white/40 border border-white/[0.06] hover:text-white/60'
            }`}
          >
            {flow.name}
            <span className="ml-2 text-xs opacity-60">{flow.completionRate}%</span>
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{selectedFlow.name} Flow</h3>
            <p className="text-xs text-white/30">{selectedFlow.totalVisitors.toLocaleString()} total visitors</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/40">Completion:</span>
            <span className="text-lg font-mono font-bold text-mint">{selectedFlow.completionRate}%</span>
          </div>
        </div>
        <FlowGraph flow={selectedFlow} onNodeClick={setSelectedNode} />
      </motion.div>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{selectedNode.name}</h3>
              <button onClick={() => setSelectedNode(null)} className="text-white/30 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-surface-2/50">
                <p className="text-xs text-white/30 mb-1">Visitors</p>
                <p className="text-lg font-mono font-bold text-white">{selectedNode.visitors.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-2/50">
                <p className="text-xs text-white/30 mb-1">Conversion</p>
                <p className="text-lg font-mono font-bold text-mint">{selectedNode.conversion}%</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-2/50">
                <p className="text-xs text-white/30 mb-1">Path</p>
                <p className="text-sm font-mono text-white/60">{selectedNode.path}</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-2/50">
                <p className="text-xs text-white/30 mb-1">Status</p>
                <p className="text-sm text-mint">Active</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

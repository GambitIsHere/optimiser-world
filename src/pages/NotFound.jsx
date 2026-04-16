import { motion } from 'framer-motion'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-8 h-8 text-white/20" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">404</h1>
        <p className="text-white/40 mb-8">
          This page doesn't exist, or the flow hasn't been discovered yet.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-mint text-bg font-bold rounded-lg transition-all hover:opacity-90 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </motion.div>
    </div>
  )
}

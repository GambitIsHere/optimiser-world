import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleDemoLogin = () => {
    setLoading(true)
    setTimeout(() => {
      login({
        id: 'user_1',
        name: 'Srikant',
        email: 'srikant@optimiser.pro',
        plan: 'max',
      })
      navigate('/dashboard')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="block text-center mb-12">
          <span className="text-2xl font-extrabold text-white">Optimiser<span className="text-mint">.Pro</span></span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-xl font-bold text-white mb-2 text-center">Welcome back</h1>
          <p className="text-sm text-white/40 text-center mb-8">Sign in to your intelligence dashboard</p>

          <div className="space-y-3">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-mint text-bg font-bold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="font-mono text-sm">Scanning signals...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Launch demo dashboard
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface text-xs text-white/25">or continue with</span>
              </div>
            </div>

            <button className="w-full py-3 border border-white/10 text-white/60 font-medium rounded-lg transition-all hover:border-white/20 hover:text-white cursor-pointer text-sm">
              Sign in with GitHub
            </button>
            <button className="w-full py-3 border border-white/10 text-white/60 font-medium rounded-lg transition-all hover:border-white/20 hover:text-white cursor-pointer text-sm">
              Sign in with Google
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}

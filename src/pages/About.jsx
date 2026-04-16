import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Brain, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import Footer from '../components/landing/Footer'

const pillars = [
  { icon: TrendingUp, title: 'Trends', description: 'We track what the market does. Every shift in user behaviour is a signal waiting to be read.' },
  { icon: Brain, title: 'Theory', description: 'Behavioural economics, jobs-to-be-done, systems thinking. We build on frameworks, not guesswork.' },
  { icon: RefreshCw, title: 'Psychology', description: 'Understanding why users hesitate, abandon, or convert. The "why" behind every data point.' },
]

const team = [
  { name: 'Srikant', role: 'Founder & CEO', bio: 'Product engineer obsessed with closing the loop between analytics and action.' },
  { name: 'AI Agent Collective', role: 'Core Engine', bio: 'A swarm of specialised AI agents that observe, diagnose, and heal product flows.' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white transition-colors mb-12 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Every business problem is an{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint to-blue">
              optimisation problem.
            </span>
          </h1>
          <p className="text-lg text-white/50 leading-relaxed mb-16 max-w-2xl">
            Optimiser.Pro is the first platform to close the full intelligence loop — from analytics signal to shipped fix. We don't just show you data. We tell you what's broken, why, and fix it.
          </p>
        </motion.div>

        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8">Our philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center mb-4">
                  <p.icon className="w-5 h-5 text-mint" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{p.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-8">Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center mb-4">
                  <span className="text-mint font-bold text-sm">{t.name.charAt(0)}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{t.name}</h3>
                <p className="text-xs text-mint/60 mb-2">{t.role}</p>
                <p className="text-sm text-white/40">{t.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}

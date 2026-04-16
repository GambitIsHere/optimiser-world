import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const tiers = [
  {
    name: 'PRO',
    description: 'OSS-first stack. Community support. Funnel Heal only.',
    monthly: 0,
    annual: 0,
    cta: 'Start free',
    features: [
      'Unlimited flow discovery',
      'AI root-cause analysis',
      'Funnel Heal (A/B experiments)',
      '3 integrations',
      'Community support',
      '1 team member',
    ],
  },
  {
    name: 'MAX',
    description: 'Managed stack. Code Heal included. Priority support.',
    monthly: 49,
    annual: 39,
    popular: true,
    cta: 'Upgrade to MAX',
    features: [
      'Everything in PRO',
      'Code Heal (auto PRs)',
      'Unlimited integrations',
      'Slack alerts',
      'Priority support',
      'Unlimited team members',
      'Custom flow triggers',
      'Revenue impact dashboard',
    ],
  },
]

export default function PricingCards() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-white/40 mb-8">Start free. Upgrade when you need Code Heal.</p>

          <div className="inline-flex items-center gap-3 bg-surface rounded-lg p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${!annual ? 'bg-surface-2 text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${annual ? 'bg-surface-2 text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              Annual <span className="text-mint text-xs ml-1">-20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`glass-card p-8 relative ${tier.popular ? 'border-mint/20 ring-1 ring-mint/10' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 bg-mint text-bg text-xs font-bold rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-sm text-white/40 mb-6">{tier.description}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-white">
                  {annual ? (tier.annual === 0 ? 'Free' : `€${tier.annual}`) : (tier.monthly === 0 ? 'Free' : `€${tier.monthly}`)}
                </span>
                {(annual ? tier.annual : tier.monthly) > 0 && (
                  <span className="text-white/30 text-sm">/mo</span>
                )}
              </div>

              <Link
                to="/login"
                className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                  tier.popular
                    ? 'bg-mint text-bg hover:opacity-90'
                    : 'bg-surface-2 border border-white/10 text-white hover:border-white/20'
                }`}
              >
                {tier.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/60">
                    <Check className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

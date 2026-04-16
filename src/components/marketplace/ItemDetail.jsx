import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Copy,
  Star,
  Rocket,
  AlertCircle,
  Download,
  Calendar,
  Check,
  ExternalLink,
  Heart,
  Flag,
} from 'lucide-react'
import VoteWidget from './VoteWidget'
import TagPill from './TagPill'
import KarmaBadge from './KarmaBadge'
import TabNav from '../ui/TabNav'
import GlassCard from '../ui/GlassCard'
import MagneticButton from '../ui/MagneticButton'
import DiscussionThread from './DiscussionThread'
import { timeAgo, formatNumber, cn } from '../../utils'
import { MOCK_ITEMS } from '../../lib/mockData'

export default function ItemDetail({ item, comments = [] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [isStarred, setIsStarred] = useState(false)

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(item.installCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const relatedItems = MOCK_ITEMS.filter(
    (i) => i.category === item.category && i.id !== item.id
  ).slice(0, 3)

  const ratingStars = Array.from({ length: 5 }, (_, i) => (
    <div
      key={i}
      className={cn(
        'w-5 h-5',
        i < Math.floor(item.rating)
          ? 'bg-amber text-amber'
          : i < item.rating
            ? 'bg-amber/50 text-amber'
            : 'bg-white/10 text-white/30'
      )}
    >
      ★
    </div>
  ))

  const renderOverviewTab = () => (
    <div className="space-y-8">
      <div className="prose prose-invert max-w-none">
        <p className="text-white/80 leading-relaxed text-base">{item.description}</p>

        <h3 className="text-lg font-semibold text-white mt-6 mb-4">Use Cases</h3>
        <ul className="space-y-2">
          {item.useCases?.map((useCase, i) => (
            <li key={i} className="flex items-start gap-3 text-white/80">
              <Check className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
              <span>{useCase}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold text-white mt-6 mb-4">Compatibility</h3>
        <div className="flex flex-wrap gap-2">
          {item.compatibility?.map((comp, i) => (
            <TagPill key={i} label={comp} variant="secondary" />
          ))}
        </div>

        <h3 className="text-lg font-semibold text-white mt-6 mb-4">Version Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-white/50 mb-1">Current Version</p>
            <p className="text-white font-medium">{item.version}</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-white/50 mb-1">Last Updated</p>
            <p className="text-white font-medium">{item.lastUpdated}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mt-6 mb-4">Rating</h3>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">{ratingStars}</div>
          <div className="text-white">
            {item.rating.toFixed(1)} / 5 ({formatNumber(item.reviews)} reviews)
          </div>
        </div>
      </div>
    </div>
  )

  const renderReadmeTab = () => (
    <div className="prose prose-invert max-w-none space-y-6">
      <h2 className="text-2xl font-bold text-white">Getting Started</h2>
      <p className="text-white/80">
        This is a comprehensive guide to using {item.name}. Follow the sections below to integrate
        and configure the solution.
      </p>

      <h3 className="text-xl font-semibold text-white">Installation</h3>
      <p className="text-white/80">Run the following command to install:</p>
      <pre className="bg-surface-2 border border-border rounded-lg p-4 overflow-x-auto">
        <code className="text-mint text-sm font-mono">{item.installCommand}</code>
      </pre>

      <h3 className="text-xl font-semibold text-white">Configuration</h3>
      <p className="text-white/80">
        Configure your environment variables and settings as needed. For detailed instructions,
        refer to the official documentation.
      </p>

      <h3 className="text-xl font-semibold text-white">Troubleshooting</h3>
      <p className="text-white/80">
        If you encounter any issues during setup, check the FAQ section or visit our community
        discussions.
      </p>
    </div>
  )

  const renderUsageTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Install Command</h3>
        <div className="bg-surface-2 border border-border rounded-lg p-4">
          <pre className="text-mint text-sm font-mono overflow-x-auto">
            <code>{item.installCommand}</code>
          </pre>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Integration Example</h3>
        <div className="bg-surface-2 border border-border rounded-lg p-4">
          <pre className="text-mint text-sm font-mono overflow-x-auto whitespace-pre-wrap">
            <code>{`// Basic integration example
import { ${item.name.replace(/[- ]/g, '')} } from '${item.installCommand.split("'")[1]}'

const instance = new ${item.name.replace(/[- ]/g, '')}({
  apiKey: process.env.API_KEY,
  config: {
    // your configuration
  }
})

// Start using it
await instance.initialize()`}</code>
          </pre>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Additional Resources</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-white/80">
            <ExternalLink className="w-4 h-4 text-mint" />
            <span>Documentation & API Reference</span>
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <ExternalLink className="w-4 h-4 text-mint" />
            <span>GitHub Repository</span>
          </li>
          <li className="flex items-center gap-2 text-white/80">
            <ExternalLink className="w-4 h-4 text-mint" />
            <span>Community Support</span>
          </li>
        </ul>
      </div>
    </div>
  )

  const renderChangelogTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          {
            version: '2.1.0',
            date: '2024-03-15',
            changes: ['Added support for streaming responses', 'Improved error handling', 'Performance optimizations'],
          },
          {
            version: '2.0.5',
            date: '2024-03-01',
            changes: ['Fixed memory leak in batch processing', 'Updated dependencies', 'Bug fixes'],
          },
          {
            version: '2.0.0',
            date: '2024-02-15',
            changes: ['Major refactor of API', 'Breaking changes to configuration', 'New features and improvements'],
          },
        ].map((entry) => (
          <div key={entry.version} className="bg-surface-2 border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white">v{entry.version}</h4>
                <p className="text-sm text-white/40 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <ul className="space-y-2">
              {entry.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                  <span className="text-mint mt-1">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDiscussionTab = () => <DiscussionThread comments={comments} itemSlug={item.slug} />

  const tabContent = {
    overview: renderOverviewTab(),
    readme: renderReadmeTab(),
    usage: renderUsageTab(),
    changelog: renderChangelogTab(),
    discussion: renderDiscussionTab(),
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                    item.type === 'agent'
                      ? 'bg-violet/20 text-violet'
                      : 'bg-mint/20 text-mint'
                  )}
                >
                  {item.type.toUpperCase()}
                </span>
                {item.featured && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber/20 text-amber">
                    FEATURED
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white">{item.name}</h1>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-mint to-blue rounded-full flex items-center justify-center font-bold text-black text-sm">
                    {item.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">
                      <Link
                        to={`/profile/${item.author.username}`}
                        className="font-medium text-white hover:text-mint transition"
                      >
                        {item.author.displayName}
                      </Link>
                    </p>
                    <p className="text-xs text-white/50">{item.author.username}</p>
                  </div>
                </div>
                <KarmaBadge karma={item.author.karma} />
              </div>
            </div>

            <div className="flex-shrink-0">
              <VoteWidget
                votes={item.votes}
                isVoted={false}
                onVote={() => {}}
                variant="large"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {item.tags?.map((tag, i) => (
              <TagPill key={i} label={tag} />
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-border">
          <MagneticButton
            onClick={handleCopyCommand}
            className="flex items-center gap-2 px-4 py-2 bg-mint text-black font-medium rounded-lg hover:bg-mint/90 transition"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy install command'}
          </MagneticButton>

          <button className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border text-white rounded-lg hover:bg-surface-3 transition">
            <Heart className={cn('w-4 h-4', isStarred && 'fill-red text-red')} />
            Star
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border text-white rounded-lg opacity-50 cursor-not-allowed">
              <Rocket className="w-4 h-4" />
              Deploy via AgentBrain
            </button>
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black border border-border rounded text-xs text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              Coming soon
            </div>
          </div>

          <button className="ml-auto flex items-center gap-2 text-white/60 hover:text-red transition text-sm">
            <Flag className="w-4 h-4" />
            Report
          </button>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <TabNav
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'readme', label: 'README' },
              { id: 'usage', label: 'Usage' },
              { id: 'changelog', label: 'Changelog' },
              { id: 'discussion', label: `Discussion (${comments.length})` },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div>{tabContent[activeTab]}</div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Author Profile Card */}
        <GlassCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-white">About Author</h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-mint to-blue rounded-full flex items-center justify-center font-bold text-black">
                {item.author.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{item.author.displayName}</p>
                <p className="text-xs text-white/50">@{item.author.username}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Karma</span>
                <span className="font-semibold text-white">{formatNumber(item.author.karma)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Member since</span>
                <span className="font-semibold text-white">{item.author.memberSince}</span>
              </div>
            </div>

            <Link
              to={`/profile/${item.author.username}`}
              className="block w-full px-4 py-2 text-center bg-surface-2 text-mint rounded-lg hover:bg-surface-3 transition font-medium text-sm"
            >
              View profile
            </Link>
          </div>
        </GlassCard>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <GlassCard>
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Related Items</h3>

              <div className="space-y-3">
                {relatedItems.map((relItem) => (
                  <Link
                    key={relItem.id}
                    to={`/item/${relItem.slug}`}
                    className="block p-3 bg-surface-2 rounded-lg hover:bg-surface-3 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white group-hover:text-mint transition truncate">
                          {relItem.name}
                        </p>
                        <p className="text-xs text-white/50 mt-1">{relItem.downloads} downloads</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1 text-white/60 text-xs">
                        <span>↑</span>
                        <span>{formatNumber(relItem.votes)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Stats */}
        <GlassCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Stats</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-2 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-mint">{formatNumber(item.usedBy)}</p>
                <p className="text-xs text-white/50 mt-1">Projects</p>
              </div>

              <div className="bg-surface-2 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber">{item.rating.toFixed(1)}</p>
                <p className="text-xs text-white/50 mt-1">Rating</p>
              </div>

              <div className="bg-surface-2 rounded-lg p-3 col-span-2">
                <p className="text-2xl font-bold text-blue">{formatNumber(item.downloads)}</p>
                <p className="text-xs text-white/50 mt-1">Downloads</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

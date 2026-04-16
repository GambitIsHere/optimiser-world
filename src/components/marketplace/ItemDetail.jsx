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
            : 'bg-[#E3E4DD] text-[#6B6E66]'
      )}
    >
      ★
    </div>
  ))

  const renderOverviewTab = () => (
    <div className="space-y-8">
      <div className="prose max-w-none">
        <p className="text-[#2E2E2E] leading-relaxed text-base">{item.description}</p>

        <h3 className="text-lg font-semibold text-[#151515] mt-6 mb-4">Use Cases</h3>
        <ul className="space-y-2">
          {item.useCases?.map((useCase, i) => (
            <li key={i} className="flex items-start gap-3 text-[#2E2E2E]">
              <Check className="w-5 h-5 text-[#F54E00] flex-shrink-0 mt-0.5" />
              <span>{useCase}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold text-[#151515] mt-6 mb-4">Compatibility</h3>
        <div className="flex flex-wrap gap-2">
          {item.compatibility?.map((comp, i) => (
            <TagPill key={i} label={comp} variant="secondary" />
          ))}
        </div>

        <h3 className="text-lg font-semibold text-[#151515] mt-6 mb-4">Version Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-[#E3E4DD] rounded-lg p-3">
            <p className="text-[#6B6E66] mb-1">Current Version</p>
            <p className="text-[#151515] font-medium">{item.version}</p>
          </div>
          <div className="bg-[#E3E4DD] rounded-lg p-3">
            <p className="text-[#6B6E66] mb-1">Last Updated</p>
            <p className="text-[#151515] font-medium">{item.lastUpdated}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#151515] mt-6 mb-4">Rating</h3>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">{ratingStars}</div>
          <div className="text-[#151515]">
            {item.rating.toFixed(1)} / 5 ({formatNumber(item.reviews)} reviews)
          </div>
        </div>
      </div>
    </div>
  )

  const renderReadmeTab = () => (
    <div className="prose max-w-none space-y-6">
      <h2 className="text-2xl font-bold text-[#151515]">Getting Started</h2>
      <p className="text-[#2E2E2E]">
        This is a comprehensive guide to using {item.name}. Follow the sections below to integrate
        and configure the solution.
      </p>

      <h3 className="text-xl font-semibold text-[#151515]">Installation</h3>
      <p className="text-[#2E2E2E]">Run the following command to install:</p>
      <pre className="bg-[#E3E4DD] border border-border rounded-lg p-4 overflow-x-auto">
        <code className="text-[#F54E00] text-sm font-mono">{item.installCommand}</code>
      </pre>

      <h3 className="text-xl font-semibold text-[#151515]">Configuration</h3>
      <p className="text-[#2E2E2E]">
        Configure your environment variables and settings as needed. For detailed instructions,
        refer to the official documentation.
      </p>

      <h3 className="text-xl font-semibold text-[#151515]">Troubleshooting</h3>
      <p className="text-[#2E2E2E]">
        If you encounter any issues during setup, check the FAQ section or visit our community
        discussions.
      </p>
    </div>
  )

  const renderUsageTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#151515] mb-4">Install Command</h3>
        <div className="bg-[#E3E4DD] border border-border rounded-lg p-4">
          <pre className="text-[#F54E00] text-sm font-mono overflow-x-auto">
            <code>{item.installCommand}</code>
          </pre>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#151515] mb-4">Integration Example</h3>
        <div className="bg-[#E3E4DD] border border-border rounded-lg p-4">
          <pre className="text-[#F54E00] text-sm font-mono overflow-x-auto whitespace-pre-wrap">
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
        <h3 className="text-lg font-semibold text-[#151515] mb-4">Additional Resources</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-[#2E2E2E]">
            <ExternalLink className="w-4 h-4 text-[#F54E00]" />
            <span>Documentation & API Reference</span>
          </li>
          <li className="flex items-center gap-2 text-[#2E2E2E]">
            <ExternalLink className="w-4 h-4 text-[#F54E00]" />
            <span>GitHub Repository</span>
          </li>
          <li className="flex items-center gap-2 text-[#2E2E2E]">
            <ExternalLink className="w-4 h-4 text-[#F54E00]" />
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
          <div key={entry.version} className="bg-[#E3E4DD] border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-[#151515]">v{entry.version}</h4>
                <p className="text-sm text-[#6B6E66] flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <ul className="space-y-2">
              {entry.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2 text-[#2E2E2E] text-sm">
                  <span className="text-[#F54E00] mt-1">•</span>
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
                      : 'bg-[#FEE8DE] text-[#F54E00]'
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
              <h1 className="text-3xl font-bold text-[#151515]">{item.name}</h1>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F54E00] to-[#FFF287] rounded-full flex items-center justify-center font-bold text-white text-sm">
                    {item.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">
                      <Link
                        to={`/profile/${item.author.username}`}
                        className="font-medium text-[#151515] hover:text-[#F54E00] transition"
                      >
                        {item.author.displayName}
                      </Link>
                    </p>
                    <p className="text-xs text-[#6B6E66]">{item.author.username}</p>
                  </div>
                </div>
                <KarmaBadge karma={item.author.karma} />
              </div>
            </div>

            <div className="flex-shrink-0">
              <VoteWidget
                upvotes={item.votes || 0}
                downvotes={0}
                userVote={null}
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
            className="flex items-center gap-2 px-4 py-2 bg-[#F54E00] text-white font-medium rounded-lg hover:bg-[#F54E00]/90 transition"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy install command'}
          </MagneticButton>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#E3E4DD] border border-border text-[#151515] rounded-lg hover:bg-[#D0D1C9] transition">
            <Heart className={cn('w-4 h-4', isStarred && 'fill-red text-red')} />
            Star
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#E3E4DD] border border-border text-[#151515] rounded-lg opacity-50 cursor-not-allowed">
              <Rocket className="w-4 h-4" />
              Deploy via AgentBrain
            </button>
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black border border-border rounded text-xs text-[#6B6E66] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              Coming soon
            </div>
          </div>

          <button className="ml-auto flex items-center gap-2 text-[#6B6E66] hover:text-red transition text-sm">
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
            <h3 className="font-semibold text-[#151515]">About Author</h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F54E00] to-[#FFF287] rounded-full flex items-center justify-center font-bold text-white">
                {item.author.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#151515]">{item.author.displayName}</p>
                <p className="text-xs text-[#6B6E66]">@{item.author.username}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6E66] text-sm">Karma</span>
                <span className="font-semibold text-[#151515]">{formatNumber(item.author.karma)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6E66] text-sm">Member since</span>
                <span className="font-semibold text-[#151515]">{item.author.memberSince}</span>
              </div>
            </div>

            <Link
              to={`/profile/${item.author.username}`}
              className="block w-full px-4 py-2 text-center bg-[#E3E4DD] text-[#F54E00] rounded-lg hover:bg-[#D0D1C9] transition font-medium text-sm"
            >
              View profile
            </Link>
          </div>
        </GlassCard>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <GlassCard>
            <div className="space-y-4">
              <h3 className="font-semibold text-[#151515]">Related Items</h3>

              <div className="space-y-3">
                {relatedItems.map((relItem) => (
                  <Link
                    key={relItem.id}
                    to={`/item/${relItem.slug}`}
                    className="block p-3 bg-[#E3E4DD] rounded-lg hover:bg-[#D0D1C9] transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#151515] group-hover:text-[#F54E00] transition truncate">
                          {relItem.name}
                        </p>
                        <p className="text-xs text-[#6B6E66] mt-1">{relItem.downloads} downloads</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1 text-[#6B6E66] text-xs">
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
            <h3 className="font-semibold text-[#151515]">Stats</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#E3E4DD] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-[#F54E00]">{formatNumber(item.usedBy)}</p>
                <p className="text-xs text-[#6B6E66] mt-1">Projects</p>
              </div>

              <div className="bg-[#E3E4DD] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber">{item.rating.toFixed(1)}</p>
                <p className="text-xs text-[#6B6E66] mt-1">Rating</p>
              </div>

              <div className="bg-[#E3E4DD] rounded-lg p-3 col-span-2">
                <p className="text-2xl font-bold text-blue">{formatNumber(item.downloads)}</p>
                <p className="text-xs text-[#6B6E66] mt-1">Downloads</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

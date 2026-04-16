import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, Calendar } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import KarmaBadge from '../components/marketplace/KarmaBadge'
import TabNav from '../components/ui/TabNav'
import { MOCK_ITEMS, MOCK_COMMENTS } from '../lib/mockData'
import { api } from '../api/client'
import { cn, formatNumber, timeAgo, getKarmaTier } from '../utils'

const MOCK_USER = {
  username: 'srikant',
  displayName: 'Srikant',
  karma: 12450,
  memberSince: '2024-01-15',
  bio: 'Building the future of AI tooling and optimizing everything.',
  avatar: null,
  links: { github: 'https://github.com/srikant' },
}

export default function Profile() {
  const { username } = useParams()
  const [activeTab, setActiveTab] = useState('submissions')
  const [user, setUser] = useState(MOCK_USER)
  const [loading, setLoading] = useState(true)

  // Try fetching user from API, fall back to mock
  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      try {
        const data = await api.getProfile()
        if (!cancelled && data) setUser(data)
      } catch {
        // keep mock
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [username])

  const userSubmissions = MOCK_ITEMS.filter(
    (item) => item.author.username === user.username
  )
  const userComments = MOCK_COMMENTS.filter(
    (comment) => comment.author.username === user.username
  )

  const tabs = [
    { id: 'submissions', label: 'Submissions' },
    { id: 'comments', label: 'Comments' },
    { id: 'voted', label: 'Voted' },
    { id: 'collections', label: 'Collections' },
  ]

  const karmaTier = getKarmaTier(user.karma)

  return (
    <div className="min-h-screen bg-bg">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-surface/60 to-bg border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex gap-8 items-start">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-mint to-blue flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-bg">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-1">
                {user.displayName}
              </h1>
              <p className="text-white/60 text-lg mb-4">@{user.username}</p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-mint font-bold text-xl">
                      {formatNumber(user.karma)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${karmaTier.color}20`,
                        color: karmaTier.color,
                      }}
                    >
                      {karmaTier.label}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">Karma</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-xl">
                      {userSubmissions.length}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">Submissions</p>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-white/40" />
                  <span className="text-white/60 text-sm">
                    Joined {new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <p className="text-white/80 mb-4 max-w-2xl">
                {user.bio}
              </p>

              {user.links?.github && (
                <a
                  href={user.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface/40 hover:bg-surface/60 transition-colors text-white text-sm"
                >
                  <ExternalLink size={16} /> GitHub Profile
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-8">
          {activeTab === 'submissions' && (
            <div>
              {userSubmissions.length === 0 ? (
                <p className="text-white/60 py-12 text-center">
                  No submissions yet
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {userSubmissions.map((item) => (
                    <GlassCard key={item.id} className="p-6">
                      <div className="mb-3">
                        <span
                          className={cn(
                            'px-2 py-1 rounded text-xs font-semibold inline-block',
                            item.type === 'agent'
                              ? 'bg-blue/20 text-blue'
                              : 'bg-violet/20 text-violet'
                          )}
                        >
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-white/60 text-sm mb-4">
                        {item.shortDescription}
                      </p>
                      <div className="flex justify-between text-sm text-white/60">
                        <span>{formatNumber(item.upvotes)} votes</span>
                        <span>{formatNumber(item.downloads)} downloads</span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {userComments.length === 0 ? (
                <p className="text-white/60 py-12 text-center">
                  No comments yet
                </p>
              ) : (
                userComments.map((comment) => (
                  <GlassCard key={comment.id} className="p-6">
                    <p className="text-white/60 text-sm mb-2">
                      On {comment.itemSlug}
                    </p>
                    <p className="text-white mb-3">{comment.content}</p>
                    <div className="flex justify-between items-center text-sm text-white/60">
                      <span>{formatNumber(comment.upvotes)} upvotes</span>
                      <span>{timeAgo(comment.createdAt)}</span>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {activeTab === 'voted' && (
            <div className="text-center py-12">
              <p className="text-white/60">Your votes are private</p>
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="text-center py-12">
              <p className="text-white/60">No collections curated yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

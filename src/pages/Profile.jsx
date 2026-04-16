import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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
    <div className="min-h-screen bg-[#EEEFE9]">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-[#E3E4DD] to-[#EEEFE9] border-b border-[#D0D1C9]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex gap-8 items-start">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F54E00] to-[#FFF287] flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-white">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#151515] mb-1">
                {user.displayName}
              </h1>
              <p className="text-[#6B6E66] text-lg mb-4">@{user.username}</p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#F54E00] font-bold text-xl">
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
                  <p className="text-[#6B6E66] text-sm">Karma</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#151515] font-bold text-xl">
                      {userSubmissions.length}
                    </span>
                  </div>
                  <p className="text-[#6B6E66] text-sm">Submissions</p>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#6B6E66]" />
                  <span className="text-[#6B6E66] text-sm">
                    Joined {new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <p className="text-[#2E2E2E] mb-4 max-w-2xl">
                {user.bio}
              </p>

              {user.links?.github && (
                <a
                  href={user.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E3E4DD] hover:bg-white transition-colors text-[#151515] text-sm"
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
                <p className="text-[#6B6E66] py-12 text-center">
                  No submissions yet
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {userSubmissions.map((item) => (
                    <Link key={item.id} to={`/item/${item.slug}`}>
                    <GlassCard className="p-6">
                      <div className="mb-3">
                        <span
                          className={cn(
                            'px-2 py-1 rounded text-xs font-semibold inline-block',
                            item.type === 'agent'
                              ? 'bg-[#1D4AFF]/20 text-[#1D4AFF]'
                              : 'bg-[#C79EF5]/20 text-[#C79EF5]'
                          )}
                        >
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#151515] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-[#6B6E66] text-sm mb-4">
                        {item.shortDescription}
                      </p>
                      <div className="flex justify-between text-sm text-[#6B6E66]">
                        <span>{formatNumber(item.upvotes)} votes</span>
                        <span>{formatNumber(item.downloads)} downloads</span>
                      </div>
                    </GlassCard>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {userComments.length === 0 ? (
                <p className="text-[#6B6E66] py-12 text-center">
                  No comments yet
                </p>
              ) : (
                userComments.map((comment) => (
                  <GlassCard key={comment.id} className="p-6">
                    <p className="text-[#6B6E66] text-sm mb-2">
                      On {comment.itemSlug}
                    </p>
                    <p className="text-[#151515] mb-3">{comment.content}</p>
                    <div className="flex justify-between items-center text-sm text-[#6B6E66]">
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
              <p className="text-[#6B6E66]">Your votes are private</p>
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="text-center py-12">
              <p className="text-[#6B6E66]">No collections curated yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

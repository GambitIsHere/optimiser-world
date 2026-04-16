import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import VoteWidget from './VoteWidget'
import KarmaBadge from './KarmaBadge'
import useVote from '../../hooks/useVote'
import { timeAgo, cn } from '../../utils'

export default function DiscussionThread({ comments = [], itemSlug }) {
  const [newComment, setNewComment] = useState('')
  const { votes, toggleVote } = useVote('comments')

  const topLevelComments = comments.filter(c => c.parentId === null)

  const getReplies = (commentId) => {
    return comments.filter(c => c.parentId === commentId)
  }

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      setNewComment('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">Add a comment</label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full px-4 py-3 bg-surface-2 border border-border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/30 resize-none"
          rows={3}
        />
        <button
          onClick={handleSubmitComment}
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-mint text-black font-medium rounded-lg hover:bg-mint/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Post comment
        </button>
      </div>

      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-center">
            <div className="space-y-2">
              <MessageSquare className="w-8 h-8 text-white/30 mx-auto" />
              <p className="text-white/50">No comments yet. Be the first to share!</p>
            </div>
          </div>
        ) : (
          topLevelComments.map((comment) => {
            const replies = getReplies(comment.id)
            const authorInitial = comment.author.username.charAt(0).toUpperCase()
            const isVoted = votes[comment.id]

            return (
              <div key={comment.id} className="space-y-3">
                <div className="bg-surface-2 border border-border rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-mint to-blue rounded-full flex items-center justify-center font-bold text-black text-sm">
                        {authorInitial}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-medium text-white hover:text-mint cursor-pointer transition">
                          {comment.author.username}
                        </span>
                        <KarmaBadge karma={comment.author.karma} />
                        <span className="text-xs text-white/40">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>

                      <p className="text-white/90 text-sm leading-relaxed mb-4">
                        {comment.content}
                      </p>

                      <div className="flex items-center gap-4">
                        <VoteWidget
                          votes={comment.upvotes}
                          isVoted={isVoted}
                          onVote={() => toggleVote(comment.id)}
                          variant="compact"
                        />
                        <button className="text-xs font-medium text-white/60 hover:text-mint transition">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {replies.length > 0 && (
                  <div className="space-y-3 border-l-2 border-white/10 ml-8 pl-4">
                    {replies.map((reply) => {
                      const replyAuthorInitial = reply.author.username.charAt(0).toUpperCase()
                      const isReplyVoted = votes[reply.id]

                      return (
                        <div
                          key={reply.id}
                          className="bg-surface-2 border border-border rounded-lg p-4"
                        >
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gradient-to-br from-violet to-blue rounded-full flex items-center justify-center font-bold text-black text-xs">
                                {replyAuthorInitial}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-2">
                                <span className="font-medium text-white text-sm hover:text-mint cursor-pointer transition">
                                  {reply.author.username}
                                </span>
                                <KarmaBadge karma={reply.author.karma} />
                                <span className="text-xs text-white/40">
                                  {timeAgo(reply.createdAt)}
                                </span>
                              </div>

                              <p className="text-white/90 text-sm leading-relaxed mb-3">
                                {reply.content}
                              </p>

                              <div className="flex items-center gap-4">
                                <VoteWidget
                                  votes={reply.upvotes}
                                  isVoted={isReplyVoted}
                                  onVote={() => toggleVote(reply.id)}
                                  variant="compact"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

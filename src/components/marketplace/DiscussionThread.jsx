import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import VoteWidget from './VoteWidget'
import KarmaBadge from './KarmaBadge'
import { timeAgo, cn } from '../../utils'

export default function DiscussionThread({ comments = [], itemSlug }) {
  const [newComment, setNewComment] = useState('')
  const [commentVotes, setCommentVotes] = useState({})

  const handleCommentVote = (commentId, direction) => {
    setCommentVotes(prev => ({
      ...prev,
      [commentId]: prev[commentId] === direction ? null : direction
    }))
  }

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
        <label className="block text-sm font-medium text-[#151515]">Add a comment</label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full px-4 py-3 bg-[#E3E4DD] border border-[#D0D1C9] rounded-lg text-[#151515] placeholder-[#6B6E66] focus:outline-none focus:border-[#F54E00]/50 focus:ring-1 focus:ring-[#F54E00]/30 resize-none"
          rows={3}
        />
        <button
          onClick={handleSubmitComment}
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-[#F54E00] text-white font-medium rounded-lg hover:bg-[#F54E00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Post comment
        </button>
      </div>

      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-center">
            <div className="space-y-2">
              <MessageSquare className="w-8 h-8 text-[#6B6E66] mx-auto" />
              <p className="text-[#6B6E66]">No comments yet. Be the first to share!</p>
            </div>
          </div>
        ) : (
          topLevelComments.map((comment) => {
            const replies = getReplies(comment.id)
            const authorInitial = comment.author.username.charAt(0).toUpperCase()
            const userVoteDir = commentVotes[comment.id] || null

            return (
              <div key={comment.id} className="space-y-3">
                <div className="bg-[#E3E4DD] border border-[#D0D1C9] rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F54E00] to-[#FFF287] rounded-full flex items-center justify-center font-bold text-white text-sm">
                        {authorInitial}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-medium text-[#151515] hover:text-[#F54E00] cursor-pointer transition">
                          {comment.author.username}
                        </span>
                        <KarmaBadge karma={comment.author.karma} />
                        <span className="text-xs text-[#6B6E66]">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>

                      <p className="text-[#2E2E2E] text-sm leading-relaxed mb-4">
                        {comment.content}
                      </p>

                      <div className="flex items-center gap-4">
                        <VoteWidget
                          upvotes={comment.upvotes || 0}
                          downvotes={comment.downvotes || 0}
                          userVote={userVoteDir}
                          onVote={(dir) => handleCommentVote(comment.id, dir)}
                          variant="horizontal"
                        />
                        <button className="text-xs font-medium text-[#6B6E66] hover:text-[#F54E00] transition">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {replies.length > 0 && (
                  <div className="space-y-3 border-l-2 border-[#D0D1C9] ml-8 pl-4">
                    {replies.map((reply) => {
                      const replyAuthorInitial = reply.author.username.charAt(0).toUpperCase()
                      const replyVoteDir = commentVotes[reply.id] || null

                      return (
                        <div
                          key={reply.id}
                          className="bg-[#E3E4DD] border border-[#D0D1C9] rounded-lg p-4"
                        >
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gradient-to-br from-violet to-[#FFF287] rounded-full flex items-center justify-center font-bold text-white text-xs">
                                {replyAuthorInitial}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-2">
                                <span className="font-medium text-[#151515] text-sm hover:text-[#F54E00] cursor-pointer transition">
                                  {reply.author.username}
                                </span>
                                <KarmaBadge karma={reply.author.karma} />
                                <span className="text-xs text-[#6B6E66]">
                                  {timeAgo(reply.createdAt)}
                                </span>
                              </div>

                              <p className="text-[#2E2E2E] text-sm leading-relaxed mb-3">
                                {reply.content}
                              </p>

                              <div className="flex items-center gap-4">
                                <VoteWidget
                                  upvotes={reply.upvotes || 0}
                                  downvotes={reply.downvotes || 0}
                                  userVote={replyVoteDir}
                                  onVote={(dir) => handleCommentVote(reply.id, dir)}
                                  variant="horizontal"
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

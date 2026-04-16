import { useState } from 'react'

export default function useVote(initialUpvotes = 0, initialDownvotes = 0) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState(null) // null | 'up' | 'down'

  const handleVote = (direction) => {
    if (direction === 'up') {
      if (userVote === 'up') {
        // Undo upvote
        setUpvotes(upvotes - 1)
        setUserVote(null)
      } else if (userVote === 'down') {
        // Switch from downvote to upvote
        setDownvotes(downvotes - 1)
        setUpvotes(upvotes + 1)
        setUserVote('up')
      } else {
        // New upvote
        setUpvotes(upvotes + 1)
        setUserVote('up')
      }
    } else if (direction === 'down') {
      if (userVote === 'down') {
        // Undo downvote
        setDownvotes(downvotes - 1)
        setUserVote(null)
      } else if (userVote === 'up') {
        // Switch from upvote to downvote
        setUpvotes(upvotes - 1)
        setDownvotes(downvotes + 1)
        setUserVote('down')
      } else {
        // New downvote
        setDownvotes(downvotes + 1)
        setUserVote('down')
      }
    }
  }

  return {
    upvotes,
    downvotes,
    userVote,
    handleVote,
  }
}

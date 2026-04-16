import { useState } from 'react'
import { api } from '../api/client'

export default function useVote(initialUpvotes = 0, initialDownvotes = 0, slug = null) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState(null) // null | 'up' | 'down'

  const handleVote = (direction) => {
    if (direction === 'up') {
      if (userVote === 'up') {
        setUpvotes(upvotes - 1)
        setUserVote(null)
        if (slug) api.unvote(slug).catch(() => {})
      } else if (userVote === 'down') {
        setDownvotes(downvotes - 1)
        setUpvotes(upvotes + 1)
        setUserVote('up')
        if (slug) api.vote(slug, 'up').catch(() => {})
      } else {
        setUpvotes(upvotes + 1)
        setUserVote('up')
        if (slug) api.vote(slug, 'up').catch(() => {})
      }
    } else if (direction === 'down') {
      if (userVote === 'down') {
        setDownvotes(downvotes - 1)
        setUserVote(null)
        if (slug) api.unvote(slug).catch(() => {})
      } else if (userVote === 'up') {
        setUpvotes(upvotes - 1)
        setDownvotes(downvotes + 1)
        setUserVote('down')
        if (slug) api.vote(slug, 'down').catch(() => {})
      } else {
        setDownvotes(downvotes + 1)
        setUserVote('down')
        if (slug) api.vote(slug, 'down').catch(() => {})
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

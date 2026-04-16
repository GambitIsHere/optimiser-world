import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn, formatNumber } from '../../utils'

export default function VoteWidget({
  upvotes = 0,
  downvotes = 0,
  onVote,
  userVote = null,
  variant = 'default',
}) {
  const [pulseType, setPulseType] = useState(null)
  const [scoreKey, setScoreKey] = useState(0)
  const [slideDir, setSlideDir] = useState('up')
  const score = upvotes - downvotes

  const handleVote = (direction) => {
    setPulseType(direction)
    setSlideDir(direction === 'up' ? 'up' : 'down')
    setScoreKey((prev) => prev + 1)
    setTimeout(() => setPulseType(null), 400)
    onVote?.(direction)
  }

  const isLarge = variant === 'large'
  const isHorizontal = variant === 'horizontal'
  const iconSize = isLarge ? 28 : isHorizontal ? 16 : 18
  const containerClass = isHorizontal
    ? 'flex items-center gap-1.5'
    : 'flex flex-col items-center gap-0.5'

  return (
    <div
      className={cn(containerClass, 'select-none relative')}
      role="group"
      aria-label="Vote widget"
    >
      {/* Pulse ring overlay */}
      {pulseType && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.div
            className="rounded-full"
            style={{
              width: isLarge ? 48 : isHorizontal ? 32 : 40,
              height: isLarge ? 48 : isHorizontal ? 32 : 40,
              border: `2px solid ${pulseType === 'up' ? '#F54E00' : '#FF6B6B'}`,
            }}
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Upvote button */}
      <button
        onClick={() => handleVote('up')}
        className={cn(
          'flex items-center justify-center rounded-md transition-colors duration-150 flex-shrink-0',
          isLarge ? 'w-10 h-10' : isHorizontal ? 'w-6 h-6' : 'w-7 h-7',
          userVote === 'up'
            ? 'text-[#F54E00] bg-[#FEE8DE]'
            : 'text-[#6B6E66] hover:text-[#F54E00] hover:bg-[#FEE8DE]'
        )}
        aria-label="Upvote"
        aria-pressed={userVote === 'up'}
      >
        <ChevronUp size={iconSize} strokeWidth={2.5} />
      </button>

      {/* Score with slide animation */}
      <div
        className={cn(
          'overflow-hidden flex items-center justify-center',
          isLarge ? 'min-w-[48px] text-xl h-8' : isHorizontal ? 'min-w-[28px] text-xs h-5' : 'min-w-[32px] text-sm h-6',
          'font-mono font-medium'
        )}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={scoreKey}
            initial={{ y: slideDir === 'up' ? 8 : -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: slideDir === 'up' ? -8 : 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'block',
              userVote === 'up'
                ? 'text-[#F54E00]'
                : userVote === 'down'
                  ? 'text-red'
                  : 'text-[#6B6E66]'
            )}
          >
            {formatNumber(score)}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Downvote button */}
      <button
        onClick={() => handleVote('down')}
        className={cn(
          'flex items-center justify-center rounded-md transition-colors duration-150 flex-shrink-0',
          isLarge ? 'w-10 h-10' : isHorizontal ? 'w-6 h-6' : 'w-7 h-7',
          userVote === 'down'
            ? 'text-red bg-red/10'
            : 'text-[#6B6E66] hover:text-red hover:bg-red/5'
        )}
        aria-label="Downvote"
        aria-pressed={userVote === 'down'}
      >
        <ChevronDown size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  )
}

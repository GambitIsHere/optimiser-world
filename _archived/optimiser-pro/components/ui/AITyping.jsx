import { useState, useEffect } from 'react'
import { cn } from '../../utils'

export default function AITyping({ text, speed = 30, className, onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setDone(true)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span className={cn('font-mono text-sm text-white/80', className)}>
      {displayed}
      {!done && <span className="ai-cursor" />}
    </span>
  )
}

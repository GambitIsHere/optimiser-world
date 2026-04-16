import { useRef, useEffect } from 'react'

export default function SignalDecayCanvas() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width, height

    // Seed-based pseudo-random
    let seed = 2025
    const seededRandom = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    const resize = () => {
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    // Attractors (5-8 fixed points)
    const attractors = Array.from({ length: 6 }, () => ({
      x: seededRandom() * canvas.offsetWidth,
      y: seededRandom() * canvas.offsetHeight,
      radius: 40 + seededRandom() * 60,
      pulseAlpha: 0,
    }))

    // Particles
    const particles = Array.from({ length: 300 }, () => ({
      x: seededRandom() * canvas.offsetWidth,
      y: seededRandom() * canvas.offsetHeight,
      vx: (seededRandom() - 0.5) * 1.5,
      vy: (seededRandom() - 0.5) * 1.5,
      alpha: 0.15 + seededRandom() * 0.3,
      size: 1 + seededRandom() * 1.5,
    }))

    const actualWidth = () => canvas.offsetWidth
    const actualHeight = () => canvas.offsetHeight

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const animate = () => {
      if (prefersReducedMotion) {
        // Draw static frame
        ctx.clearRect(0, 0, actualWidth(), actualHeight())
        particles.forEach(p => {
          ctx.fillStyle = `rgba(51, 65, 85, ${p.alpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        })
        attractors.forEach(a => {
          ctx.fillStyle = 'rgba(0, 229, 160, 0.08)'
          ctx.beginPath()
          ctx.arc(a.x, a.y, a.radius * 0.5, 0, Math.PI * 2)
          ctx.fill()
        })
        return
      }

      ctx.clearRect(0, 0, actualWidth(), actualHeight())

      // Update and draw particles
      particles.forEach(p => {
        // Mouse influence
        const mx = mouseRef.current.x
        const my = mouseRef.current.y
        if (mx && my) {
          const dx = mx - p.x
          const dy = my - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const force = (150 - dist) / 150 * 0.3
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }
        }

        // Attractor influence
        attractors.forEach(a => {
          const dx = a.x - p.x
          const dy = a.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < a.radius * 2) {
            const force = (a.radius * 2 - dist) / (a.radius * 2) * 0.15
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }
          // Pulse when reaching attractor
          if (dist < a.radius * 0.3) {
            a.pulseAlpha = Math.min(1, a.pulseAlpha + 0.05)
            // Reset particle
            p.x = seededRandom() * actualWidth()
            p.y = seededRandom() * actualHeight()
            p.vx = (seededRandom() - 0.5) * 1.5
            p.vy = (seededRandom() - 0.5) * 1.5
          }
        })

        // Damping
        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < 0) p.x = actualWidth()
        if (p.x > actualWidth()) p.x = 0
        if (p.y < 0) p.y = actualHeight()
        if (p.y > actualHeight()) p.y = 0

        // Draw particle
        ctx.fillStyle = `rgba(51, 65, 85, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw attractor pulses
      attractors.forEach(a => {
        if (a.pulseAlpha > 0) {
          const gradient = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius)
          gradient.addColorStop(0, `rgba(0, 229, 160, ${a.pulseAlpha * 0.3})`)
          gradient.addColorStop(1, 'rgba(0, 229, 160, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2)
          ctx.fill()
          a.pulseAlpha *= 0.97
          if (a.pulseAlpha < 0.01) a.pulseAlpha = 0
        }
      })

      animRef.current = requestAnimationFrame(animate)
    }

    // Pause when tab not visible
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current)
      } else {
        animRef.current = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    canvas.addEventListener('mousemove', handleMouseMove)

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  )
}

import { useEffect, useRef, useCallback } from 'react'

// Seed-based random for reproducibility
function seededRandom(seed) {
  let s = seed
  return function() {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const COLORS = {
  mint: '#00E5A0',
  blue: '#5B8DEF',
  violet: '#A855F7',
  amber: '#FBBF24',
}

const COLOR_KEYS = Object.keys(COLORS)

export default function CollectiveCanvas({ className = '', opacity = 0.6, nodeCount = 200 }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const nodesRef = useRef([])
  const prefersReducedMotion = useRef(false)

  const initNodes = useCallback((width, height) => {
    const rand = seededRandom(2026)
    const nodes = []

    // Create category centroids (4 clusters)
    const centroids = COLOR_KEYS.map((_, i) => ({
      x: width * (0.2 + 0.6 * rand()),
      y: height * (0.2 + 0.6 * rand()),
    }))

    for (let i = 0; i < nodeCount; i++) {
      const categoryIdx = Math.floor(rand() * 4)
      const centroid = centroids[categoryIdx]
      const voteScore = rand() // 0-1, determines size
      const spread = 150 + rand() * 200

      nodes.push({
        x: centroid.x + (rand() - 0.5) * spread,
        y: centroid.y + (rand() - 0.5) * spread,
        vx: (rand() - 0.5) * 0.3,
        vy: (rand() - 0.5) * 0.3,
        radius: 1.5 + voteScore * 3.5, // small=new, large=popular
        color: COLORS[COLOR_KEYS[categoryIdx]],
        alpha: 0.15 + voteScore * 0.45,
        categoryIdx,
        centroidX: centroid.x,
        centroidY: centroid.y,
        orbitSpeed: 0.0003 + rand() * 0.001,
        orbitAngle: rand() * Math.PI * 2,
        orbitRadius: 30 + rand() * 120,
      })
    }

    nodesRef.current = nodes
  }, [nodeCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      initNodes(rect.width, rect.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.width / window.devicePixelRatio
      const h = canvas.height / window.devicePixelRatio

      ctx.clearRect(0, 0, w, h)

      const nodes = nodesRef.current

      for (const node of nodes) {
        if (!prefersReducedMotion.current) {
          // Slow orbital motion around cluster centroid
          node.orbitAngle += node.orbitSpeed
          const targetX = node.centroidX + Math.cos(node.orbitAngle) * node.orbitRadius
          const targetY = node.centroidY + Math.sin(node.orbitAngle) * node.orbitRadius

          // Gentle gravitational pull toward orbit position
          node.vx += (targetX - node.x) * 0.0008
          node.vy += (targetY - node.y) * 0.0008

          // Damping
          node.vx *= 0.99
          node.vy *= 0.99

          node.x += node.vx
          node.y += node.vy
        }

        // Draw glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 3
        )
        gradient.addColorStop(0, node.color + Math.round(node.alpha * 255).toString(16).padStart(2, '0'))
        gradient.addColorStop(1, node.color + '00')

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw core
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color + Math.round(node.alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }

      // Draw subtle connections between nearby nodes in same category
      // Skip pairs using i % 3 !== 0 to reduce O(n^2) cost
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodes.length; i++) {
        if (i % 3 !== 0) continue
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].categoryIdx !== nodes[j].categoryIdx) continue
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 60) {
            const lineAlpha = Math.round((1 - dist / 60) * 20).toString(16).padStart(2, '0')
            ctx.strokeStyle = nodes[i].color + lineAlpha
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [initNodes])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ opacity, position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  )
}

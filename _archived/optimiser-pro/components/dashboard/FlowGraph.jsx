import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils'

function getConversionColor(rate) {
  if (rate >= 70) return '#00E5A0'
  if (rate >= 40) return '#5B8DEF'
  if (rate >= 20) return '#FBBF24'
  return '#FF6B6B'
}

export default function FlowGraph({ flow, onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null)

  if (!flow || (!flow.steps && !flow.nodes)) return null

  const steps = flow.steps || flow.nodes
  const nodeWidth = 140
  const nodeHeight = 60
  const gap = 80
  const padding = 40
  const totalWidth = steps.length * nodeWidth + (steps.length - 1) * gap + padding * 2
  const svgHeight = 160

  return (
    <div className="overflow-x-auto">
      <svg width={totalWidth} height={svgHeight} className="min-w-full">
        {/* Edges */}
        {steps.slice(0, -1).map((step, i) => {
          const x1 = padding + i * (nodeWidth + gap) + nodeWidth
          const x2 = padding + (i + 1) * (nodeWidth + gap)
          const y = svgHeight / 2
          const nextStep = steps[i + 1]
          const thickness = Math.max(1, (nextStep.conversion / 100) * 4)
          return (
            <g key={`edge-${i}`}>
              <line
                x1={x1} y1={y} x2={x2} y2={y}
                stroke={getConversionColor(nextStep.conversion)}
                strokeWidth={thickness}
                opacity={0.4}
              />
              <text
                x={(x1 + x2) / 2}
                y={y - 12}
                textAnchor="middle"
                fill="rgba(255,255,255,0.25)"
                fontSize="11"
                fontFamily="monospace"
              >
                {nextStep.conversion}%
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {steps.map((step, i) => {
          const x = padding + i * (nodeWidth + gap)
          const y = svgHeight / 2 - nodeHeight / 2
          const isHovered = hoveredNode === step.id
          return (
            <g
              key={step.id}
              onClick={() => onNodeClick?.(step)}
              onMouseEnter={() => setHoveredNode(step.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
            >
              <rect
                x={x} y={y}
                width={nodeWidth} height={nodeHeight}
                rx={12}
                fill={isHovered ? 'rgba(17,24,39,0.9)' : 'rgba(17,24,39,0.6)'}
                stroke={getConversionColor(step.conversion)}
                strokeWidth={isHovered ? 2 : 1}
                opacity={isHovered ? 1 : 0.8}
              />
              <text
                x={x + nodeWidth / 2} y={y + 24}
                textAnchor="middle"
                fill="white" fontSize="12" fontWeight="600"
              >
                {step.name}
              </text>
              <text
                x={x + nodeWidth / 2} y={y + 44}
                textAnchor="middle"
                fill={getConversionColor(step.conversion)}
                fontSize="11" fontFamily="monospace"
              >
                {step.visitors.toLocaleString()} visits
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

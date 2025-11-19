"use client"

import { useMemo } from "react"

export interface RadarChartData {
  categories: Array<{ label: string; value: number }>
}

export function RadarChart({ data }: { data: RadarChartData }) {
  const axes = data.categories.map(cat => cat.label)
  const values = data.categories.map(cat => cat.value)

  const maxValue = 10
  const centerX = 120
  const centerY = 120
  const radius = 80

  const points = useMemo(() => {
    return values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2
      const distance = (value / maxValue) * radius
      return {
        x: centerX + distance * Math.cos(angle),
        y: centerY + distance * Math.sin(angle),
        label: axes[index],
        value,
      }
    })
  }, [values, axes])

  // Path data is handled by polygon element, no need for separate pathData

  const gridLines = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const gridRadius = (radius * (i + 1)) / 5
      return (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={gridRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-muted opacity-30"
        />
      )
    })
  }, [])

  const axisLines = useMemo(() => {
    return axes.map((_, index) => {
      const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      return (
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={x}
          y2={y}
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-muted opacity-30"
        />
      )
    })
  }, [axes])

  const axisLabels = useMemo(() => {
    return axes.map((label, index) => {
      const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2
      const labelRadius = radius + 20
      const x = centerX + labelRadius * Math.cos(angle)
      const y = centerY + labelRadius * Math.sin(angle)
      return (
        <text
          key={index}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-foreground"
        >
          {label}
        </text>
      )
    })
  }, [axes])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Overall Performance
      </h3>
      <div className="flex items-center justify-center">
        <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
          {gridLines}
          {axisLines}
          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="currentColor"
              className="text-primary"
            />
          ))}
          {axisLabels}
        </svg>
      </div>
    </div>
  )
}


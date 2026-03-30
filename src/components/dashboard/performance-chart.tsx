type DataPoint = { label: string; value: number }

export function PerformanceChart({ data, color = "#8E9ED6" }: { data: DataPoint[]; color?: string }) {
  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.value), 1)
  const width = 100
  const height = 40
  const padding = 2

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * (width - padding * 2),
    y: height - padding - (d.value / max) * (height - padding * 2),
  }))

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height + 16}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGrad)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.2" fill={color} />
        ))}
        {data.map((d, i) => (
          <text key={`label-${i}`} x={points[i].x} y={height + 10} textAnchor="middle" fill="#6B7280" fontSize="3.5" fontFamily="sans-serif">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

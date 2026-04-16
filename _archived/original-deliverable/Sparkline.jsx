// Sparkline — SVG line chart for vote velocity history.
// Used on item detail pages.

export default function Sparkline({ data, color = '#2EAD4A', height = 40, showPeak = true, label }) {
  if (!data || data.length < 2) return null;

  const W = 300;
  const H = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return { x, y };
  });
  const linePath = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  const areaPath = `M 0,${H} L ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} L ${W},${H} Z`;
  const last = points[points.length - 1];

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#6B6E66] mb-1.5">
          <span>{label}</span>
          {showPeak && <span>peak {max.toLocaleString()}</span>}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full block" style={{ height }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#spark-${color.replace('#', '')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last.x} cy={last.y} r="5" fill={color} opacity="0.25" />
        <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
      </svg>
    </div>
  );
}

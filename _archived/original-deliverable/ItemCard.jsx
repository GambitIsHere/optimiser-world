import { Link } from 'react-router-dom';
import VoteWidget from './VoteWidget.jsx';

// ═══════════════════════════════════════════════════════════
// ItemCard — the universal card used in every feed
// ═══════════════════════════════════════════════════════════

export default function ItemCard({ item, variant = 'default' }) {
  if (!item) return null;

  const cat = item.category_obj;
  const isAgent = item.type === 'agent';

  if (variant === 'compact') {
    return (
      <Link to={`/item/${item.slug}`} className="block group">
        <div className="paper-card p-4 flex items-start gap-3">
          <VoteWidget upvotes={item.stats.upvotes} downvotes={item.stats.downvotes} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="inline-block font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: isAgent ? '#CFE8FF' : '#FFF287', color: isAgent ? '#1D4AFF' : '#151515' }}
              >
                {item.type}
              </span>
              <h3 className="font-bold text-[14px] truncate group-hover:text-[#F54E00] transition-colors">{item.title}</h3>
            </div>
            <p className="text-[12px] text-[#6B6E66] line-clamp-1">{item.short_description}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/item/${item.slug}`} className="block group">
      <article className="paper-card p-5 h-full flex flex-col">

        {/* ── Row 1: type badge, category, hot ── */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: isAgent ? '#CFE8FF' : '#FFF287', color: isAgent ? '#1D4AFF' : '#151515' }}
            >
              {item.type}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#6B6E66]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.hex }} />
              {cat.short}
            </span>
          </div>
          {item.is_hot && (
            <span className="font-mono text-[9px] font-bold text-[#F54E00] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F54E00]" />
              HOT
            </span>
          )}
        </div>

        {/* ── Row 2: title + description ── */}
        <h3 className="font-bold text-[17px] leading-tight mb-1.5 tracking-tight group-hover:text-[#F54E00] transition-colors">
          {item.title}
        </h3>
        <p className="text-[13px] text-[#2E2E2E] leading-snug line-clamp-3 mb-4">
          {item.short_description}
        </p>

        {/* ── Row 3: footer ── */}
        <div className="mt-auto pt-3 border-t border-dashed border-[#D0D1C9] flex items-end justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <VoteWidget upvotes={item.stats.upvotes} downvotes={item.stats.downvotes} orientation="horizontal" size="sm" />
          </div>
          <div className="text-right text-[11px] font-mono text-[#6B6E66] min-w-0">
            <div className="flex items-center gap-1 justify-end">
              <KarmaBadge karma={item.author.karma} />
              <span className="text-[#1D4AFF] truncate">@{item.author.username}</span>
            </div>
            <div className="mt-0.5 opacity-60">{item.updated_at} ago · {formatRuns(item.stats.downloads)} runs</div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════
// Karma badge — small tier icon
// ═══════════════════════════════════════════════════════════

export function KarmaBadge({ karma }) {
  let tier, color, title;
  if (karma >= 10000) { tier = '◆'; color = '#1D4AFF'; title = `Diamond · ${karma.toLocaleString()}`; }
  else if (karma >= 1000) { tier = '●'; color = '#F7B200'; title = `Gold · ${karma.toLocaleString()}`; }
  else if (karma >= 100) { tier = '●'; color = '#6B6E66'; title = `Silver · ${karma.toLocaleString()}`; }
  else { tier = '●'; color = '#C23A00'; title = `Bronze · ${karma.toLocaleString()}`; }
  return <span style={{ color }} title={title} className="text-[10px]">{tier}</span>;
}

// ═══════════════════════════════════════════════════════════
// Tag pill
// ═══════════════════════════════════════════════════════════

export function TagPill({ tag, color, active, onClick, size = 'md' }) {
  const cls = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-[11px] px-2.5 py-1';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 ${cls} font-mono rounded-full border border-[#151515] transition ${active ? 'bg-[#151515] text-white' : 'bg-white hover:shadow-[2px_2px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px]'}`}
    >
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {tag}
    </button>
  );
}

function formatRuns(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

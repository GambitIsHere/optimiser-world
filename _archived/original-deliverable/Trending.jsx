import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrending } from '../api/client.js';
import { ITEMS } from '../lib/mockData.js';
import { CATEGORIES } from '../lib/categories.js';
import LivingSubstrate from '../components/hero/LivingSubstrate.jsx';
import ItemCard, { KarmaBadge } from '../components/marketplace/ItemCard.jsx';

export default function Trending() {
  const [data, setData] = useState({ items: [], tags: [], contributors: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending().then((r) => {
      setData(r.data || { items: [], tags: [], contributors: [] });
      setLoading(false);
    });
  }, []);

  // Split top items by category
  const byCategory = {};
  for (const cat of CATEGORIES.slice(0, 6)) {
    byCategory[cat.slug] = ITEMS
      .filter((i) => i.category === cat.slug)
      .sort((a, b) => b.stats.upvotes - a.stats.upvotes)
      .slice(0, 5);
  }

  return (
    <div className="relative">

      {/* ═══════════════════════════════════════════════════════════
          AMBIENT SUBSTRATE BACKGROUND
         ═══════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0" aria-hidden="true">
        <LivingSubstrate items={ITEMS} intensity="ambient" />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FOREGROUND
         ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 py-10">

        {/* ── Head ── */}
        <div className="mb-12 max-w-[720px]">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66]">/ trending</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#151515] rounded-full font-mono text-[10px]">
              <span className="live-dot" />
              live
            </span>
          </div>
          <h1 className="text-[clamp(44px,5vw,64px)] leading-[0.95] tracking-tight font-extrabold mb-4">
            What's <span className="hl">climbing</span> right now.
          </h1>
          <p className="text-[16px] text-[#2E2E2E] max-w-[50ch]">
            Items ranked by <span className="font-mono text-[13px] bg-white border border-[#151515] px-1.5 py-0.5 rounded">rising score</span> — vote velocity divided by age.
            Something trending here was probably nothing yesterday.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TOP 3 GLOBAL — big cards
           ═══════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-4">top 3, any category</div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="h-[240px] shimmer rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.items.slice(0, 3).map((item, i) => (
                <div key={item.slug} className="relative">
                  <div className="absolute -top-3 -left-3 z-10 w-10 h-10 rounded-full bg-[#F54E00] text-white border-2 border-[#151515] shadow-[3px_3px_0_#151515] flex items-center justify-center font-display text-[22px] font-normal">
                    {i + 1}
                  </div>
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════
            BY-CATEGORY COLUMNS
           ═══════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-1">top 5, by category</div>
              <h2 className="text-[28px] font-extrabold tracking-tight">The leaderboard</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <div key={cat.slug} className="paper-card-static p-5">
                <Link to={`/c/${cat.slug}`} className="group flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.hex }} />
                    <h3 className="font-bold text-[15px] group-hover:text-[#F54E00]">{cat.name}</h3>
                  </div>
                  <span className="font-mono text-[10px] text-[#6B6E66] group-hover:text-[#F54E00]">→</span>
                </Link>

                <ol className="space-y-2.5">
                  {(byCategory[cat.slug] || []).map((item, i) => (
                    <li key={item.slug} className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[#6B6E66] w-4 tabular-nums">{i + 1}.</span>
                      <Link to={`/item/${item.slug}`} className="flex-1 min-w-0 truncate text-[13px] font-semibold hover:text-[#F54E00]">
                        {item.title}
                      </Link>
                      <span className="font-mono text-[11px] text-[#2EAD4A] shrink-0">▲ {formatCompact(item.stats.upvotes)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            TRENDING TAGS + TOP CONTRIBUTORS SIDE BY SIDE
           ═══════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="paper-card-static p-6">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-4">Trending tags this week</h3>
            <ol className="space-y-2">
              {data.tags?.slice(0, 8).map((t, i) => (
                <li key={t.tag} className="flex items-center justify-between py-2 border-b border-dashed border-[#D0D1C9] last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#6B6E66] w-5">{i + 1}.</span>
                    <span className="font-mono text-[14px] font-semibold">#{t.tag}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#6B6E66]">{formatCompact(t.score)} votes</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="paper-card-static p-6">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-4">Top contributors</h3>
            <ol className="space-y-3">
              {data.contributors?.slice(0, 6).map((u, i) => (
                <li key={u.username} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-[11px] text-[#6B6E66] w-5">{i + 1}.</span>
                    <KarmaBadge karma={u.karma} />
                    <div className="min-w-0">
                      <div className="font-semibold text-[14px] text-[#1D4AFF] truncate">@{u.username}</div>
                      <div className="font-mono text-[10px] text-[#6B6E66]">{u.items} published · {u.upvotes.toLocaleString()} votes</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#6B6E66] shrink-0">{u.karma.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatCompact(n) {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

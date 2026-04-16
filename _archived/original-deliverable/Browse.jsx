import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchLeaderboard } from '../api/client.js';
import { CATEGORIES } from '../lib/categories.js';
import { getTrendingTags, getTopContributors } from '../lib/mockData.js';
import ItemCard, { KarmaBadge, TagPill } from '../components/marketplace/ItemCard.jsx';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get('sort') || 'hot';
  const category = searchParams.get('category') || null;
  const type = searchParams.get('type') || null;

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard({ sort, category, type, limit: 40 }).then((r) => {
      setItems(r.data.items || []);
      setLoading(false);
    });
  }, [sort, category, type]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  const tags = getTrendingTags();
  const contributors = getTopContributors();

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">

      {/* ── Page head ── */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-2">/ browse</div>
          <h1 className="text-[48px] leading-[0.95] tracking-tight font-extrabold">
            The <span className="hl">full feed</span>
          </h1>
          <p className="text-[15px] text-[#6B6E66] mt-2">
            {loading ? 'Loading…' : `${items.length.toLocaleString()} items`} ·
            sorted by <span className="font-mono text-[#F54E00]">{sort}</span>
            {category && <> · <span className="font-mono text-[#F54E00]">{CATEGORIES.find((c) => c.slug === category)?.short}</span> only</>}
            {type && <> · <span className="font-mono text-[#F54E00]">{type}</span>s only</>}
          </p>
        </div>

        {/* Sort pills */}
        <div className="inline-flex bg-white border border-[#151515] rounded-full p-1 shadow-[3px_3px_0_#151515]">
          {['hot', 'new', 'top', 'rising'].map((s) => (
            <button
              key={s}
              onClick={() => updateParam('sort', s)}
              data-active={sort === s || undefined}
              className="nav-pill"
            >
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-column layout ── */}
      <div className="grid grid-cols-12 gap-8">

        {/* ── Left rail: filters ── */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-[88px] lg:self-start">
          <div className="paper-card-static p-5">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-3">Type</h3>
            <div className="flex gap-2 flex-wrap">
              <TagPill tag="All" active={!type} onClick={() => updateParam('type', null)} />
              <TagPill tag="Agent" active={type === 'agent'} onClick={() => updateParam('type', 'agent')} />
              <TagPill tag="Skill" active={type === 'skill'} onClick={() => updateParam('type', 'skill')} />
            </div>
          </div>

          <div className="paper-card-static p-5">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-3">Category</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', null)}
                className={`w-full text-left px-3 py-2 rounded-md text-[13px] font-semibold transition-colors ${!category ? 'bg-[#151515] text-white' : 'hover:bg-[#EEEFE9]'}`}
              >
                All categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => updateParam('category', c.slug)}
                  className={`w-full text-left px-3 py-2 rounded-md text-[13px] flex items-center justify-between transition-colors ${category === c.slug ? 'bg-[#151515] text-white' : 'hover:bg-[#EEEFE9]'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.hex }} />
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="paper-card-static p-5 bg-[#FFF287] border-[#151515]">
            <div className="flex items-start gap-2 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#151515] font-bold">↗ tip</span>
            </div>
            <p className="text-[13px] leading-snug text-[#151515]">
              Sort by <span className="font-mono font-semibold">Rising</span> to see what's climbing fastest — often before it hits Hot.
            </p>
          </div>
        </aside>

        {/* ── Main feed ── */}
        <main className="col-span-12 lg:col-span-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[220px] rounded-[10px] shimmer" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((item) => (
                <ItemCard key={item.slug} item={item} />
              ))}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="mt-10 pt-6 border-t border-dashed border-[#D0D1C9] text-center">
              <div className="font-mono text-[11px] text-[#6B6E66] mb-3">End of feed · {items.length} items</div>
              <Link to="/search" className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-wider text-[#F54E00] hover:underline">
                Looking for something specific? → Try search
              </Link>
            </div>
          )}
        </main>

        {/* ── Right rail: tags, contributors ── */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-[88px] lg:self-start">
          <div className="paper-card-static p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66]">Trending tags</h3>
              <span className="live-dot" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 8).map((t) => (
                <TagPill key={t.tag} tag={`#${t.tag}`} size="sm" onClick={() => updateParam('q', t.tag)} />
              ))}
            </div>
          </div>

          <div className="paper-card-static p-5">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-3">Top contributors</h3>
            <div className="space-y-2.5">
              {contributors.slice(0, 6).map((u, i) => (
                <div key={u.username} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-[#6B6E66] w-4">{i + 1}.</span>
                    <KarmaBadge karma={u.karma} />
                    <span className="text-[13px] font-semibold truncate">@{u.username}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#6B6E66] shrink-0">{u.karma.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-card-static p-5 bg-[#151515] text-[#EEEFE9] border-[#151515]">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-2">Want the CLI?</h3>
            <p className="text-[13px] text-[#D0D1C9] mb-3 leading-snug">
              Install and run any of these from the terminal in one command.
            </p>
            <code className="block font-mono text-[11px] text-[#7DD3C0] bg-black/40 px-2 py-1.5 rounded">
              npm i -g optimiser-cli
            </code>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="paper-card-static p-16 text-center">
      <div className="font-display text-[64px] leading-none mb-4">—</div>
      <h3 className="text-[20px] font-bold mb-2">Nothing matches those filters.</h3>
      <p className="text-[13px] text-[#6B6E66] mb-4">
        Try a broader category, switch the type, or search instead.
      </p>
      <Link to="/search" className="font-mono text-[12px] uppercase tracking-wider text-[#F54E00] hover:underline">
        Search the full index →
      </Link>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { CATEGORY_BY_SLUG, CATEGORIES } from '../lib/categories.js';
import { fetchLeaderboard } from '../api/client.js';
import ItemCard from '../components/marketplace/ItemCard.jsx';

export default function Category() {
  const { slug } = useParams();
  const cat = CATEGORY_BY_SLUG[slug];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('hot');

  useEffect(() => {
    if (!cat) return;
    setLoading(true);
    fetchLeaderboard({ sort, category: slug, limit: 50 }).then((r) => {
      setItems(r.data.items || []);
      setLoading(false);
    });
  }, [slug, sort, cat]);

  if (!cat) return <Navigate to="/browse" replace />;

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════
          CATEGORY HERO — big colored block
         ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative border-b-2 border-[#151515] py-16 overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${cat.hex}15 0%, transparent 100%)` }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-4 flex items-center gap-2">
            <Link to="/browse" className="hover:text-[#F54E00]">browse</Link>
            <span>/</span>
            <span className="text-[#151515]">category</span>
          </div>

          <div className="flex items-start gap-5 mb-6">
            <div
              className="w-16 h-16 rounded-xl border-2 border-[#151515] shadow-[4px_4px_0_#151515] shrink-0"
              style={{ background: cat.hex }}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-[clamp(44px,5vw,64px)] leading-[0.95] tracking-tight font-extrabold mb-3">
                {cat.name}
              </h1>
              <p className="text-[17px] leading-relaxed text-[#2E2E2E] max-w-[60ch]">
                {cat.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap font-mono text-[12px]">
            <span className="text-[#6B6E66]">{loading ? '—' : `${items.length} items indexed`}</span>
            <span className="text-[#D0D1C9]">·</span>
            <span className="text-[#6B6E66]">sorted by</span>
            <div className="inline-flex bg-white border border-[#151515] rounded-full p-0.5 shadow-[2px_2px_0_#151515]">
              {['hot', 'new', 'top', 'rising'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  data-active={sort === s || undefined}
                  className="nav-pill text-[11px] px-3 py-1"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEED
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="h-[220px] shimmer rounded-[10px]" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="paper-card-static p-16 text-center">
            <div className="font-display text-[64px] leading-none mb-4">—</div>
            <h3 className="text-[20px] font-bold mb-2">Nothing in {cat.name} yet.</h3>
            <p className="text-[13px] text-[#6B6E66] mb-4">
              The scraper runs every 6 hours — check back soon, or submit the first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => <ItemCard key={item.slug} item={item} />)}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OTHER CATEGORIES — quick-nav footer
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16 border-t border-[#D0D1C9]">
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-4">Other categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
            <Link
              key={c.slug}
              to={`/c/${c.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#151515] rounded-full shadow-[2px_2px_0_#151515] hover:shadow-[3px_3px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] transition"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: c.hex }} />
              <span className="text-[13px] font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

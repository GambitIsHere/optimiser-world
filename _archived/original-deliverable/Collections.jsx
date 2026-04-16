import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCollections } from '../api/client.js';
import { KarmaBadge } from '../components/marketplace/ItemCard.jsx';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections().then((r) => {
      setCollections(r.data?.collections || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">

      {/* ── Head ── */}
      <div className="mb-14 max-w-[780px]">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-3">/ collections</div>
        <h1 className="text-[clamp(48px,6vw,72px)] leading-[0.94] tracking-[-0.03em] font-extrabold mb-5">
          Skills that <span className="font-display italic font-normal">work together</span>, picked by people who shipped them.
        </h1>
        <p className="text-[17px] leading-relaxed text-[#2E2E2E] max-w-[55ch]">
          Collections are <span className="hl">curator-assembled stacks</span> — the four agents someone actually runs every day,
          the five skills a particular team ships every project. Not "best of" lists. Not top-ten clickbait.
          The exact set, from the exact person.
        </p>
      </div>

      {/* ── Collection grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[340px] shimmer rounded-[10px]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col, i) => (
            <CollectionCard key={col.slug} col={col} index={i} />
          ))}
        </div>
      )}

      {/* ── Editorial footer ── */}
      <section className="mt-24 pt-12 border-t border-[#D0D1C9]">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-3">↗ want to curate</div>
            <h2 className="text-[32px] leading-[0.98] tracking-tight font-extrabold mb-4">
              Ship a collection of your own.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-7">
            <p className="text-[15px] text-[#2E2E2E] leading-relaxed mb-4">
              The best collections aren't "top 10" lists. They're <span className="hl">"the five things I actually use, in the order I reach for them"</span> —
              assembled by someone doing real work, annotated with the context that matters.
            </p>
            <p className="text-[15px] text-[#6B6E66] leading-relaxed">
              Once you've got {'>'} 500 karma, you can publish collections. Until then — vote, comment, let the system learn what you value.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CollectionCard({ col, index }) {
  // Alternate accent colour so cards feel distinct
  const accentColors = ['#F54E00', '#1D4AFF', '#7DD3C0', '#C79EF5'];
  const accent = accentColors[index % accentColors.length];

  return (
    <Link to={`/collection/${col.slug}`} className="block group">
      <article className="paper-card p-7 h-full flex flex-col">

        {/* Index number + item count */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div
              className="font-display text-[56px] leading-none font-normal mb-1"
              style={{ color: accent }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66]">
              collection no. {String(index + 1).padStart(2, '0')}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[11px] text-[#6B6E66]">{col.resolved?.length || col.items.length} items</div>
            <div className="font-mono text-[11px] font-bold text-[#2EAD4A] mt-0.5">▲ {col.upvotes}</div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[26px] leading-tight font-extrabold tracking-tight mb-3 group-hover:text-[#F54E00] transition-colors">
          {col.title}
        </h3>

        {/* Description */}
        <p className="text-[14px] leading-relaxed text-[#2E2E2E] mb-5 flex-1">
          {col.description}
        </p>

        {/* Preview of included items */}
        <div className="mb-5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-2">Includes</div>
          <div className="flex flex-wrap gap-1.5">
            {(col.resolved || []).slice(0, 5).map((it) => (
              <span key={it.slug} className="font-mono text-[11px] px-2 py-0.5 bg-[#EEEFE9] border border-[#D0D1C9] rounded">
                {it.title}
              </span>
            ))}
            {(col.resolved?.length || 0) > 5 && (
              <span className="font-mono text-[11px] px-2 py-0.5 text-[#6B6E66]">
                +{col.resolved.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Curator */}
        <div className="pt-4 border-t border-dashed border-[#D0D1C9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KarmaBadge karma={col.curator === 'anthropic' ? 24900 : col.curator === 'srikant' ? 8420 : col.curator === 'nextlevel' ? 12400 : 2100} />
            <span className="text-[13px] text-[#6B6E66]">curated by</span>
            <span className="text-[13px] font-semibold text-[#1D4AFF]">@{col.curator}</span>
          </div>
          <span className="font-mono text-[11px] text-[#6B6E66] group-hover:text-[#F54E00] transition-colors">open →</span>
        </div>
      </article>
    </Link>
  );
}

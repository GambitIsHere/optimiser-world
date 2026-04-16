import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { fetchCollection } from '../api/client.js';
import ItemCard, { KarmaBadge } from '../components/marketplace/ItemCard.jsx';

export default function CollectionDetail() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCollection(slug).then((r) => {
      setCollection(r.data?.collection || null);
      setLoading(false);
      window.scrollTo(0, 0);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-12">
        <div className="h-12 w-80 shimmer rounded mb-6" />
        <div className="h-[500px] shimmer rounded-xl" />
      </div>
    );
  }

  if (!collection) return <Navigate to="/collections" replace />;

  const curatorKarma = collection.curator === 'anthropic' ? 24900 : collection.curator === 'srikant' ? 8420 : collection.curator === 'nextlevel' ? 12400 : 2100;

  return (
    <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-10">

      {/* ── Breadcrumb ── */}
      <div className="font-mono text-[11px] text-[#6B6E66] mb-8 flex items-center gap-2">
        <Link to="/collections" className="hover:text-[#F54E00]">collections</Link>
        <span>/</span>
        <span className="text-[#151515]">{collection.slug}</span>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HEADER — big editorial block
         ═══════════════════════════════════════════════════════════ */}
      <header className="mb-14 pb-10 border-b border-[#D0D1C9]">

        <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-4">
          a curated collection
        </div>

        <h1 className="text-[clamp(44px,6vw,72px)] leading-[0.94] tracking-[-0.035em] font-extrabold mb-6">
          {collection.title}
        </h1>

        <p className="text-[19px] leading-[1.55] text-[#2E2E2E] max-w-[58ch] mb-8 font-display italic font-normal">
          {collection.description}
        </p>

        {/* Curator byline */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-dashed border-[#D0D1C9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#151515] text-white font-mono font-bold flex items-center justify-center text-[13px]">
              {collection.curator[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <KarmaBadge karma={curatorKarma} />
                <span className="text-[14px] font-semibold text-[#1D4AFF]">@{collection.curator}</span>
              </div>
              <div className="font-mono text-[11px] text-[#6B6E66] mt-0.5">
                {curatorKarma.toLocaleString()} karma · curator
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[12px]">
            <div>
              <span className="text-[#6B6E66]">items:</span>{' '}
              <span className="font-bold">{collection.resolved?.length}</span>
            </div>
            <div>
              <span className="text-[#6B6E66]">score:</span>{' '}
              <span className="font-bold text-[#2EAD4A]">▲ {collection.upvotes}</span>
            </div>
            <button className="px-3 py-1.5 border border-[#151515] rounded-full bg-white hover:bg-[#FFF287] transition font-semibold">
              ☆ save
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          ITEMS — numbered sequence, not grid. Feels like a reading list.
         ═══════════════════════════════════════════════════════════ */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-6">
          / the stack · in order
        </div>

        <ol className="space-y-6">
          {(collection.resolved || []).map((item, i) => (
            <li key={item.slug} className="grid grid-cols-[auto_1fr] gap-6 items-start">
              <div className="pt-2">
                <div className="font-display text-[48px] leading-none font-normal text-[#F54E00] tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
              <div className="min-w-0">
                <ItemCard item={item} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INSTALL ALL — grouped action
         ═══════════════════════════════════════════════════════════ */}
      <section className="mt-16 paper-card-static bg-[#151515] text-[#EEEFE9] p-8">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-2">↗ install the whole stack</div>
            <h2 className="text-[28px] leading-tight font-extrabold mb-2">
              Want all {collection.resolved?.length}? One command.
            </h2>
            <p className="text-[14px] text-[#D0D1C9] max-w-[46ch]">
              Pulls every item in this collection into your <code className="font-mono text-[12px] bg-black/40 px-1.5 py-0.5 rounded">.claude/</code> directory with correct dependencies resolved.
            </p>
          </div>
          <div className="flex-1 min-w-[280px] max-w-[460px]">
            <div className="font-mono text-[12px] bg-black/60 text-[#7DD3C0] px-4 py-3 rounded-md mb-3 break-all">
              npx optimiser-cli install-collection {collection.slug}
            </div>
            <button className="w-full font-semibold text-[14px] px-4 py-3 rounded-md bg-[#F54E00] text-white border border-white shadow-[3px_3px_0_#EEEFE9] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_#EEEFE9] transition">
              Copy install command
            </button>
          </div>
        </div>
      </section>

      {/* ── Back to all collections ── */}
      <div className="mt-12 text-center">
        <Link to="/collections" className="font-mono text-[12px] uppercase tracking-wider text-[#F54E00] hover:underline">
          ← All collections
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchItems } from '../api/client.js';
import { ITEMS } from '../lib/mockData.js';
import { CATEGORIES } from '../lib/categories.js';
import ItemCard, { TagPill } from '../components/marketplace/ItemCard.jsx';

const SUGGESTED_QUERIES = [
  'conversion rate optimisation',
  'deploy notifier for vercel',
  'weekly digest from airtable',
  'design system scaffold',
  'github PR reviewer',
  'funnel analysis',
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLatency(null);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const t0 = performance.now();
      const r = await searchItems(query);
      const t1 = performance.now();
      setResults(r.data.results || []);
      setLatency(Math.round(t1 - t0));
      setLoading(false);
      // Sync to URL (shallow — no page reload)
      const next = new URLSearchParams(searchParams);
      next.set('q', query);
      setSearchParams(next, { replace: true });
    }, 280);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Auto-complete suggestions from titles (filter down as you type)
  const suggestions = useMemo(() => {
    if (!query || query.length < 2 || loading) return [];
    return ITEMS
      .filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map((i) => i.title);
  }, [query, loading]);

  return (
    <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-10">

      <div className="mb-12">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-2">/ search</div>
        <h1 className="text-[clamp(38px,5vw,56px)] leading-[0.95] tracking-tight font-extrabold mb-6">
          What do you need the <span className="font-display italic font-normal">marketplace</span> to do?
        </h1>

        {/* Search input */}
        <div className="relative">
          <div className="flex items-center gap-3 bg-white border-2 border-[#151515] rounded-xl px-5 py-4 shadow-[4px_4px_0_#151515] focus-within:shadow-[6px_6px_0_#151515] focus-within:-translate-x-[1px] focus-within:-translate-y-[1px] transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6B6E66] shrink-0">
              <circle cx="9" cy="9" r="7" /><path d="m14 14 4 4" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: 'an agent that watches Stripe churn' or 'skill for writing release notes'"
              className="flex-1 text-[18px] font-medium bg-transparent outline-none placeholder:text-[#6B6E66]/80"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="font-mono text-[11px] text-[#6B6E66] hover:text-[#F54E00] transition-colors px-2"
              >
                clear
              </button>
            )}
            {latency && (
              <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[11px] text-[#6B6E66] whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2EAD4A]" />
                {latency}ms
              </span>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && suggestions[0] !== query && (
            <div className="absolute top-full left-0 right-0 mt-2 paper-card-static p-2 z-20">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="block w-full text-left px-3 py-2 text-[14px] hover:bg-[#FFF287] rounded transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Empty state: suggested queries + category shortcuts ── */}
      {!query && (
        <>
          <div className="mb-12">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-3">Try searching for</h3>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((q) => (
                <TagPill key={q} tag={q} onClick={() => setQuery(q)} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-3">Or jump to a category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to={`/c/${c.slug}`}
                  className="paper-card-static p-4 hover:shadow-[4px_4px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] transition"
                >
                  <div className="w-2 h-2 rounded-full mb-2" style={{ background: c.hex }} />
                  <div className="font-bold text-[14px]">{c.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Results ── */}
      {query && (
        <div>
          {loading && results.length === 0 ? (
            <div className="font-mono text-[12px] text-[#6B6E66] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F54E00] animate-pulse" />
              Searching intelligence…
            </div>
          ) : results.length === 0 ? (
            <div className="paper-card-static p-16 text-center">
              <div className="font-display text-[64px] leading-none mb-4">—</div>
              <h3 className="text-[22px] font-bold mb-2">Nothing indexed yet for "{query}"</h3>
              <p className="text-[14px] text-[#6B6E66] max-w-[50ch] mx-auto mb-4">
                Your search gets logged — if enough people look for it, our scraper will go find it on GitHub.
                You'll probably see results within a week.
              </p>
              <Link to="/browse" className="font-mono text-[12px] uppercase tracking-wider text-[#F54E00] hover:underline">
                Browse the full feed →
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="text-[14px]">
                  <span className="font-mono font-bold">{results.length}</span>
                  <span className="text-[#6B6E66]"> results for "</span>
                  <span className="hl">{query}</span>
                  <span className="text-[#6B6E66]">"</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.map((item) => (
                  <ItemCard key={item.slug} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

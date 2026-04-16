import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchItem } from '../api/client.js';
import { ITEMS } from '../lib/mockData.js';
import VoteWidget from '../components/marketplace/VoteWidget.jsx';
import ItemCard, { KarmaBadge } from '../components/marketplace/ItemCard.jsx';
import Sparkline from '../components/ui/Sparkline.jsx';

export default function ItemDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [installCopied, setInstallCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchItem(slug).then((r) => {
      setItem(r.data?.item || null);
      setLoading(false);
      window.scrollTo(0, 0);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-10">
        <div className="h-12 w-64 shimmer rounded mb-6" />
        <div className="h-96 shimmer rounded-xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-20 text-center">
        <div className="font-display text-[120px] leading-none mb-4">404</div>
        <h1 className="text-[32px] font-extrabold mb-4">That item isn't indexed.</h1>
        <p className="text-[15px] text-[#6B6E66] mb-6">It might have been archived, or the slug might be wrong.</p>
        <Link to="/browse" className="font-mono text-[12px] uppercase tracking-wider text-[#F54E00] hover:underline">
          ← Back to browse
        </Link>
      </div>
    );
  }

  const cat = item.category_obj;
  const rating = item.stats.rating || 0;
  const score = item.stats.upvotes - item.stats.downvotes;

  // Rank within category
  const allInCat = ITEMS.filter((i) => i.category === item.category).sort((a, b) => b.stats.upvotes - a.stats.upvotes);
  const rank = allInCat.findIndex((i) => i.slug === item.slug) + 1;

  // Related items — same category, not this one
  const related = ITEMS
    .filter((i) => i.category === item.category && i.slug !== item.slug)
    .sort((a, b) => b.stats.upvotes - a.stats.upvotes)
    .slice(0, 3);

  function copyInstall() {
    navigator.clipboard.writeText(item.install_command);
    setInstallCopied(true);
    setTimeout(() => setInstallCopied(false), 1500);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">

      {/* ── Breadcrumb ── */}
      <div className="font-mono text-[11px] text-[#6B6E66] mb-6 flex items-center gap-2 flex-wrap">
        <button onClick={() => navigate(-1)} className="hover:text-[#F54E00]">← back</button>
        <span>/</span>
        <Link to="/browse" className="hover:text-[#F54E00]">browse</Link>
        <span>/</span>
        <Link to={`/c/${cat.slug}`} className="hover:text-[#F54E00]">{cat.short.toLowerCase()}</Link>
        <span>/</span>
        <span className="text-[#151515]">{item.slug}</span>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO: type badge, title, author, vote widget
         ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-8 mb-12">
        <div className="col-span-12 lg:col-span-8">

          <div className="flex items-center gap-3 mb-4">
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
              style={{ background: item.type === 'agent' ? '#CFE8FF' : '#FFF287', color: item.type === 'agent' ? '#1D4AFF' : '#151515' }}
            >
              {item.type}
            </span>
            <Link to={`/c/${cat.slug}`} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#6B6E66] hover:text-[#F54E00]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.hex }} />
              {cat.name}
            </Link>
            {item.is_hot && (
              <span className="font-mono text-[10px] font-bold text-[#F54E00] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F54E00]" /> HOT
              </span>
            )}
          </div>

          <h1 className="font-extrabold text-[clamp(36px,5vw,56px)] leading-[0.98] tracking-tight mb-4">
            {item.title}
          </h1>

          <p className="text-[17px] leading-relaxed text-[#2E2E2E] max-w-[60ch] mb-6">
            {item.short_description}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <VoteWidget upvotes={item.stats.upvotes} downvotes={item.stats.downvotes} orientation="horizontal" size="lg" />
            <div className="font-mono text-[12px] text-[#6B6E66]">·</div>
            <div className="flex items-center gap-2">
              <KarmaBadge karma={item.author.karma} />
              <span className="text-[14px] font-semibold text-[#1D4AFF]">@{item.author.username}</span>
              <span className="font-mono text-[11px] text-[#6B6E66]">({item.author.karma.toLocaleString()} karma)</span>
            </div>
            <div className="font-mono text-[12px] text-[#6B6E66]">·</div>
            <div className="font-mono text-[12px] text-[#6B6E66]">updated {item.updated_at} ago</div>
          </div>
        </div>

        {/* ── Right rail: install + stats ── */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Install card */}
          <div className="paper-card-static p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-2">Install via CLI</div>
            <div className="bg-[#151515] text-[#7DD3C0] font-mono text-[12px] px-3 py-2.5 rounded-md mb-3 break-all">
              {item.install_command}
            </div>
            <button
              onClick={copyInstall}
              className="w-full font-semibold text-[13px] px-4 py-2.5 rounded-md bg-[#F54E00] text-white border border-[#151515] shadow-[2px_2px_0_#151515] hover:shadow-[3px_3px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#151515] transition"
            >
              {installCopied ? '✓ Copied to clipboard' : 'Copy install command'}
            </button>
            <button className="w-full mt-2 font-semibold text-[13px] px-4 py-2.5 rounded-md bg-white border border-[#151515] hover:bg-[#EEEFE9] transition">
              ☆ Star
            </button>
          </div>

          {/* Stats card */}
          <div className="paper-card-static p-5">
            <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-dashed border-[#D0D1C9]">
              <Stat label="Score" value={formatCompact(score)} accent={score > 0 ? '#2EAD4A' : '#F54E00'} />
              <Stat label="Runs" value={formatCompact(item.stats.downloads)} />
              <Stat label={`Rank ${cat.short}`} value={`#${rank}`} />
            </div>
            <Sparkline data={item.history} color={cat.hex} label="Vote velocity · 60min" />
          </div>

          {/* Metadata card */}
          <div className="paper-card-static p-5 font-mono text-[12px]">
            <MetaRow k="version" v={item.version} />
            <MetaRow k="stars" v={item.github_stars?.toLocaleString()} />
            <MetaRow k="forks" v={item.github_forks?.toLocaleString()} />
            <MetaRow k="rating" v={`${rating.toFixed(2)} / 5  (${item.stats.rating_count})`} />
            <MetaRow k="license" v="MIT" />
            <MetaRow k="source" v={<a href={item.github_url} className="text-[#1D4AFF] hover:underline truncate">github ↗</a>} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TABS: overview / readme / discussion
         ═══════════════════════════════════════════════════════════ */}
      <div className="border-b border-[#D0D1C9] mb-6 flex gap-6">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'readme', label: 'README' },
          { id: 'discussion', label: `Discussion · ${Math.floor(item.stats.downloads / 150)}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-mono text-[12px] uppercase tracking-wider py-3 -mb-px border-b-2 transition-colors ${tab === t.id ? 'border-[#F54E00] text-[#F54E00]' : 'border-transparent text-[#6B6E66] hover:text-[#151515]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview item={item} />}
      {tab === 'readme' && <ReadmeTab readme={item.readme} />}
      {tab === 'discussion' && <DiscussionTab item={item} />}

      {/* ═══════════════════════════════════════════════════════════
          RELATED — other items in the same category
         ═══════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-[#D0D1C9]">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-1">also in {cat.short.toLowerCase()}</div>
              <h2 className="text-[24px] font-extrabold tracking-tight">Related work</h2>
            </div>
            <Link to={`/c/${cat.slug}`} className="font-mono text-[12px] uppercase tracking-wider text-[#F54E00] hover:underline">
              All {cat.name.toLowerCase()} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((r) => <ItemCard key={r.slug} item={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════

function Overview({ item }) {
  return (
    <div className="grid grid-cols-12 gap-8 mt-6">
      <div className="col-span-12 lg:col-span-8 space-y-6">

        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-3">What it does</h3>
          <p className="text-[15px] leading-relaxed text-[#2E2E2E]">
            {item.description}
          </p>
          <p className="text-[15px] leading-relaxed text-[#2E2E2E] mt-3">
            It's distributed under MIT, ships with a standard <code className="font-mono text-[13px] bg-[#FFF287] px-1.5 py-0.5 rounded">SKILL.md</code> manifest,
            and integrates with the Optimiser CLI out of the box. Most teams pick it up for a specific task and keep it running as part of their weekly rhythm.
          </p>
        </section>

        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-3">Compatibility</h3>
          <div className="flex flex-wrap gap-2">
            {['Claude Code', 'Claude Dispatch', 'Anthropic API', 'MCP'].map((c) => (
              <span key={c} className="font-mono text-[11px] px-2.5 py-1 border border-[#151515] rounded-full bg-white">
                {c}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-3">Recent runs</h3>
          <div className="paper-card-static divide-y divide-[#D0D1C9]">
            {[...Array(5)].map((_, i) => {
              const success = i !== 2;
              const time = ['2m', '8m', '14m', '22m', '31m'][i];
              return (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between font-mono text-[12px]">
                  <span className="text-[#6B6E66]">agent-{['7f4a','2c91','e83b','a1d4','99fe'][i]} · {time} ago</span>
                  <span className={success ? 'text-[#2EAD4A]' : 'text-[#F54E00]'}>
                    {success ? '▲ success' : '▼ failed'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="col-span-12 lg:col-span-4">
        <div className="paper-card-static bg-[#FFF287] p-5 border-[#151515]">
          <div className="font-mono text-[10px] uppercase tracking-wider mb-2">↗ why this matters</div>
          <p className="text-[14px] leading-relaxed font-medium">
            Unlike a GitHub star, every run here is a <span className="strike">vanity metric</span> <span className="hl-red">real signal</span>.
            When agents fail, it shows. When they succeed, they climb.
          </p>
        </div>
      </aside>
    </div>
  );
}

function ReadmeTab({ readme }) {
  // Simple markdown rendering — headings, paragraphs, code blocks, lists
  const lines = (readme || '').split('\n');
  const elements = [];
  let inCode = false;
  let codeBuffer = [];

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre key={i} className="font-mono text-[12px] bg-[#151515] text-[#7DD3C0] p-4 rounded-md overflow-x-auto my-3">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
      }
      inCode = !inCode;
      return;
    }
    if (inCode) {
      codeBuffer.push(line);
      return;
    }
    if (line.startsWith('# ')) elements.push(<h1 key={i} className="text-[28px] font-extrabold mt-6 mb-3 tracking-tight">{line.slice(2)}</h1>);
    else if (line.startsWith('## ')) elements.push(<h2 key={i} className="text-[20px] font-bold mt-5 mb-2 tracking-tight">{line.slice(3)}</h2>);
    else if (line.startsWith('- ')) elements.push(<li key={i} className="text-[14px] leading-relaxed ml-5 list-disc">{line.slice(2)}</li>);
    else if (line.trim()) {
      // inline code + bold handling
      const parsed = line
        .replace(/`([^`]+)`/g, '<code class="font-mono text-[13px] bg-[#FFF287] px-1 py-0.5 rounded">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
      elements.push(<p key={i} className="text-[14px] leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: parsed }} />);
    }
  });

  return (
    <article className="prose max-w-[720px] mt-6">
      {elements}
    </article>
  );
}

function DiscussionTab({ item }) {
  const commentCount = Math.floor(item.stats.downloads / 150);
  return (
    <div className="mt-6 max-w-[720px]">
      <div className="paper-card-static p-5 mb-6 bg-[#EEEFE9]">
        <div className="text-[13px] font-semibold mb-1">💬 {commentCount} comments on this {item.type}</div>
        <div className="text-[12px] text-[#6B6E66]">Sign in to join the discussion — or browse what others are saying.</div>
      </div>

      {/* Mock comments */}
      {[
        { user: 'tabletop', karma: 4200, time: '2d', body: "Been using this for 3 weeks in production at a B2B SaaS. Caught a 12% conversion drop on our pricing page before our analytics team even opened Looker that morning. Recommended." },
        { user: 'indie', karma: 890, time: '5d', body: "Installation was painless. Took about 4 minutes to get it wired into our Slack. One gotcha: make sure your GA4 property has enhanced measurement on or the signal is very noisy." },
        { user: 'nextlevel', karma: 12400, time: '1w', body: "Paired this with vercel-deploy and error-triager and now we basically have a self-running CRO ops team. The combo is the move." },
      ].map((c, i) => (
        <div key={i} className="border-l-2 border-[#D0D1C9] pl-5 pb-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <KarmaBadge karma={c.karma} />
            <span className="text-[13px] font-semibold text-[#1D4AFF]">@{c.user}</span>
            <span className="font-mono text-[11px] text-[#6B6E66]">· {c.time} ago</span>
          </div>
          <p className="text-[14px] leading-relaxed text-[#2E2E2E]">{c.body}</p>
          <div className="flex items-center gap-4 mt-3">
            <VoteWidget upvotes={Math.floor(Math.random() * 40) + 5} downvotes={0} orientation="horizontal" size="sm" />
            <button className="font-mono text-[11px] text-[#6B6E66] hover:text-[#F54E00]">reply</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ───

function Stat({ label, value, accent }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-[#6B6E66] mb-0.5">{label}</div>
      <div className="font-mono font-bold text-[16px] tabular-nums" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}

function MetaRow({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-dashed border-[#D0D1C9] last:border-b-0">
      <span className="text-[#6B6E66]">{k}</span>
      <span className="font-semibold truncate max-w-[55%]">{v}</span>
    </div>
  );
}

function formatCompact(n) {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

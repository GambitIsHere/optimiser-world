import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeatured, fetchStats } from '../api/client.js';
import { ITEMS } from '../lib/mockData.js';
import { CATEGORIES } from '../lib/categories.js';
import LivingSubstrate from '../components/hero/LivingSubstrate.jsx';
import ItemCard from '../components/marketplace/ItemCard.jsx';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchStats().then((r) => setStats(r.data));
    fetchFeatured().then((r) => setFeatured(r.data.items || []));
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          HERO — Living Substrate canvas with corner headline
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[calc(100vh-68px)] min-h-[640px] overflow-hidden">
        <LivingSubstrate items={ITEMS} />

        {/* Corner headline overlay (bottom-left, big) */}
        <div className="absolute left-6 lg:left-12 bottom-10 max-w-[640px] z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-white border border-[#151515] rounded-full shadow-[3px_3px_0_#151515] pointer-events-auto">
            <span className="live-dot"></span>
            <span className="font-mono text-[11px] uppercase tracking-wider">2,391 votes cast this hour</span>
          </div>

          <h1 className="text-[clamp(44px,6vw,84px)] leading-[0.94] tracking-[-0.035em] font-extrabold mb-6">
            <span className="block"><span className="strike">Humans</span> <span className="hl">agents</span></span>
            <span className="block">rank the skills</span>
            <span className="block">that actually <span className="font-display italic font-normal">work.</span></span>
          </h1>

          <p className="text-[17px] leading-relaxed text-[#2E2E2E] max-w-[50ch] mb-6">
            Every job an agent runs leaves a vote behind.
            <br />
            <b>Hot skills rise. Broken ones sink.</b> No gatekeepers. No curation committee.
          </p>

          <div className="flex gap-3 pointer-events-auto flex-wrap">
            <Link to="/browse" className="inline-flex items-center gap-2 font-semibold text-[14px] px-5 py-2.5 rounded-full bg-[#F54E00] text-white border border-[#151515] shadow-[3px_3px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_#151515] transition">
              Browse marketplace →
            </Link>
            <Link to="/search" className="inline-flex items-center gap-2 font-semibold text-[14px] px-5 py-2.5 rounded-full bg-white border border-[#151515] shadow-[3px_3px_0_#151515] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_#151515] transition">
              Search intelligence
            </Link>
          </div>
        </div>

        {/* Top-right corner annotation */}
        <div className="absolute right-6 lg:right-12 top-10 z-10 pointer-events-none max-w-xs text-right">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-2">
            ↗ what you're looking at
          </div>
          <p className="text-[13px] text-[#2E2E2E] leading-snug">
            A live map of the <span className="hl">{ITEMS.length * 194} skills</span> indexed so far.
            Size by vote count. Pulses are real agent runs.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS STRIP
         ═══════════════════════════════════════════════════════════ */}
      <section className="border-y border-[#151515] bg-[#151515] text-[#EEEFE9]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Stat label="Skills indexed" value={stats?.skills?.toLocaleString() || '—'} />
          <Stat label="Agents online" value={stats?.agents?.toLocaleString() || '—'} />
          <Stat label="Votes cast" value={stats?.total_votes?.toLocaleString() || '—'} accent />
          <Stat label="Contributors" value={stats?.contributors?.toLocaleString() || '—'} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — 4-column, asymmetric
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 lg:col-span-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-3">§ 01 · how it works</div>
            <h2 className="text-[44px] leading-[0.95] tracking-tight font-extrabold mb-4">
              A marketplace that <span className="font-display italic font-normal">watches</span> itself work.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
            <p className="text-[17px] text-[#2E2E2E] leading-relaxed">
              Four steps. No juries. No editors picking favourites. The system is the signal —
              and the signal is <span className="hl">every single run every single agent performs</span>, everywhere.
            </p>
          </div>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <li key={i} className="paper-card-static p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-[52px] leading-none font-normal">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66]">{step.tag}</span>
              </div>
              <h3 className="text-[22px] font-extrabold tracking-tight mb-2">{step.title}</h3>
              <p className="text-[13px] text-[#2E2E2E] leading-relaxed flex-1">{step.description}</p>
              <div className="mt-4 pt-3 border-t border-dashed border-[#D0D1C9] font-mono text-[11px] text-[#6B6E66]">
                {step.detail}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED — top 3 cards this week, big
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24 border-t border-[#D0D1C9]">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-3">§ 02 · featured this week</div>
            <h2 className="text-[44px] leading-[0.95] tracking-tight font-extrabold">
              Three that are <span className="hl">rising fastest</span> right now.
            </h2>
          </div>
          <Link to="/trending" className="font-mono text-[12px] uppercase tracking-wider text-[#F54E00] hover:underline shrink-0">
            See all trending →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.slice(0, 3).map((item) => (
            <ItemCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORIES — magazine-style grid with descriptions
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24 border-t border-[#D0D1C9]">
        <div className="mb-12">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-3">§ 03 · browse by category</div>
          <h2 className="text-[44px] leading-[0.95] tracking-tight font-extrabold max-w-[18ch]">
            Seven categories. One <span className="font-display italic font-normal">ranking algorithm</span>.
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-0 border border-[#151515] rounded-xl overflow-hidden bg-white shadow-[6px_6px_0_#151515]">
          {CATEGORIES.map((cat, i) => {
            const count = ITEMS.filter((it) => it.category === cat.slug).length;
            const colSpan = i === 0 ? 'md:col-span-6' : i === 1 || i === 4 ? 'md:col-span-4' : i === 3 ? 'md:col-span-3' : 'md:col-span-3';
            return (
              <Link
                key={cat.slug}
                to={`/c/${cat.slug}`}
                className={`col-span-12 ${colSpan} p-6 border-b md:border-r border-[#151515] last:border-r-0 group hover:bg-[#EEEFE9] transition-colors`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.hex }} />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66]">{count} items</span>
                </div>
                <h3 className="text-[24px] font-extrabold tracking-tight mb-2 group-hover:text-[#F54E00] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[13px] text-[#6B6E66] leading-relaxed">{cat.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          RHETORIC — "not X, but Y"
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24 border-t border-[#D0D1C9]">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-3">§ 04 · what we're not</div>
            <h2 className="text-[44px] leading-[0.95] tracking-tight font-extrabold mb-6">
              <span className="strike">Not another</span>
              <br />
              <span className="font-display italic font-normal">marketplace.</span>
            </h2>
            <p className="text-[17px] text-[#2E2E2E] leading-relaxed">
              The internet is full of curated lists, awesome-repos, editor's picks, and "best of 2026"
              ranked by someone who ran each tool once. <span className="hl">We don't do that.</span>
            </p>
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7 space-y-4">
            {CONTRASTS.map((c, i) => (
              <div key={i} className="paper-card-static p-5 flex gap-5">
                <div className="flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#6B6E66] mb-1.5">Not this</div>
                  <div className="text-[15px] text-[#6B6E66] line-through decoration-[#F54E00] decoration-2">
                    {c.no}
                  </div>
                </div>
                <div className="w-px bg-[#D0D1C9]" />
                <div className="flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#F54E00] mb-1.5">But this</div>
                  <div className="text-[15px] font-semibold">{c.yes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CLI SHOWCASE
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24 border-t border-[#D0D1C9]">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#6B6E66] mb-3">§ 05 · the cli</div>
            <h2 className="text-[44px] leading-[0.95] tracking-tight font-extrabold mb-6">
              Install anything in <span className="hl">one command.</span>
            </h2>
            <p className="text-[17px] text-[#2E2E2E] leading-relaxed mb-6">
              The <code className="font-mono text-[15px] bg-[#FFF287] px-1.5 py-0.5 rounded">optimiser</code> CLI
              speaks directly to the marketplace. Search semantically, install skills into your Claude Code project,
              and report back what worked.
            </p>
            <pre className="font-mono text-[13px] bg-[#151515] text-[#7DD3C0] p-4 rounded-lg leading-relaxed overflow-x-auto">
{`$ npm install -g optimiser-cli
$ optimiser login
$ optimiser search "conversion rate optimisation"`}
            </pre>
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <div className="paper-card-static p-0 overflow-hidden">
              {/* Terminal header */}
              <div className="bg-[#E3E4DD] border-b border-[#D0D1C9] px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F54E00]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F7B200]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2EAD4A]" />
                </div>
                <div className="flex-1 text-center font-mono text-[11px] text-[#6B6E66]">
                  ~/projects/sanjow — optimiser
                </div>
              </div>
              {/* Terminal body */}
              <div className="bg-[#151515] text-[#E3E4DD] p-5 font-mono text-[12px] leading-relaxed min-h-[280px]">
                <div><span className="text-[#7DD3C0]">$</span> <span className="text-white">optimiser search "cro agent"</span></div>
                <div className="text-[#6B6E66] mt-2">● Searching intelligence...</div>
                <div className="mt-3">
                  <div>  <span className="text-[#C79EF5]">[agent]</span> <span className="font-bold text-white">ga4-watchdog</span> <span className="text-[#6B6E66]">987▲</span></div>
                  <div className="text-[#6B6E66] pl-4">Monitors GA4 conversion anomalies...</div>
                  <div className="text-[#6B6E66] pl-4">by @srikant · cro &amp; growth</div>
                </div>
                <div className="mt-3">
                  <div>  <span className="text-[#7DD3C0]">[skill]</span> <span className="font-bold text-white">optimiser-pro</span> <span className="text-[#6B6E66]">1.2k▲</span></div>
                  <div className="text-[#6B6E66] pl-4">Design-system scaffold skill...</div>
                  <div className="text-[#6B6E66] pl-4">by @srikant · design &amp; ui</div>
                </div>
                <div className="mt-4"><span className="text-[#7DD3C0]">$</span> <span className="text-white">optimiser install ga4-watchdog</span></div>
                <div className="text-[#2EAD4A] mt-1">✓ agent installed to .claude/agents/ga4-watchdog</div>
                <div className="mt-3"><span className="text-[#7DD3C0]">$</span> <span className="inline-block w-2 h-4 bg-white animate-pulse align-middle" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — big closing
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-24 pb-8">
        <div className="paper-card-static bg-[#151515] text-[#EEEFE9] p-12 lg:p-20 text-center relative overflow-hidden">
          <div className="absolute top-6 left-6 font-mono text-[10px] uppercase tracking-wider text-[#6B6E66]">/ join the index</div>
          <div className="absolute top-6 right-6 font-mono text-[10px] uppercase tracking-wider text-[#6B6E66]">optimiser.world/submit</div>

          <h2 className="text-[clamp(48px,6vw,88px)] leading-[0.95] tracking-[-0.035em] font-extrabold mb-6">
            Built something <br />
            <span className="font-display italic font-normal text-[#F54E00]">actually useful?</span>
          </h2>
          <p className="text-[18px] max-w-[54ch] mx-auto mb-8 text-[#D0D1C9]">
            Submit your skill or agent. Agents start using it the moment it's indexed.
            If it works, it rises. If it doesn't — you'll know by tomorrow.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="font-semibold text-[15px] px-6 py-3 rounded-full bg-[#F54E00] text-white border border-white shadow-[3px_3px_0_#EEEFE9] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_#EEEFE9] transition">
              + Submit a skill
            </button>
            <a href="https://docs.optimiser.world" className="font-semibold text-[15px] px-6 py-3 rounded-full bg-transparent text-white border border-white hover:bg-white hover:text-[#151515] transition">
              Read the docs
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Data ───
const STEPS = [
  { tag: 'submit', title: 'Someone ships a skill', description: 'A developer publishes a skill or agent to the registry. It appears in the feed the same minute.', detail: '→ indexed in <60s' },
  { tag: 'discover', title: 'Agents find it', description: 'Other agents browsing the feed discover it via semantic search or category feed. No middlemen.', detail: '→ ~800ms semantic lookup' },
  { tag: 'run', title: 'It does real work', description: 'An agent pulls the skill into its workflow and runs a real job. Success or failure gets reported.', detail: '→ usage telemetry' },
  { tag: 'rank', title: 'Rankings shift', description: 'Hot score recomputes every few seconds. Good skills climb, broken ones fall. The grid self-organises.', detail: '→ Reddit-style decay' },
];

const CONTRASTS = [
  { no: 'A human editor ranks the best 10 agents by vibes and shipped newsletter', yes: 'Agent runs produce votes. Votes produce ranks. Algorithm, not taste.' },
  { no: 'Stars on GitHub from the repo going viral on Hacker News in 2024', yes: 'Live job-outcome signals — working today, not working nine months ago.' },
  { no: 'A paid placement at the top of the category for the next 90 days', yes: 'Zero paid slots. Zero featured-for-a-fee. The feed is unsellable.' },
];

function Stat({ label, value, accent }) {
  return (
    <div>
      <div className={`font-mono text-[10px] uppercase tracking-wider ${accent ? 'text-[#F54E00]' : 'text-[#6B6E66]'} mb-1.5`}>{label}</div>
      <div className={`font-extrabold text-[34px] tracking-tight tabular-nums ${accent ? 'text-[#F54E00]' : 'text-white'}`}>{value}</div>
    </div>
  );
}

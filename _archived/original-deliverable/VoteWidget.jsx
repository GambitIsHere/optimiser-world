import { useState, useRef } from 'react';

// Vote widget — the single most-used interactive element on the site.
// Variants:
//   size: 'sm' (in cards) | 'md' (default) | 'lg' (on item detail hero)
//   orientation: 'vertical' (default) | 'horizontal'
//
// Behaviour: optimistic — updates local state immediately, reconciles on API success.
// Keyboard: up/down arrow keys when focused.
// Accessibility: each arrow is a real <button> with aria-labels.

export default function VoteWidget({ upvotes = 0, downvotes = 0, size = 'md', orientation = 'vertical', onChange }) {
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null
  const [local, setLocal] = useState({ up: upvotes, down: downvotes });
  const popRef = useRef(null);

  const score = local.up - local.down;

  function vote(direction, e) {
    let nextVote = direction;
    const delta = { up: 0, down: 0 };

    if (userVote === direction) {
      // Remove vote
      nextVote = null;
      delta[direction] = -1;
    } else if (userVote && userVote !== direction) {
      // Switch vote
      delta[userVote] = -1;
      delta[direction] = +1;
    } else {
      // New vote
      delta[direction] = +1;
    }

    setUserVote(nextVote);
    setLocal((l) => ({ up: Math.max(0, l.up + delta.up), down: Math.max(0, l.down + delta.down) }));

    // Animated pop
    if (e) emitPop(e.currentTarget, direction);

    if (onChange) onChange({ direction: nextVote, delta });
  }

  const sizeConfig = {
    sm: { arrow: 16, num: 'text-[11px]', pad: 'p-1', gap: 'gap-0.5' },
    md: { arrow: 20, num: 'text-[13px]', pad: 'p-1.5', gap: 'gap-1' },
    lg: { arrow: 28, num: 'text-[18px]', pad: 'p-2', gap: 'gap-1.5' },
  }[size];

  const layout = orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col items-center';

  return (
    <div ref={popRef} className={`inline-flex ${layout} ${sizeConfig.gap} select-none relative`}>
      <button
        aria-label="Upvote"
        aria-pressed={userVote === 'up'}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); vote('up', e); }}
        onKeyDown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); vote('up', e); } }}
        className={`${sizeConfig.pad} rounded transition-colors hover:bg-[#2EAD4A]/15 ${userVote === 'up' ? 'text-[#2EAD4A]' : 'text-[#6B6E66]'}`}
      >
        <Triangle size={sizeConfig.arrow} direction="up" filled={userVote === 'up'} />
      </button>

      <span className={`font-mono font-bold ${sizeConfig.num} ${score > 0 ? 'text-[#2EAD4A]' : score < 0 ? 'text-[#F54E00]' : 'text-[#6B6E66]'} tabular-nums min-w-[2ch] text-center`}>
        {formatScore(score)}
      </span>

      <button
        aria-label="Downvote"
        aria-pressed={userVote === 'down'}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); vote('down', e); }}
        onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); vote('down', e); } }}
        className={`${sizeConfig.pad} rounded transition-colors hover:bg-[#F54E00]/15 ${userVote === 'down' ? 'text-[#F54E00]' : 'text-[#6B6E66]'}`}
      >
        <Triangle size={sizeConfig.arrow} direction="down" filled={userVote === 'down'} />
      </button>
    </div>
  );
}

function Triangle({ size, direction, filled }) {
  const isUp = direction === 'up';
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="block">
      <path
        d={isUp ? 'M10 4 L17 15 L3 15 Z' : 'M10 16 L17 5 L3 5 Z'}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatScore(n) {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function emitPop(el, direction) {
  const rect = el.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.textContent = direction === 'up' ? '▲ +1' : '▼ -1';
  pop.style.cssText = `
    position: fixed;
    left: ${rect.left + rect.width / 2}px;
    top: ${rect.top}px;
    z-index: 100;
    pointer-events: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 800;
    color: ${direction === 'up' ? '#2EAD4A' : '#F54E00'};
    animation: vote-pop 900ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
  `;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
}

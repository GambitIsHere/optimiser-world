import { useEffect, useRef } from 'react';
import { getCategoryByIndex } from '../../lib/categories.js';

// Living Substrate — React port of the A2 canvas hero.
// Simplified from A2: no click-lock overlay, no expand modal, no keyboard nav —
// those belong in the /browse app surface, not on a marketing hero.
// Kept: recursive BSP grid, cursor parallax + brightness field, z-layers,
// signal pulses between hot cells, rank mutation swaps, and cursor-attracted signals.
//
// Props:
//   items: array of marketplace items (skill/agent records)
//   intensity: 'full' (default) | 'ambient' (dimmed, for background on other pages)

export default function LivingSubstrate({ items = [], intensity = 'full' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const state = {
      W: 0, H: 0,
      cells: [],
      signals: [],
      mouse: { x: -1000, y: -1000 },
      smooth: { x: -1000, y: -1000 },
      tick: 0,
      paused: false,
    };
    stateRef.current = state;

    const ambient = intensity === 'ambient';

    // ─── RNG ───
    function rng(seed) {
      let a = seed | 0;
      return () => {
        a = (a + 0x6D2B79F5) | 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    // ─── Layout ───
    function layout() {
      const r = rng(4242);
      state.cells = [];
      state.signals = [];
      const partitions = [];

      const PHI_INV = 0.618;
      const recurse = (x, y, w, h, d) => {
        if (d >= 6 || w < 150 || h < 120 || (d >= 3 && r() < 0.18)) {
          partitions.push({ x, y, w, h, depth: d });
          return;
        }
        const splitVert = w >= h;
        const ratio = r() < 0.5 ? PHI_INV : (1 - PHI_INV);
        const rr = ratio * 0.75 + (0.3 + r() * 0.4) * 0.25;
        if (splitVert) {
          recurse(x, y, w * rr, h, d + 1);
          recurse(x + w * rr, y, w * (1 - rr), h, d + 1);
        } else {
          recurse(x, y, w, h * rr, d + 1);
          recurse(x, y + h * rr, w, h * (1 - rr), d + 1);
        }
      };
      recurse(0, 0, state.W, state.H, 0);

      partitions.sort((a, b) => b.w * b.h - a.w * a.h);
      const sorted = [...items].sort((a, b) => b.stats.upvotes - a.stats.upvotes);

      partitions.forEach((p, i) => {
        const item = sorted[i % Math.max(1, sorted.length)];
        if (!item) return;
        const cat = item.category_obj || getCategoryByIndex(0);
        const isHot = item.stats.upvotes > 400;

        let zLayer = 1;
        const q = i / partitions.length;
        if (q < 0.3) zLayer = 2;
        else if (q > 0.75) zLayer = 0;

        state.cells.push({
          bx: p.x, by: p.y, bw: p.w, bh: p.h,
          x: p.x, y: p.y, w: p.w, h: p.h,
          cx: p.x + p.w / 2, cy: p.y + p.h / 2,
          depth: p.depth,
          zLayer,
          item,
          cat,
          isHot,
          phase: r() * Math.PI * 2,
          breathRate: 0.003 + r() * 0.008,
          brightness: 0,
          offsetX: 0,
          offsetY: 0,
          voteFlash: 0,
          localVotes: item.stats.upvotes,
        });
      });

      // Seed signals
      for (let i = 0; i < state.cells.length * 0.3; i++) spawnSignal();
    }

    function spawnSignal() {
      const hotCells = state.cells.filter((c) => c.isHot);
      const src = hotCells.length && Math.random() < 0.7
        ? hotCells[Math.floor(Math.random() * hotCells.length)]
        : state.cells[Math.floor(Math.random() * state.cells.length)];
      if (!src) return;
      let best = null, bestD = Infinity;
      for (let j = 0; j < 15; j++) {
        const cand = state.cells[Math.floor(Math.random() * state.cells.length)];
        if (!cand || cand === src) continue;
        const dx = cand.cx - src.cx, dy = cand.cy - src.cy;
        const d = dx * dx + dy * dy;
        if (d < bestD && d > 10000) { bestD = d; best = cand; }
      }
      if (!best) return;
      state.signals.push({
        from: src, to: best,
        t: Math.random(),
        speed: 0.004 + Math.random() * 0.008,
        isUpvote: Math.random() < 0.85,
        cursorAttracted: false,
      });
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      state.W = rect.width;
      state.H = rect.height;
      canvas.width = state.W * dpr;
      canvas.height = state.H * dpr;
      canvas.style.width = state.W + 'px';
      canvas.style.height = state.H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }

    function onMove(e) {
      const rect = container.getBoundingClientRect();
      state.mouse.x = e.clientX - rect.left;
      state.mouse.y = e.clientY - rect.top;
    }

    function onLeave() {
      state.mouse.x = -1000;
      state.mouse.y = -1000;
    }

    // ─── Draw ───
    function roundRect(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function draw() {
      state.tick++;
      ctx.fillStyle = '#EEEFE9';
      ctx.fillRect(0, 0, state.W, state.H);

      // Dot grid
      ctx.fillStyle = 'rgba(208,209,201,0.6)';
      const step = 28;
      for (let x = step / 2; x < state.W; x += step) {
        for (let y = step / 2; y < state.H; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      state.smooth.x += (state.mouse.x - state.smooth.x) * 0.18;
      state.smooth.y += (state.mouse.y - state.smooth.y) * 0.18;

      const sorted = [...state.cells].sort((a, b) => a.zLayer - b.zLayer);

      for (const c of sorted) {
        c.phase += c.breathRate;
        const breath = (Math.sin(c.phase) + 1) / 2;

        const lerpK = 0.06;
        c.x += (c.bx - c.x) * lerpK;
        c.y += (c.by - c.y) * lerpK;
        c.w += (c.bw - c.w) * lerpK;
        c.h += (c.bh - c.h) * lerpK;
        c.cx = c.x + c.w / 2;
        c.cy = c.y + c.h / 2;

        const dx = state.mouse.x - c.cx;
        const dy = state.mouse.y - c.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 260);
        c.brightness += (proximity - c.brightness) * 0.1;

        const pFactor = 0.35 + c.zLayer * 0.35;
        const targetOffX = ((state.mouse.x - state.W / 2) / state.W) * -16 * pFactor;
        const targetOffY = ((state.mouse.y - state.H / 2) / state.H) * -16 * pFactor;
        c.offsetX += (targetOffX - c.offsetX) * 0.08;
        c.offsetY += (targetOffY - c.offsetY) * 0.08;
        c.voteFlash *= 0.93;

        const [r, g, b] = c.cat.rgb;
        const isNeutral = c.cat.slug === 'meta';

        const layerAlpha = ambient ? 0.35 : ([0.55, 0.85, 1][c.zLayer]);

        const pad = 3;
        const x = c.x + pad + c.offsetX;
        const y = c.y + pad + c.offsetY;
        const w = c.w - pad * 2;
        const h = c.h - pad * 2;

        let fillAlpha, strokeAlpha, strokeWidth;
        if (isNeutral) {
          fillAlpha = (0.015 + breath * 0.012 + c.brightness * 0.04) * layerAlpha;
          strokeAlpha = (0.22 + c.depth * 0.04 + breath * 0.08 + c.brightness * 0.35 + c.voteFlash * 0.4) * layerAlpha;
          strokeWidth = 0.8;
          ctx.fillStyle = `rgba(107,110,102,${fillAlpha})`;
          ctx.strokeStyle = `rgba(21,21,21,${strokeAlpha})`;
        } else {
          fillAlpha = (c.isHot
            ? 0.06 + breath * 0.04 + c.brightness * 0.12 + c.voteFlash * 0.15
            : 0.035 + breath * 0.025 + c.brightness * 0.09) * layerAlpha;
          strokeAlpha = (c.isHot ? (0.78 + c.brightness * 0.22 + c.voteFlash * 0.3) : 0.48 + c.brightness * 0.35) * layerAlpha;
          strokeWidth = c.isHot ? 1.4 : 1.0;
          ctx.fillStyle = `rgba(${r},${g},${b},${fillAlpha})`;
          ctx.strokeStyle = `rgba(${r},${g},${b},${strokeAlpha})`;
        }
        ctx.lineWidth = strokeWidth;
        roundRect(x, y, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // Content
        if (!ambient && w >= 150 && h >= 72) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, layerAlpha + 0.2);

          ctx.fillStyle = 'rgba(21,21,21,0.9)';
          ctx.font = '600 13px Inter, sans-serif';
          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';
          ctx.fillText(c.item.title, x + 12, y + 12);

          ctx.font = '600 9px "JetBrains Mono", monospace';
          ctx.fillStyle = c.item.type === 'skill' ? 'rgba(21,21,21,0.55)' : 'rgba(29,74,255,0.85)';
          ctx.fillText(c.item.type.toUpperCase(), x + 12, y + 30);

          if (w >= 170) {
            ctx.fillStyle = isNeutral
              ? `rgba(46,173,74,${0.82 + c.brightness * 0.18})`
              : `rgba(${r},${g},${b},${0.88 + c.brightness * 0.12})`;
            ctx.font = '700 11px "JetBrains Mono", monospace';
            ctx.fillText('▲ ' + c.localVotes.toLocaleString(), x + 12, y + h - 22);
          }

          if (w >= 210 && h >= 84) {
            ctx.fillStyle = 'rgba(107,110,102,0.9)';
            ctx.font = '500 10px "JetBrains Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText('@' + c.item.author.username, x + w - 12, y + 12);
            if (c.isHot) {
              ctx.fillStyle = 'rgba(245,78,0,0.95)';
              ctx.font = '700 9px "JetBrains Mono", monospace';
              ctx.fillText('● HOT', x + w - 12, y + 28);
            }
            ctx.textAlign = 'left';
          }
          ctx.restore();
        }

        if (c.voteFlash > 0.05) {
          ctx.fillStyle = `rgba(46,173,74,${c.voteFlash * 0.2 * layerAlpha})`;
          roundRect(x, y, w, h, 6);
          ctx.fill();
        }
      }

      // Signals
      for (let i = state.signals.length - 1; i >= 0; i--) {
        const s = state.signals[i];
        s.t += s.speed;

        if (!s.cursorAttracted && !ambient && Math.random() < 0.0015 && state.mouse.x > 0) {
          s.cursorAttracted = true;
        }

        if (s.t > 1) {
          s.t -= 1;
          s.to.voteFlash = Math.min(1.2, (s.to.voteFlash || 0) + 0.35);
          s.cursorAttracted = false;
        }

        const ax = s.from.cx + (s.from.offsetX || 0);
        const ay = s.from.cy + (s.from.offsetY || 0);
        const bx = s.to.cx + (s.to.offsetX || 0);
        const by = s.to.cy + (s.to.offsetY || 0);

        let px, py;
        if (s.cursorAttracted && state.mouse.x > 0) {
          const t = s.t;
          const cx = state.mouse.x, cy = state.mouse.y;
          px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx;
          py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by;
        } else {
          const totalDx = Math.abs(bx - ax);
          const totalDy = Math.abs(by - ay);
          const totalLen = totalDx + totalDy;
          if (totalLen < 1) continue;
          const pulseLen = s.t * totalLen;
          if (pulseLen <= totalDx) {
            px = ax + Math.sign(bx - ax) * pulseLen;
            py = ay;
          } else {
            px = bx;
            py = ay + Math.sign(by - ay) * (pulseLen - totalDx);
          }
        }

        const col = s.isUpvote ? [46, 173, 74] : [245, 78, 0];
        const alpha = ambient ? 0.4 : 1;
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.2 * alpha})`;
        ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.95 * alpha})`;
        ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.85 * alpha})`;
        ctx.beginPath(); ctx.arc(px, py, 1.1, 0, Math.PI * 2); ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    // Background vote simulation
    const voteTimer = setInterval(() => {
      if (!state.cells.length) return;
      const hot = state.cells.filter((c) => c.isHot);
      const pick = Math.random() < 0.7 && hot.length
        ? hot[Math.floor(Math.random() * hot.length)]
        : state.cells[Math.floor(Math.random() * state.cells.length)];
      if (Math.random() < 0.85) pick.localVotes++;
      pick.voteFlash = 0.8;
    }, 1800);

    // Rank swap
    const swapTimer = setInterval(() => {
      if (state.cells.length < 2) return;
      const candidates = state.cells.filter((c) => c.localVotes > 50 && c.localVotes < 400 && !c.isHot);
      if (!candidates.length) return;
      const rising = candidates[Math.floor(Math.random() * candidates.length)];
      let target = null, bestD = Infinity;
      for (const cell of state.cells) {
        if (cell === rising) continue;
        const aRatio = (cell.bw * cell.bh) / (rising.bw * rising.bh);
        if (aRatio < 0.7 || aRatio > 2.5) continue;
        const dx = cell.cx - rising.cx, dy = cell.cy - rising.cy;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; target = cell; }
      }
      if (!target) return;
      const tmp = { bx: rising.bx, by: rising.by, bw: rising.bw, bh: rising.bh };
      rising.bx = target.bx; rising.by = target.by; rising.bw = target.bw; rising.bh = target.bh;
      target.bx = tmp.bx; target.by = tmp.by; target.bw = tmp.bw; target.bh = tmp.bh;
      rising.localVotes += Math.floor(20 + Math.random() * 40);
      rising.voteFlash = 1.2;
    }, 12000);

    resize();
    window.addEventListener('resize', resize);
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(voteTimer);
      clearInterval(swapTimer);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, intensity]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}

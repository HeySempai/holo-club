"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

export type RevealCard = { name: string; rarity: string | null; image_url: string | null; is_hit: boolean; number?: string };

type Phase = "sealed" | "tearing" | "reveal" | "summary";

/**
 * Pack opening sequence: tilt the sealed pack, drag across the top to tear it,
 * then flip cards one by one (hits last, like a real pack) and finish on a summary.
 */
export default function PackReveal({
  cards,
  label = "BOOSTER · 10 CARTAS",
  footer,
  onDone,
  autoOpen = false,
}: {
  cards: RevealCard[];
  label?: string;
  footer?: ReactNode;
  onDone?: () => void;
  autoOpen?: boolean;
}) {
  const ordered = [...cards].sort((a, b) => Number(a.is_hit) - Number(b.is_hit));
  const [phase, setPhase] = useState<Phase>("sealed");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [tear, setTear] = useState(0);
  const drag = useRef<{ x: number; w: number } | null>(null);
  const hits = ordered.filter((c) => c.is_hit).length;

  useEffect(() => {
    if (autoOpen) open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function open() {
    setPhase("tearing");
    setTimeout(() => setPhase("reveal"), 900);
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (phase !== "sealed") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ ry: Math.round((x - 0.5) * 30), rx: Math.round((0.5 - y) * 24), mx: Math.round(x * 100), my: Math.round(y * 100) });
    if (drag.current) {
      const p = Math.min(Math.max((e.clientX - drag.current.x) / drag.current.w, 0), 1);
      setTear(p);
      if (p > 0.6) {
        drag.current = null;
        setTear(1);
        open();
      }
    }
  }

  function next() {
    if (!flipped) return setFlipped(true);
    if (idx + 1 >= ordered.length) {
      setPhase("summary");
      onDone?.();
      return;
    }
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  if (phase === "summary") {
    return (
      <div className="flex w-full flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-display text-2xl font-bold">
            {hits ? <span className="text-gold">{hits === 1 ? "¡Un hit!" : `¡${hits} hits!`}</span> : "Sobre abierto"}
          </span>
          <button type="button" onClick={() => { setPhase("sealed"); setIdx(0); setFlipped(false); setTear(0); }} className="cursor-pointer text-sm text-cyan underline">
            Repetir apertura
          </button>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-3 p-0">
          {ordered.map((c, i) => (
            <li key={i} className="flex flex-col gap-1.5" style={{ animation: `rise .45s ${i * 0.05}s both` }}>
              <Face card={c} small />
              <span className="truncate text-xs text-mist">{c.name}</span>
            </li>
          ))}
        </ul>
        {footer}
      </div>
    );
  }

  if (phase === "reveal") {
    const c = ordered[idx];
    const nextIsHit = !flipped && c.is_hit;
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex w-full max-w-[420px] items-center justify-between text-sm text-dim">
          <span>
            Carta <strong className="text-white">{idx + 1}</strong> de {ordered.length}
          </span>
          <button type="button" onClick={() => { setPhase("summary"); onDone?.(); }} className="cursor-pointer text-cyan underline">
            Ver todas
          </button>
        </div>
        <button
          type="button"
          onClick={next}
          aria-label={flipped ? "Siguiente carta" : "Voltear carta"}
          className="stage relative h-[392px] w-[280px] cursor-pointer border-0 bg-transparent p-0"
        >
          {/* remaining stack */}
          {ordered.slice(idx + 1, idx + 4).map((_, j) => (
            <span key={j} className="absolute inset-0 rounded-2xl border border-[#34345c] bg-[#15152c]" style={{ transform: `translate(${(j + 1) * 5}px, ${(j + 1) * 5}px)`, zIndex: -j }} aria-hidden="true" />
          ))}
          <span key={idx} className={`flip absolute inset-0 ${flipped ? "flipped" : ""} ${nextIsHit ? "charge" : ""}`} style={{ animation: "deal .35s ease-out" }}>
            <span className="flip-face flip-back absolute inset-0"><Back /></span>
            <span className="flip-face flip-front absolute inset-0"><Face card={c} /></span>
          </span>
          {flipped && c.is_hit && <span className="burst pointer-events-none absolute -inset-16" aria-hidden="true" />}
        </button>
        <div className="flex min-h-[52px] flex-col items-center gap-1 text-center" aria-live="polite">
          {flipped ? (
            <>
              <span className={`font-display text-xl font-bold ${c.is_hit ? "text-gold" : ""}`}>{c.is_hit && "★ "}{c.name}</span>
              <span className="text-sm text-dim">{c.rarity ?? "—"}{c.number && ` · #${c.number}`}</span>
            </>
          ) : (
            <span className="text-sm text-dim">{nextIsHit ? "Algo brilla…" : "Toca para voltear"}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        className="stage relative flex h-[440px] w-full max-w-[520px] touch-none select-none items-center justify-center"
        onPointerMove={onMove}
        onPointerUp={() => { drag.current = null; if (phase === "sealed") setTear(0); }}
        onPointerLeave={() => { drag.current = null; setTilt({ rx: 0, ry: 0, mx: 50, my: 50 }); if (phase === "sealed") setTear(0); }}
      >
        <div className={`pack relative h-[360px] w-[236px] ${phase === "tearing" ? "torn" : ""}`} style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}>
          <div className="float relative h-full w-full">
            <div
              className="crimp foil absolute inset-x-0 top-0 z-10 h-9 cursor-grab rounded-t-2xl rounded-b-sm active:cursor-grabbing"
              style={{ clipPath: `inset(0 0 0 ${tear * 100}%)` }}
              onPointerDown={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                drag.current = { x: e.clientX, w: r.width };
                e.currentTarget.parentElement?.parentElement?.parentElement?.setPointerCapture(e.pointerId);
              }}
            />
            <span className="pointer-events-none absolute inset-x-3 top-[38px] z-10 border-t-2 border-dashed border-white/30" aria-hidden="true" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-[#34345c] bg-gradient-to-b from-[#1c1c3a] to-[#0f0f22] shadow-[0_30px_80px_rgba(0,0,0,.6),0_0_60px_rgba(255,79,216,.18)]">
              <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,.28), transparent 42%)` }} />
              <Star size={104} />
              <span className="font-display text-[26px] font-bold tracking-tight">HOLO CLUB</span>
              <span className="text-xs tracking-[3px] text-[#a6a6c0]">{label}</span>
            </div>
            <div className="foil absolute inset-x-0 bottom-0 h-5 rounded-t-sm rounded-b-2xl" />
          </div>
        </div>
        {phase === "sealed" && (
          <span className="hint pointer-events-none absolute top-[44px] left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-xs text-white">
            Desliza la tira para abrir →
          </span>
        )}
      </div>
      <button type="button" onClick={open} disabled={phase !== "sealed"} className="btn min-h-11 cursor-pointer rounded-full border border-cyan px-6 py-3 font-semibold text-[#9ef4ff]">
        Abrir sobre
      </button>
    </div>
  );
}

function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" aria-hidden="true">
      <defs>
        <linearGradient id="hcstar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF4FD8" />
          <stop offset=".5" stopColor="#3DE8FF" />
          <stop offset="1" stopColor="#FFD84F" />
        </linearGradient>
      </defs>
      <path d="M55 6 L66 42 L104 42 L73 64 L85 102 L55 79 L25 102 L37 64 L6 42 L44 42 Z" fill="none" stroke="url(#hcstar)" strokeWidth="5" strokeLinejoin="round" />
    </svg>
  );
}

function Back() {
  return (
    <span className="flex h-full w-full items-center justify-center rounded-2xl border-[6px] border-[#1d1d3a] bg-[radial-gradient(circle_at_50%_40%,#2a2a5a,#0f0f22)] shadow-[0_20px_50px_rgba(0,0,0,.5)]">
      <Star size={88} />
    </span>
  );
}

export function Face({ card, small = false }: { card: RevealCard; small?: boolean }) {
  return (
    <span className={`relative block aspect-[63/88] w-full overflow-hidden ${small ? "rounded-lg" : "h-full rounded-2xl"} ${card.is_hit ? "hit" : "border border-[#3a3a5c]"} bg-card`}>
      {card.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image_url} alt={card.name} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <span className="absolute inset-0 flex flex-col justify-between p-[8%]">
          <span className={`absolute inset-[5%] rounded-lg ${card.is_hit ? "foil" : "bg-gradient-to-br from-[#22224a] to-[#14142a]"}`} style={{ opacity: card.is_hit ? 0.9 : 1 }} />
          <span className={`relative self-start rounded-full bg-ink px-2 py-0.5 ${small ? "text-[10px]" : "text-xs"} font-semibold ${card.is_hit ? "text-gold" : "text-mist"}`}>
            {card.rarity ?? "Carta"}
          </span>
          <span className={`relative rounded-md bg-ink/70 px-2 py-1 font-display ${small ? "text-xs" : "text-lg"} font-semibold leading-tight`}>{card.name}</span>
        </span>
      )}
      {card.is_hit && <span className="sheen pointer-events-none absolute inset-0" aria-hidden="true" />}
    </span>
  );
}

"use client";

import { useState, type PointerEvent } from "react";

const CARDS = [
  { label: "Común", name: "Carta común", tag: "text-mist", foil: 0.35, extra: "" },
  { label: "¡HIT!", name: "Ilustración especial", tag: "text-gold", foil: 1, extra: "hit" },
  { label: "Holo", name: "Reverse holo", tag: "text-cyan", foil: 0.7, extra: "" },
];

export default function HoloPack() {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [opened, setOpened] = useState(false);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (opened) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ ry: Math.round((x - 0.5) * 36), rx: Math.round((0.5 - y) * 30), mx: Math.round(x * 100), my: Math.round(y * 100) });
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        className="stage relative flex h-[460px] w-full max-w-[520px] items-center justify-center"
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 })}
      >
        <div
          key={opened ? "open" : "closed"}
          className={`pack relative h-[360px] w-[236px] ${opened ? "torn" : ""}`}
          style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
        >
          <div className="float relative h-full w-full">
            <div className="crimp foil absolute inset-x-0 top-0 z-10 h-8 rounded-t-2xl rounded-b-sm" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-[#34345c] bg-gradient-to-b from-[#1c1c3a] to-[#0f0f22] shadow-[0_30px_80px_rgba(0,0,0,.6),0_0_60px_rgba(255,79,216,.18)]">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,.28), transparent 42%)` }}
              />
              <svg width="104" height="104" viewBox="0 0 110 110" aria-hidden="true">
                <defs>
                  <linearGradient id="star" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FF4FD8" />
                    <stop offset=".5" stopColor="#3DE8FF" />
                    <stop offset="1" stopColor="#FFD84F" />
                  </linearGradient>
                </defs>
                <path d="M55 6 L66 42 L104 42 L73 64 L85 102 L55 79 L25 102 L37 64 L6 42 L44 42 Z" fill="none" stroke="url(#star)" strokeWidth="5" strokeLinejoin="round" />
              </svg>
              <span className="font-display text-[26px] font-bold tracking-tight">HOLO CLUB</span>
              <span className="text-xs tracking-[3px] text-[#a6a6c0]">BOOSTER · 10 CARTAS</span>
            </div>
            <div className="foil absolute inset-x-0 bottom-0 h-5 rounded-t-sm rounded-b-2xl" />
          </div>
        </div>

        {opened && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-live="polite">
            {CARDS.map((c, i) => (
              <div key={c.name} className={`pulled pulled-${i} ${c.extra} absolute h-[224px] w-[160px] overflow-hidden rounded-xl border border-[#3a3a5c] bg-card`}>
                <div className="foil absolute inset-2 rounded-lg" style={{ opacity: c.foil }} />
                <div className="absolute inset-2 flex flex-col justify-between rounded-lg bg-[rgba(11,11,20,.55)] p-3">
                  <span className={`self-start rounded-full bg-ink px-2.5 py-1 text-xs font-semibold ${c.tag}`}>{c.label}</span>
                  <span className="font-display text-base font-semibold">{c.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpened((o) => !o)}
        className={`btn min-h-11 cursor-pointer rounded-full border px-6 py-3 font-semibold ${opened ? "border-[#3a3a5c] text-white" : "border-cyan text-[#9ef4ff]"}`}
      >
        {opened ? "Volver a cerrar" : "Abrir sobre de prueba"}
      </button>
      <span className="text-[13px] text-dim">Mueve el cursor sobre el sobre · ilustración de demo</span>
    </div>
  );
}

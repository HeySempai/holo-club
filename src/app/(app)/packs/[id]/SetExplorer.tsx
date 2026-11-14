"use client";

import { useMemo, useState } from "react";
import PackReveal, { Face } from "@/components/PackReveal";
import { Card, btnCls, inputCls } from "@/components/ui";
import { SAMPLE_CARDS, samplePack } from "@/lib/demo";

export type SetCard = { id: string; number: string; name: string; rarity: string | null; image_url: string | null; is_hit: boolean; pulled: number };

export default function SetExplorer({ cards, packsOpened }: { cards: SetCard[]; packsOpened: number }) {
  const [demo, setDemo] = useState(0);
  const [filter, setFilter] = useState<"all" | "hits" | string>("all");
  const [query, setQuery] = useState("");
  const chase = useMemo(() => cards.filter((c) => c.is_hit).sort((a, b) => b.pulled - a.pulled || a.number.localeCompare(b.number, undefined, { numeric: true })), [cards]);
  const rarities = useMemo(() => [...new Set(cards.map((c) => c.rarity ?? "Sin rareza"))], [cards]);
  const pack = useMemo(() => (cards.length ? samplePack(cards) : SAMPLE_CARDS), [cards, demo]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = cards.filter((c) => {
    if (filter === "hits" && !c.is_hit) return false;
    if (filter !== "all" && filter !== "hits" && (c.rarity ?? "Sin rareza") !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.number.startsWith(q);
  });

  const chip = (key: string, label: string) => (
    <button key={key} type="button" onClick={() => setFilter(key)} aria-pressed={filter === key}
      className={`min-h-9 cursor-pointer rounded-full border px-3.5 text-sm ${filter === key ? "border-cyan bg-cyan text-ink" : "border-line text-mist hover:border-cyan"}`}>
      {label}
    </button>
  );

  return (
    <>
      <div className="grid items-center gap-6 rounded-[20px] border border-line bg-[radial-gradient(circle_at_30%_20%,#1d1d44,#10101e)] p-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] uppercase tracking-[2px] text-pink">Sobre de prueba</span>
          <h2 className="m-0 font-display text-3xl font-bold">Siente la apertura antes de suscribirte</h2>
          <p className="m-0 text-mist">
            Así se ve registrar tu sobre en Holo Club: desliza la tira, voltea carta por carta y los hits salen al final, como en un sobre de verdad.
            Esta apertura es una simulación; los tuyos son sobres sellados que te llegan a casa.
          </p>
          {!cards.length && <p className="m-0 text-sm text-dim">El catálogo de esta colección aún se está cargando; por ahora la demo usa cartas de ejemplo.</p>}
        </div>
        <PackReveal key={demo} cards={pack} footer={<button type="button" onClick={() => setDemo((d) => d + 1)} className={`${btnCls} self-start`}>Abrir otro</button>} />
      </div>

      {chase.length > 0 && (
        <Card>
          <h2 className="mt-0 font-display text-xl">Las más buscadas</h2>
          <ul className="m-0 flex list-none gap-4 overflow-x-auto p-0 pb-2">
            {chase.slice(0, 16).map((c) => (
              <li key={c.id} className="flex w-[150px] shrink-0 flex-col gap-1.5">
                <Face card={c} small />
                <span className="text-sm leading-tight">{c.name}</span>
                <span className="text-xs text-dim">#{c.number} · {c.pulled ? <span className="text-gold">salió {c.pulled}×</span> : "aún no sale"}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {cards.length > 0 && (
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 font-display text-xl">Todas las cartas ({shown.length})</h2>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar nombre o número" aria-label="Buscar carta" className={`${inputCls} max-w-[260px]`} />
          </div>
          <div className="flex flex-wrap gap-2">
            {chip("all", "Todas")}
            {chip("hits", "★ Solo hits")}
            {rarities.map((r) => chip(r, r))}
          </div>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 p-0">
            {shown.map((c) => (
              <li key={c.id} className="flex flex-col gap-1">
                <Face card={c} small />
                <span className="truncate text-xs text-mist">{c.name}</span>
                <span className={`text-[11px] ${c.is_hit ? "text-gold" : "text-dim"}`}>#{c.number}{packsOpened > 0 && c.pulled > 0 && ` · ${c.pulled}×`}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

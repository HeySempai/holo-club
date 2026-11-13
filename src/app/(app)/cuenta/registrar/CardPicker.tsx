"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { registerPack, type FormState } from "../actions";
import { Card, Notice, btnCls, btnGhostCls, inputCls } from "@/components/ui";

export type PickCard = { id: string; number: string; name: string; rarity: string | null; image_url: string | null; is_hit: boolean };

export default function CardPicker({ code, setName, perPack, maxHits, cards }: { code: string; setName: string; perPack: number; maxHits: number; cards: PickCard[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [state, action, pending] = useActionState<FormState, FormData>(registerPack, { status: "idle" });

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? cards.filter((c) => c.name.toLowerCase().includes(q) || c.number.toLowerCase().startsWith(q)) : cards;
  }, [cards, query]);
  const hits = picked.filter((id) => byId.get(id)?.is_hit).length;
  const full = picked.length >= perPack;

  if (state.status === "ok" && state.data) {
    const d = state.data as { ok: number; review: number; holos: number };
    return (
      <div className="foil rounded-2xl p-[2px]">
        <div className="flex flex-col gap-3 rounded-[14px] bg-[#12122a] p-6">
          <span className="font-display text-2xl font-bold">¡Sobre registrado! +{d.holos} Holos</span>
          <span className="text-mist">
            {d.ok} cartas registradas{d.review > 0 && ` · ${d.review} en revisión: las confirmamos en unos días`}.
          </span>
          <div className="flex flex-wrap gap-3">
            <Link href="/cuenta" className={btnCls}>Registrar otro</Link>
            <Link href="/muro" className={btnGhostCls}>Ver el muro</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cards.length) return <Notice kind="info">El catálogo de {setName} aún no está cargado. Inténtalo más tarde.</Notice>;

  return (
    <div className="flex flex-col gap-4">
      <Card className="sticky top-2 z-10 flex flex-col gap-3 bg-[#14142aee] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-display text-lg">
            <span className="font-mono">{code}</span> · {setName} · <strong className={full ? "text-lime" : "text-cyan"}>{picked.length}/{perPack}</strong>
          </span>
          <form action={action} className="flex gap-2">
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="cards" value={JSON.stringify(picked)} />
            <button className={btnCls} disabled={pending || picked.length === 0}>{pending ? "Registrando…" : "Registrar sobre"}</button>
          </form>
        </div>
        {picked.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {picked.map((id, i) => (
              <button key={i} type="button" onClick={() => setPicked((p) => p.filter((_, j) => j !== i))}
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-sm ${byId.get(id)?.is_hit ? "border-gold text-gold" : "border-line text-mist"}`}
                aria-label={`Quitar ${byId.get(id)?.name}`}>
                {byId.get(id)?.name} ✕
              </button>
            ))}
          </div>
        )}
        {hits > maxHits && <Notice kind="info">Un sobre normalmente trae máximo {maxHits} hits. Los extra pasan a revisión manual.</Notice>}
        {picked.length < perPack && picked.length > 0 && <span className="text-xs text-dim">Puedes registrar menos de {perPack}, pero solo el sobre completo da los 5 Holos extra.</span>}
        {state.status === "error" && <Notice kind="error">{state.message}</Notice>}
      </Card>

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o número" aria-label="Buscar carta" className={inputCls} />

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 p-0">
        {shown.map((c) => {
          const n = picked.filter((id) => id === c.id).length;
          return (
            <li key={c.id}>
              <button type="button" disabled={full} onClick={() => setPicked((p) => [...p, c.id])}
                className={`flex w-full cursor-pointer flex-col gap-1.5 rounded-xl border p-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${n ? "border-cyan" : c.is_hit ? "border-[#5a4a1a]" : "border-line"} bg-ink hover:border-cyan`}>
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt="" loading="lazy" className="aspect-[63/88] w-full rounded-md object-cover" />
                ) : (
                  <span className={`flex aspect-[63/88] w-full items-center justify-center rounded-md ${c.is_hit ? "foil" : "bg-card"} font-mono text-xs text-ink`}>#{c.number}</span>
                )}
                <span className="text-sm leading-tight">{c.name}</span>
                <span className={`text-xs ${c.is_hit ? "text-gold" : "text-dim"}`}>#{c.number} · {c.rarity ?? "—"}{n > 0 && ` · ×${n}`}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

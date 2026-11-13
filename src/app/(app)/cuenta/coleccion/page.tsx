import type { Metadata } from "next";
import { Card, PageTitle } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mi colección · Holo Club" };

type Row = { card_id: string; status: string; cards: { name: string; number: string; rarity: string | null; image_url: string | null; is_hit: boolean; set_id: string } | null };

export default async function Coleccion() {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;
  const [{ data: pulls }, { data: sets }] = await Promise.all([
    supabase.from("pulls").select("card_id, status, cards(name, number, rarity, image_url, is_hit, set_id)").eq("user_id", user.id).neq("status", "rejected"),
    supabase.from("sets").select("id, name"),
  ]);
  const rows = (pulls ?? []) as unknown as Row[];

  const bySet = new Map<string, Map<string, { row: Row; qty: number }>>();
  for (const r of rows) {
    if (!r.cards) continue;
    const m = bySet.get(r.cards.set_id) ?? new Map();
    const cur = m.get(r.card_id);
    m.set(r.card_id, { row: r, qty: (cur?.qty ?? 0) + 1 });
    bySet.set(r.cards.set_id, m);
  }

  const totals = await Promise.all(
    [...bySet.keys()].map(async (id) => {
      const { count } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("set_id", id);
      return [id, count ?? 0] as const;
    }),
  );
  const totalOf = new Map(totals);

  return (
    <>
      <PageTitle eyebrow="Biblioteca" title="Mi colección" />
      {!bySet.size && <p className="m-0 text-mist">Cuando registres tu primer sobre, tus cartas aparecerán aquí.</p>}
      {[...bySet.entries()].map(([setId, m]) => {
        const items = [...m.values()].sort((a, b) => a.row.cards!.number.localeCompare(b.row.cards!.number, undefined, { numeric: true }));
        const total = totalOf.get(setId) ?? 0;
        const pct = total ? Math.round((m.size / total) * 100) : 0;
        return (
          <Card key={setId} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="m-0 font-display text-xl">{sets?.find((s) => s.id === setId)?.name ?? setId}</h2>
              <span className="text-mist">{m.size} de {total} cartas · {pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="foil h-full" style={{ width: `${pct}%` }} />
            </div>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3 p-0">
              {items.map(({ row, qty }) => (
                <li key={row.card_id} className={`flex flex-col gap-1 rounded-xl border p-2 ${row.cards!.is_hit ? "border-gold" : "border-line"}`}>
                  {row.cards!.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.cards!.image_url} alt="" loading="lazy" className="aspect-[63/88] w-full rounded-md object-cover" />
                  ) : (
                    <span className={`flex aspect-[63/88] items-center justify-center rounded-md ${row.cards!.is_hit ? "foil" : "bg-ink"} font-mono text-xs text-ink`}>#{row.cards!.number}</span>
                  )}
                  <span className="text-xs leading-tight">{row.cards!.name}</span>
                  <span className="text-xs text-dim">#{row.cards!.number}{qty > 1 && ` · ×${qty}`}{row.status === "review" && " · en revisión"}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </>
  );
}

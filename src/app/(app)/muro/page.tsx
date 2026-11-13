import type { Metadata } from "next";
import { Card, PageTitle, Stat } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/site";

export const metadata: Metadata = { title: "Muro de aperturas · Holo Club" };

type Hit = { name: string; rarity: string | null; image_url: string | null };
type Entry = { alias: string; registered_at: string; set_name: string; cards: number; hits: Hit[] };

export default async function Muro() {
  const supabase = await supabaseServer();
  const [{ data: feed }, { data: stats }] = await Promise.all([supabase.rpc("wall_feed", { p_limit: 40 }), supabase.rpc("community_stats")]);
  const s = (stats ?? {}) as Record<string, number>;
  const entries = (feed ?? []) as Entry[];

  return (
    <>
      <PageTitle eyebrow="Comunidad" title="Muro de aperturas">
        Todo lo que va saliendo en los sobres del club, registrado por sus miembros.
      </PageTitle>
      <Card className="flex flex-wrap gap-10">
        <Stat label="Sobres abiertos" value={s.packs_opened ?? 0} accent="text-cyan" />
        <Stat label="Cartas registradas" value={s.cards_registered ?? 0} />
        <Stat label="Hits" value={s.hits ?? 0} accent="text-gold" />
        <Stat label="Miembros activos" value={s.members ?? 0} accent="text-pink" />
      </Card>

      {!entries.length && <p className="m-0 text-mist">Todavía no hay aperturas registradas. ¡La primera puede ser la tuya!</p>}
      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {entries.map((e, i) => (
          <li key={i}>
            <Card className={`flex h-full flex-col gap-3 ${e.hits.length ? "hit" : ""}`}>
              <div className="flex justify-between gap-2 text-sm">
                <strong className="text-white">@{e.alias}</strong>
                <span className="text-dim">{fmtDate(e.registered_at)}</span>
              </div>
              <span className="text-mist">{e.set_name} · {e.cards} cartas</span>
              {e.hits.length > 0 ? (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {e.hits.map((h, j) => (
                    <li key={j} className="text-gold">★ {h.name} <span className="text-xs text-dim">({h.rarity})</span></li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-dim">Sin hits esta vez</span>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

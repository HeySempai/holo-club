import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Stat } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";
import { PRICE_MXN, PACKS_PER_MONTH } from "@/lib/site";
import SetExplorer, { type SetCard } from "./SetExplorer";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("sets").select("name").eq("id", id).maybeSingle();
  return { title: `${data?.name ?? "Colección"} · Holo Club` };
}

export default async function Coleccion({ params }: Props) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const [{ data: set }, { data: cards }, { data: stats }] = await Promise.all([
    supabase.from("sets").select("id, name, cards_per_pack, max_hits_per_pack").eq("id", id).eq("active", true).maybeSingle(),
    supabase.from("cards").select("id, number, name, rarity, image_url, is_hit").eq("set_id", id),
    supabase.rpc("set_community_stats", { p_set_id: id }),
  ]);
  if (!set) notFound();

  const st = (stats ?? { packs_opened: 0, pulls: {} }) as { packs_opened: number; pulls: Record<string, number> };
  const list: SetCard[] = (cards ?? [])
    .map((c) => ({ ...c, pulled: st.pulls[c.id] ?? 0 }))
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

  // Rarity breakdown with community odds ("1 in N packs") once there is data.
  const byRarity = new Map<string, { cards: number; pulled: number; hit: boolean }>();
  for (const c of list) {
    const k = c.rarity ?? "Sin rareza";
    const r = byRarity.get(k) ?? { cards: 0, pulled: 0, hit: c.is_hit };
    r.cards++;
    r.pulled += c.pulled;
    byRarity.set(k, r);
  }
  const rarities = [...byRarity.entries()].sort((a, b) => Number(a[1].hit) - Number(b[1].hit) || b[1].cards - a[1].cards);
  const hitCount = list.filter((c) => c.is_hit).length;

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/colecciones" className="text-sm text-dim hover:text-white">← Colecciones</Link>
        <h1 className="m-0 font-display text-[clamp(30px,4.5vw,46px)] font-bold tracking-tight">{set.name}</h1>
        <p className="m-0 text-mist">
          {set.cards_per_pack} cartas por sobre · máximo {set.max_hits_per_pack} hits por sobre · {PACKS_PER_MONTH} sobres sellados al mes por ${PRICE_MXN.toLocaleString("es-MX")}
        </p>
      </div>

      <Card className="flex flex-wrap gap-10">
        <Stat label="Cartas en la colección" value={list.length} />
        <Stat label="Hits posibles" value={hitCount} accent="text-gold" />
        <Stat label="Sobres abiertos por el club" value={st.packs_opened} accent="text-cyan" />
      </Card>

      <SetExplorer cards={list} packsOpened={st.packs_opened} />

      <Card>
        <h2 className="mt-0 font-display text-xl">Rarezas y lo que le ha salido al club</h2>
        <p className="mt-0 text-sm text-dim">
          Calculado con los sobres que los miembros registran. No son probabilidades oficiales de Pokémon: son lo que de verdad está saliendo en nuestras cajas.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-dim">
              <tr><th className="py-2 pr-4">Rareza</th><th className="pr-4">Cartas</th><th className="pr-4">Han salido</th><th>Frecuencia en el club</th></tr>
            </thead>
            <tbody>
              {rarities.map(([name, r]) => (
                <tr key={name} className="border-t border-line">
                  <td className={`py-2 pr-4 ${r.hit ? "text-gold" : ""}`}>{r.hit && "★ "}{name}</td>
                  <td className="pr-4">{r.cards}</td>
                  <td className="pr-4">{r.pulled}</td>
                  <td className="text-mist">
                    {st.packs_opened < 1 ? "—" : r.pulled === 0 ? "Aún no sale" : r.pulled >= st.packs_opened ? `${(r.pulled / st.packs_opened).toFixed(1)} por sobre` : `1 de cada ${Math.round(st.packs_opened / r.pulled)} sobres`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

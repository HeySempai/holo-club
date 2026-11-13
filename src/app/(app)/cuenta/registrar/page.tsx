import type { Metadata } from "next";
import { Card, Field, Notice, PageTitle, btnCls, inputCls } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import CardPicker, { type PickCard } from "./CardPicker";

export const metadata: Metadata = { title: "Registrar sobre · Holo Club" };

export default async function Registrar({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams;
  const code = (codigo ?? "").trim().toUpperCase();
  const { supabase } = await getSessionUser();

  let error: string | null = null;
  type Pack = { code: string; registered_at: string | null; set_id: string; shipments: { status: string } | null };
  let pack: Pack | null = null;
  let set: { name: string; cards_per_pack: number; max_hits_per_pack: number } | null = null;
  let cards: PickCard[] = [];

  if (code) {
    // RLS only returns packs from this user's own shipments.
    const { data } = await supabase.from("packs").select("code, registered_at, set_id, shipments(status)").eq("code", code).maybeSingle();
    pack = data as unknown as Pack | null;
    if (!pack) error = "Ese código no corresponde a ninguno de tus sobres.";
    else if (pack.registered_at) error = "Este sobre ya fue registrado.";
    else if (pack.shipments?.status === "preparing") error = "Tu envío todavía no sale; podrás registrar cuando lo recibas.";
    else {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from("sets").select("name, cards_per_pack, max_hits_per_pack").eq("id", pack.set_id).single(),
        supabase.from("cards").select("id, number, name, rarity, image_url, is_hit").eq("set_id", pack.set_id),
      ]);
      set = s;
      cards = ((c ?? []) as PickCard[]).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    }
  }

  return (
    <>
      <PageTitle eyebrow="Registrar" title="Registra lo que te salió">
        Escribe el código de la funda del sobre y elige tus cartas. Ganas 1 Holo por carta y 5 más por sobre completo.
      </PageTitle>

      <Card>
        <form className="flex flex-wrap items-end gap-3" action="/cuenta/registrar">
          <div className="min-w-[220px] flex-1">
            <Field label="Código del sobre">
              <input name="codigo" defaultValue={code} required placeholder="HC-XXXXXX" autoCapitalize="characters" className={`${inputCls} font-mono uppercase`} />
            </Field>
          </div>
          <button className={btnCls}>Buscar</button>
        </form>
      </Card>

      {error && <Notice kind="error">{error}</Notice>}
      {pack && set && !error && <CardPicker code={pack.code} setName={set.name} perPack={set.cards_per_pack} maxHits={set.max_hits_per_pack} cards={cards} />}
    </>
  );
}

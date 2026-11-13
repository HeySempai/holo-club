import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageTitle } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Colecciones · Holo Club" };

export default async function Colecciones() {
  const supabase = await supabaseServer();
  const { data: sets } = await supabase.from("sets").select("id, name, cards_per_pack, cards(count)").eq("active", true).order("created_at", { ascending: false });

  return (
    <>
      <PageTitle eyebrow="Lo que llega a tu puerta" title="Colecciones">
        Revisa cada carta que puede salir, cuáles son los hits y qué tan seguido le han salido al club. Sin letras chiquitas.
      </PageTitle>
      {!sets?.length && <Card><p className="m-0 text-mist">Estamos cargando el catálogo de la primera colección. Vuelve pronto.</p></Card>}
      <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {sets?.map((s) => (
          <li key={s.id}>
            <Link href={`/colecciones/${s.id}`} className="tile flex h-full flex-col gap-4 rounded-[20px] border border-line bg-card p-6 text-white no-underline">
              <span className="foil block h-2 w-16 rounded-full" aria-hidden="true" />
              <span className="font-display text-2xl font-bold leading-tight">{s.name}</span>
              <span className="text-sm text-mist">
                {(s.cards as unknown as { count: number }[])[0]?.count ?? 0} cartas · {s.cards_per_pack} por sobre
              </span>
              <span className="mt-auto text-sm font-semibold text-cyan">Ver cartas y abrir un sobre de prueba →</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

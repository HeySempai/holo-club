import type { Metadata } from "next";
import Link from "next/link";
import LandingDemo from "@/components/LandingDemo";
import { Card, PageTitle } from "@/components/ui";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Packs · Holo Club" };

export default async function Packs() {
  const supabase = await supabaseServer();
  const { data: sets } = await supabase.from("sets").select("id, name, cards_per_pack, cards(count)").eq("active", true).order("created_at", { ascending: false });

  return (
    <>
      <div className="grid items-center gap-8 rounded-[28px] border border-line bg-[radial-gradient(60%_60%_at_70%_40%,rgba(124,77,255,.3),transparent_70%),#1a1b2a] p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <span className="poster text-[clamp(44px,6vw,68px)] leading-[0.9]">Rip<br /><span className="brand-text">Packs</span></span>
          <p className="m-0 text-lg leading-relaxed text-mist">
            Desliza la tira, voltea carta por carta y los hits salen al final. Así se siente registrar cada sobre que te llega en tu caja del mes.
          </p>
          <Link href="/#fundadores" className="btn brand-grad inline-flex min-h-12 items-center self-start rounded-xl px-6 font-bold text-ink">Apartar lugar de fundador</Link>
        </div>
        <LandingDemo />
      </div>
      <PageTitle eyebrow="Lo que llega a tu puerta" title="Colecciones">
        Revisa cada carta que puede salir, cuáles son los hits y qué tan seguido le han salido al club. Sin letras chiquitas.
      </PageTitle>
      {!sets?.length && <Card><p className="m-0 text-mist">Estamos cargando el catálogo de la primera colección. Vuelve pronto.</p></Card>}
      <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {sets?.map((s) => (
          <li key={s.id}>
            <Link href={`/packs/${s.id}`} className="tile flex h-full flex-col gap-4 rounded-[20px] border border-line bg-card p-6 text-white no-underline">
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

import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";
import { getSessionUser } from "@/lib/supabase/server";

export default async function CodigosCaja({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getSessionUser();
  const { data: box } = await supabase.from("boxes").select("label, sets(name), packs(code, position, shipment_id)").eq("id", id).maybeSingle();
  if (!box) notFound();
  const packs = ((box.packs ?? []) as { code: string; position: number; shipment_id: string | null }[]).sort((a, b) => a.position - b.position);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="m-0 font-display text-3xl">Códigos · {box.label}</h1>
        <PrintButton />
      </div>
      <p className="m-0 text-mist print:hidden">Imprime en hojas de etiquetas y pega cada código en la funda de su sobre, en el orden de la caja.</p>
      <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-4 print:grid-cols-4 print:text-black">
        {packs.map((p) => (
          <li key={p.code} className="flex flex-col items-center gap-1 rounded-lg border border-line p-3 print:border-black">
            <span className="font-mono text-lg font-bold tracking-wider">{p.code}</span>
            <span className="text-xs text-dim print:text-black">Holo Club · {box.label} #{p.position}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

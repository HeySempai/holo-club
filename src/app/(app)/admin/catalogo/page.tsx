import ActionForm from "@/components/ActionForm";
import { Card, Field, PageTitle, btnCls, inputCls } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import { importCards, upsertSet } from "../actions";

export default async function Catalogo() {
  const { supabase } = await getSessionUser();
  const { data: sets } = await supabase.from("sets").select("*").order("created_at", { ascending: false });
  const counts = await Promise.all(
    (sets ?? []).map(async (s) => {
      const { count } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("set_id", s.id);
      const { count: hits } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("set_id", s.id).eq("is_hit", true);
      return { id: s.id, count: count ?? 0, hits: hits ?? 0 };
    }),
  );

  return (
    <>
      <PageTitle eyebrow="Administración" title="Catálogo de cartas">
        Cada set define cuántas cartas trae un sobre y cuántos hits como máximo; los hits de más se mandan a revisión.
      </PageTitle>

      <Card>
        <h2 className="mt-0 font-display text-xl">Sets</h2>
        {!sets?.length && <p className="text-mist">Aún no hay sets.</p>}
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {sets?.map((s) => {
            const c = counts.find((x) => x.id === s.id);
            return (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-2 text-sm">
                <span><strong className="text-white">{s.name}</strong> <span className="font-mono text-dim">({s.id})</span></span>
                <span className="text-mist">{c?.count} cartas · {c?.hits} hits · {s.cards_per_pack} por sobre · máx. {s.max_hits_per_pack} hits</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mt-0 font-display text-xl">Crear o editar set</h2>
          <ActionForm action={upsertSet}>
            <Field label="ID interno" hint="Minúsculas y guiones, ej. me-pitch-black"><input name="id" required pattern="[a-z0-9-]{2,40}" className={inputCls} /></Field>
            <Field label="Nombre"><input name="name" required placeholder="Mega Evolution: Pitch Black" className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cartas por sobre"><input name="cards_per_pack" type="number" min={1} max={20} defaultValue={10} className={inputCls} /></Field>
              <Field label="Máx. hits por sobre"><input name="max_hits" type="number" min={0} max={20} defaultValue={2} className={inputCls} /></Field>
            </div>
            <Field label="Rarezas que cuentan como hit" hint="Separadas por coma. Vacío = Ultra, Illustration, Special Illustration, Hyper y Mega Hyper Rare.">
              <input name="hit_rarities" className={inputCls} />
            </Field>
            <button className={`${btnCls} self-start`}>Guardar set</button>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="mt-0 font-display text-xl">Importar cartas</h2>
          <ActionForm action={importCards}>
            <Field label="Set destino">
              <select name="set_id" required className={inputCls}>
                {sets?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <Field label="Fuente">
                <select name="source" defaultValue="tcgdex" className={inputCls}>
                  <option value="tcgdex">TCGdex (gratis)</option>
                  <option value="pokemontcg">pokemontcg.io</option>
                </select>
              </Field>
              <Field label="Opción A · ID del set" hint="Trae nombres, rarezas e imágenes. Ej. TCGdex: me05 · pokemontcg.io: me5">
                <input name="api_set_id" placeholder="me05" className={inputCls} />
              </Field>
            </div>
            <Field label="Opción B · Pegar lista (si dejas vacía la opción A)" hint="Una carta por línea: número,nombre,rareza,url_imagen (la imagen es opcional)">
              <textarea name="csv" rows={6} placeholder={"001,Bulbasaur,Common\n215,Mega Darkrai ex,Special Illustration Rare"} className={`${inputCls} py-3 font-mono text-sm`} />
            </Field>
            <button className={`${btnCls} self-start`}>Importar</button>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}

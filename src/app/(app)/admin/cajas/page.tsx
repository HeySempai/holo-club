import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import { Card, Field, PageTitle, btnCls, inputCls } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/site";
import { createBox } from "../actions";

export default async function Cajas() {
  const { supabase } = await getSessionUser();
  const [{ data: sets }, { data: boxes }] = await Promise.all([
    supabase.from("sets").select("id, name").eq("active", true),
    supabase.from("boxes").select("*, sets(name), packs(shipment_id, registered_at)").order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <PageTitle eyebrow="Administración" title="Cajas e inventario">
        Al dar de alta una caja se genera un código único por sobre. Imprímelos y pégalos en la funda de cada sobre.
      </PageTitle>
      <Card>
        <h2 className="mt-0 font-display text-xl">Nueva caja</h2>
        <ActionForm action={createBox} className="grid gap-3 sm:grid-cols-2">
          <Field label="Set">
            <select name="set_id" required className={inputCls}>
              {sets?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Etiqueta" hint="Única, ej. PB-001"><input name="label" required maxLength={40} className={inputCls} /></Field>
          <Field label="Proveedor"><input name="supplier" placeholder="Antique Store" className={inputCls} /></Field>
          <Field label="Costo de la caja (MXN)"><input name="cost" type="number" min={0} step="0.01" placeholder="3250" className={inputCls} /></Field>
          <Field label="Sobres en la caja"><input name="packs" type="number" min={1} max={100} defaultValue={36} className={inputCls} /></Field>
          <div className="flex items-end"><button className={btnCls}>Crear caja</button></div>
        </ActionForm>
      </Card>

      <Card>
        <h2 className="mt-0 font-display text-xl">Cajas</h2>
        {!boxes?.length && <p className="text-mist">Aún no hay cajas.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-dim">
              <tr><th className="py-2 pr-4">Etiqueta</th><th className="pr-4">Set</th><th className="pr-4">Proveedor</th><th className="pr-4">Costo</th><th className="pr-4">Asignados</th><th className="pr-4">Registrados</th><th className="pr-4">Alta</th><th /></tr>
            </thead>
            <tbody>
              {boxes?.map((b) => {
                const packs = (b.packs ?? []) as { shipment_id: string | null; registered_at: string | null }[];
                return (
                  <tr key={b.id} className="border-t border-line">
                    <td className="py-2 pr-4 font-mono">{b.label}</td>
                    <td className="pr-4">{(b.sets as { name: string } | null)?.name}</td>
                    <td className="pr-4 text-mist">{b.supplier ?? "—"}</td>
                    <td className="pr-4">{b.cost_cents != null ? `$${(b.cost_cents / 100).toLocaleString("es-MX")}` : "—"}</td>
                    <td className="pr-4">{packs.filter((p) => p.shipment_id).length}/{b.packs_count}</td>
                    <td className="pr-4">{packs.filter((p) => p.registered_at).length}</td>
                    <td className="pr-4 text-mist">{fmtDate(b.created_at)}</td>
                    <td><Link href={`/admin/cajas/${b.id}`} className="text-cyan underline">Códigos</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

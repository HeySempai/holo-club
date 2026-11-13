import ActionForm from "@/components/ActionForm";
import { Card, PageTitle, btnCls, btnGhostCls } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/site";
import { setRedemption } from "../actions";

export default async function Canjes() {
  const { supabase } = await getSessionUser();
  const { data } = await supabase
    .from("redemptions")
    .select("id, cost_holos, created_at, shipment_id, rewards(name), profiles(email, alias)")
    .eq("status", "pending")
    .order("created_at");

  return (
    <>
      <PageTitle eyebrow="Administración" title="Canjes por surtir">
        Los canjes se agregan solos al siguiente envío del suscriptor. Márcalos como entregados al empacar. Cancelar devuelve los Holos.
      </PageTitle>
      {!data?.length && <p className="m-0 text-mist">Nada pendiente.</p>}
      {data?.map((r) => {
        const u = r.profiles as unknown as { email: string; alias: string | null } | null;
        return (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <strong>{(r.rewards as unknown as { name: string } | null)?.name}</strong>
              <span className="text-sm text-mist">{u?.alias ? `@${u.alias}` : u?.email} · {r.cost_holos} Holos · {fmtDate(r.created_at)} · {r.shipment_id ? "ya asignado a un envío" : "sale en el próximo envío"}</span>
            </div>
            <div className="flex gap-2">
              <ActionForm action={setRedemption}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="fulfilled" /><button className={btnCls}>Entregado</button></ActionForm>
              <ActionForm action={setRedemption} confirm="¿Cancelar y devolver los Holos?"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="cancelled" /><button className={btnGhostCls}>Cancelar</button></ActionForm>
            </div>
          </Card>
        );
      })}
    </>
  );
}

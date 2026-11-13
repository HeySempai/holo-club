import ActionForm from "@/components/ActionForm";
import { Card, PageTitle, btnGhostCls, inputCls } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import { SUB_STATUS, fmtDate } from "@/lib/site";
import { setSubscription } from "../actions";

export default async function Suscriptores() {
  const { supabase } = await getSessionUser();
  const [{ data: profiles }, { data: waitlist }] = await Promise.all([
    supabase.from("profiles").select("id, email, alias, full_name, postal_code, created_at, subscriptions(status, founder, mp_preapproval_id, created_at)").order("created_at", { ascending: false }),
    supabase.from("waitlist").select("name, email, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <PageTitle eyebrow="Administración" title="Suscriptores">
        Mientras Mercado Pago no esté conectado, activa aquí las suscripciones a mano. Con Mercado Pago conectado se actualizan solas.
      </PageTitle>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-dim"><tr><th className="py-2 pr-4">Cuenta</th><th className="pr-4">Dirección</th><th className="pr-4">Estado</th><th className="pr-4">Cambiar</th></tr></thead>
          <tbody>
            {profiles?.map((p) => {
              const subs = ((p.subscriptions ?? []) as { status: string; founder: boolean; mp_preapproval_id: string | null; created_at: string }[]).sort((a, b) => b.created_at.localeCompare(a.created_at));
              const s = subs[0];
              return (
                <tr key={p.id} className="border-t border-line align-top">
                  <td className="py-3 pr-4">{p.email}{p.alias && <span className="block text-dim">@{p.alias}</span>}<span className="block text-xs text-dim">desde {fmtDate(p.created_at)}</span></td>
                  <td className="pr-4 pt-3">{p.postal_code ? `CP ${p.postal_code}` : <span className="text-[#ff7aa8]">Falta</span>}</td>
                  <td className="pr-4 pt-3">{s ? SUB_STATUS[s.status] : "—"}{s?.founder && " · Fundador"}{s?.mp_preapproval_id && <span className="block text-xs text-dim">Mercado Pago</span>}</td>
                  <td className="pt-2">
                    <ActionForm action={setSubscription} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="user_id" value={p.id} />
                      <select name="status" defaultValue={s?.status ?? "active"} className={`${inputCls} w-auto`}>
                        {Object.entries(SUB_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <label className="flex items-center gap-1.5 text-xs text-mist"><input type="checkbox" name="founder" defaultChecked={s?.founder} /> Fundador</label>
                      <button className={btnGhostCls}>Guardar</button>
                    </ActionForm>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Card>
        <h2 className="mt-0 font-display text-xl">Lista de fundadores ({waitlist?.length ?? 0})</h2>
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
          {waitlist?.map((w) => <li key={w.email} className="flex justify-between gap-3 border-b border-line py-1.5"><span>{w.name} · {w.email}</span><span className="text-dim">{fmtDate(w.created_at)}</span></li>)}
        </ul>
      </Card>
    </>
  );
}

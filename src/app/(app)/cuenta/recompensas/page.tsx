import type { Metadata } from "next";
import ActionForm from "@/components/ActionForm";
import { Card, PageTitle, Stat, btnCls } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/site";
import { redeemReward } from "../actions";

export const metadata: Metadata = { title: "Recompensas · Holo Club" };

const RED_STATUS: Record<string, string> = { pending: "Va en tu próximo envío", fulfilled: "Entregado", cancelled: "Cancelado" };

export default async function Recompensas() {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;
  const [{ data: balance }, { data: rewards }, { data: ledger }, { data: reds }] = await Promise.all([
    supabase.rpc("holo_balance"),
    supabase.from("rewards").select("*").eq("active", true).order("sort"),
    supabase.from("holo_ledger").select("id, delta, reason, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15),
    supabase.from("redemptions").select("id, status, created_at, rewards(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);
  const bal = (balance as number) ?? 0;

  return (
    <>
      <PageTitle eyebrow="Holos" title="Recompensas">
        Ganas Holos registrando tus cartas. No se compran ni se cambian por dinero.
      </PageTitle>
      <Card><Stat label="Tu saldo" value={`${bal} Holos`} accent="text-gold" /></Card>

      <div className="grid gap-5 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        {rewards?.map((r) => (
          <Card key={r.id} className="flex flex-col gap-3">
            <h2 className="m-0 font-display text-xl">{r.name}</h2>
            <p className="m-0 text-mist">{r.description}</p>
            <span className="font-display text-2xl font-bold text-gold">{r.cost_holos} Holos</span>
            <ActionForm action={redeemReward} confirm={`¿Canjear ${r.cost_holos} Holos por ${r.name}?`}>
              <input type="hidden" name="reward" value={r.id} />
              <button className={btnCls} disabled={bal < r.cost_holos}>{bal < r.cost_holos ? `Te faltan ${r.cost_holos - bal}` : "Canjear"}</button>
            </ActionForm>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-xl">Movimientos</h2>
          {!ledger?.length && <span className="text-mist">Sin movimientos todavía.</span>}
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {ledger?.map((l) => (
              <li key={l.id} className="flex justify-between gap-3 text-sm">
                <span className="text-mist">{l.reason} · {fmtDate(l.created_at)}</span>
                <span className={l.delta > 0 ? "text-lime" : "text-[#ff7aa8]"}>{l.delta > 0 ? `+${l.delta}` : l.delta}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-xl">Mis canjes</h2>
          {!reds?.length && <span className="text-mist">Aún no canjeas nada.</span>}
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {reds?.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 text-sm">
                <span className="text-mist">{(r.rewards as unknown as { name: string } | null)?.name} · {fmtDate(r.created_at)}</span>
                <span>{RED_STATUS[r.status]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

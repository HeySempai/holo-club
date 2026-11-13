import { NextResponse, type NextRequest } from "next/server";
import { getPreapproval, mapStatus, verifyWebhook } from "@/lib/mercadopago";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const type = body?.type ?? request.nextUrl.searchParams.get("type");
  const dataId = String(body?.data?.id ?? request.nextUrl.searchParams.get("data.id") ?? "");

  if (!dataId || !verifyWebhook(request.headers, dataId)) {
    return NextResponse.json({ error: "firma inválida" }, { status: 401 });
  }
  // Only subscription status changes matter for now; acknowledge everything else.
  if (type !== "subscription_preapproval") return NextResponse.json({ ok: true });

  const db = supabaseService();
  if (!db) return NextResponse.json({ error: "servicio no configurado" }, { status: 503 });

  // Never trust the payload: read the current state from Mercado Pago itself.
  const pre = await getPreapproval(dataId);
  if (!pre.external_reference) return NextResponse.json({ ok: true });

  const status = mapStatus(pre.status);
  const { data: sub } = await db.from("subscriptions").select("id, started_at").eq("id", pre.external_reference).maybeSingle();
  if (!sub) return NextResponse.json({ ok: true });

  const { error } = await db
    .from("subscriptions")
    .update({
      status,
      mp_preapproval_id: pre.id,
      started_at: status === "active" && !sub.started_at ? new Date().toISOString() : undefined,
      cancelled_at: status === "cancelled" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);
  if (error) {
    console.error("webhook update failed", error.message);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

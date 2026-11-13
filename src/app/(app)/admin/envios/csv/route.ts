import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/supabase/server";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote everything and neutralise spreadsheet formulas.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET(request: NextRequest) {
  const { supabase, profile } = await getProfile();
  if (!profile?.is_admin) return new NextResponse("No autorizado", { status: 403 });
  const period = request.nextUrl.searchParams.get("periodo") ?? "";
  if (!/^\d{4}-\d{2}$/.test(period)) return new NextResponse("Periodo inválido", { status: 400 });

  const { data } = await supabase.from("shipments").select("id, address, profiles(email), packs(code)").eq("period", `${period}-01`).order("created_at");
  const header = ["nombre", "telefono", "correo", "calle", "num_ext", "num_int", "colonia", "ciudad", "estado", "cp", "referencias", "sobres", "codigos"];
  const lines = (data ?? []).map((s) => {
    const a = s.address as Record<string, string | null>;
    const codes = ((s.packs ?? []) as { code: string }[]).map((p) => p.code);
    return [a.full_name, a.phone, (s.profiles as unknown as { email: string } | null)?.email, a.street, a.ext_num, a.int_num, a.colonia, a.city, a.state, a.postal_code, a.refs, codes.length, codes.join(" ")]
      .map(esc)
      .join(",");
  });
  const csv = "﻿" + [header.join(","), ...lines].join("\n");
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="envios-${period}.csv"` },
  });
}

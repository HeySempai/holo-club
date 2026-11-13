import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { Card, PageTitle, Notice } from "@/components/ui";
import { getSessionUser } from "@/lib/supabase/server";
import { safeNext } from "@/lib/site";

export const metadata: Metadata = { title: "Entrar · Holo Club" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const { user } = await getSessionUser();
  if (user) redirect(safeNext(next));

  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-6">
      <PageTitle eyebrow="Tu cuenta" title="Entra a Holo Club">
        Te mandamos un enlace a tu correo. Sin contraseñas.
      </PageTitle>
      {error && <Notice kind="error">El enlace ya no es válido o expiró. Pide uno nuevo.</Notice>}
      <Card>
        <LoginForm next={safeNext(next)} />
      </Card>
    </div>
  );
}

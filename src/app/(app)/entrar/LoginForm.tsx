"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";
import { Field, Notice, btnCls, inputCls } from "@/components/ui";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return <Notice kind="ok">Listo. Revisa tu correo y abre el enlace desde este mismo navegador.</Notice>;
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Correo">
        <input name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" className={inputCls} />
      </Field>
      <button className={btnCls} disabled={pending}>{pending ? "Enviando…" : "Enviarme el enlace"}</button>
      {state.status === "error" && <Notice kind="error">{state.message}</Notice>}
    </form>
  );
}

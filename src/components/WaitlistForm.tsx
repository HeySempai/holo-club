"use client";

import { useActionState } from "react";
import Link from "next/link";
import { joinWaitlist, type JoinState } from "@/app/actions";

const initial: JoinState = { status: "idle" };

export default function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initial);

  if (state.status === "ok" || state.status === "already") {
    return (
      <div className="foil w-full max-w-[520px] rounded-2xl p-[2px]" role="status">
        <div className="rounded-[14px] bg-[#12122a] p-6 text-lg">
          {state.status === "ok" ? "¡Listo! Ya estás en la lista de fundadores." : "Ese correo ya estaba en la lista. ¡Nos vemos pronto!"}
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-wrap items-end justify-center gap-3">
        <label className="flex flex-[1_1_200px] flex-col gap-1.5 text-left text-sm text-mist">
          Nombre
          <input name="name" required maxLength={120} autoComplete="name" placeholder="Tu nombre" className="min-h-12 rounded-xl border border-[#3a3a5c] bg-ink px-4 text-base text-white placeholder:text-dim" />
        </label>
        <label className="flex flex-[1_1_240px] flex-col gap-1.5 text-left text-sm text-mist">
          Correo
          <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="tu@correo.com" className="min-h-12 rounded-xl border border-[#3a3a5c] bg-ink px-4 text-base text-white placeholder:text-dim" />
        </label>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <button type="submit" disabled={pending} className="btn min-h-12 cursor-pointer rounded-xl bg-pink px-6 font-bold text-ink disabled:opacity-60">
          {pending ? "Guardando…" : "Apartar lugar"}
        </button>
      </div>
      <label className="flex items-start justify-center gap-2 text-left text-sm text-mist">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#ff4fd8]" />
        <span>
          Acepto el <Link href="/privacidad" className="text-cyan underline">aviso de privacidad</Link> y que me escriban sobre Holo Club.
        </span>
      </label>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-[#ff7aa8]">
          {state.message}
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { Notice } from "./ui";

type State = { status: "idle" | "ok" | "error"; message?: string };

/** Submits a server action and shows its result message under the form. */
export default function ActionForm({
  action,
  children,
  className = "flex flex-col gap-3",
  confirm,
}: {
  action: (prev: State, form: FormData) => Promise<State>;
  children: React.ReactNode;
  className?: string;
  confirm?: string;
}) {
  const [state, run, pending] = useActionState(action, { status: "idle" } as State);
  return (
    <form
      action={run}
      className={className}
      aria-busy={pending}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {state.message && <Notice kind={state.status === "error" ? "error" : "ok"}>{state.message}</Notice>}
    </form>
  );
}

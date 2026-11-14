
export const inputCls =
  "min-h-11 w-full rounded-xl border border-[#3a3a5c] bg-ink px-4 text-base text-white placeholder:text-dim focus:border-cyan focus:outline-none";
export const btnCls = "btn inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-cyan px-5 font-semibold text-ink disabled:opacity-60";
export const btnGhostCls =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-[#3a3a5c] px-5 font-medium text-white hover:border-cyan disabled:opacity-60";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[20px] border border-line bg-card p-6 ${className}`}>{children}</div>;
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow && <span className="text-[13px] uppercase tracking-[2px] text-pink">{eyebrow}</span>}
      <h1 className="m-0 font-display text-[clamp(28px,4vw,40px)] font-bold tracking-tight">{title}</h1>
      {children && <div className="text-mist">{children}</div>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-mist">
      {label}
      {children}
      {hint && <span className="text-xs text-dim">{hint}</span>}
    </label>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "ok"; children: React.ReactNode }) {
  const color = kind === "error" ? "border-[#ff7aa8] text-[#ffb3cb]" : kind === "ok" ? "border-lime text-lime" : "border-cyan text-[#9ef4ff]";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`m-0 rounded-xl border px-4 py-3 text-sm ${color}`}>
      {children}
    </p>
  );
}

export function Stat({ label, value, accent = "text-white" }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-[#a6a6c0]">{label}</span>
      <span className={`font-display text-3xl font-bold ${accent}`}>{value}</span>
    </div>
  );
}

export { LogoFull as Logo } from "./brand";

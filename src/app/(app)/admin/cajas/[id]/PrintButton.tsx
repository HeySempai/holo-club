"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-cyan px-5 font-semibold text-ink">
      Imprimir
    </button>
  );
}

"use client";

import { useState } from "react";
import PackReveal from "./PackReveal";
import { SAMPLE_CARDS } from "@/lib/demo";

export default function LandingDemo() {
  const [n, setN] = useState(0);
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <PackReveal
        key={n}
        cards={SAMPLE_CARDS}
        footer={
          <button type="button" onClick={() => setN((x) => x + 1)} className="btn min-h-11 cursor-pointer self-start rounded-full border border-cyan px-6 font-semibold text-[#9ef4ff]">
            Volver a cerrar
          </button>
        }
      />
      <span className="text-[13px] text-dim">Demo con ilustraciones de ejemplo</span>
    </div>
  );
}

import Link from "next/link";
import { useId } from "react";

/** Holo card icon: tilted holo card with the "gem H", over a deep-violet back card. */
export function LogoIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5EE3FF" />
          <stop offset=".45" stopColor="#9C94FF" />
          <stop offset="1" stopColor="#F383D6" />
        </linearGradient>
        <clipPath id={`c${id}`}>
          <rect x="21" y="7" width="33" height="45" rx="6" />
        </clipPath>
      </defs>
      <rect x="7" y="14" width="29" height="41" rx="5" fill="#3B2F7D" transform="rotate(-12 21.5 34.5)" />
      <g transform="rotate(8 37.5 29.5)">
        <rect x="21" y="7" width="33" height="45" rx="6" fill={`url(#g${id})`} />
        <g clipPath={`url(#c${id})`}>
          <path d="M14 33 L44 3 L52 3 L22 33 Z" fill="#fff" opacity=".28" />
        </g>
        <path d="M31.5 17.5 L29.5 41.5 M45.5 17.5 L43.5 41.5" stroke="#12131C" strokeWidth="4.6" strokeLinecap="round" />
        <path d="M32.6 29.5 L37.5 25.6 L42.4 29.5 L37.5 33.4 Z" fill="#12131C" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`poster leading-none ${className}`}>
      <span className="text-[#f3f2fb]">HOLO</span>
      <span className="brand-text">CLUB</span>
    </span>
  );
}

export function LogoFull({ size = 36 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-white no-underline" aria-label="Holo Club, inicio">
      <LogoIcon size={size} className="shrink-0" />
      <Wordmark className="text-[24px] sm:text-[30px]" />
    </Link>
  );
}

export function IconPacks({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="11" height="15" rx="2" fill="currentColor" opacity=".45" transform="rotate(-10 9 12.5)" />
      <rect x="9" y="3.5" width="11" height="16" rx="2" fill="currentColor" />
      <path d="M11.5 7.5 L13 9 M17.5 7.5 L16 9" stroke="#12131c" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

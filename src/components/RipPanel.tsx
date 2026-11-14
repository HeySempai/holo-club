"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoIcon, Wordmark } from "./brand";

const ZIG = "polygon(0 0,100% 0,100% 70%,97% 100%,94% 70%,91% 100%,88% 70%,85% 100%,82% 70%,79% 100%,76% 70%,73% 100%,70% 70%,67% 100%,64% 70%,61% 100%,58% 70%,55% 100%,52% 70%,49% 100%,46% 70%,43% 100%,40% 70%,37% 100%,34% 70%,31% 100%,28% 70%,25% 100%,22% 70%,19% 100%,16% 70%,13% 100%,10% 70%,7% 100%,4% 70%,0 100%)";

// Body of a torn pack: zigzag top edge that matches ZIG's bottom edge (7% of the height).
const TEAR_BODY = `polygon(${Array.from({ length: 35 }, (_, i) => `${(i * 100) / 34}% ${i % 2 ? 7 : 4.9}%`).join(",")},100% 100%,0 100%)`;

/** Our own booster pack art (no third-party artwork). */
export function PackArt({ className = "", label = "Pitch Black", flap = true, src }: { className?: string; label?: string; flap?: boolean; src?: string | null }) {
  if (src)
    return (
      <div className={`pack-art relative aspect-[23/36] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Sobre de la colección"
          className="h-full w-full rounded-[6px] object-cover drop-shadow-[0_24px_40px_rgba(0,0,0,.55)]"
          style={flap ? { clipPath: TEAR_BODY } : undefined}
          draggable={false}
        />
        {flap && (
          <div
            className="flap absolute inset-x-0 top-0 h-[7%] origin-[0%_100%] rounded-t-[6px] bg-cover bg-top"
            style={{ backgroundImage: `url(${src})`, backgroundSize: "100% auto", clipPath: ZIG }}
          />
        )}
      </div>
    );
  return (
    <div className={`pack-art relative aspect-[23/36] ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-[14px] bg-[linear-gradient(160deg,#2a1f68_0%,#4b2fa6_45%,#8a3fb5_80%,#c24fa8_100%)] shadow-[0_24px_60px_rgba(0,0,0,.55)]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(125deg,rgba(255,255,255,0)_0_18px,rgba(255,255,255,.07)_18px_20px)]" />
        <div className="absolute -left-1/4 top-[12%] h-[70%] w-[150%] rotate-[-18deg] bg-[radial-gradient(ellipse_at_center,rgba(94,227,255,.35),transparent_60%)]" />
        <div className="absolute inset-x-0 top-[22%] flex flex-col items-center gap-[6%]">
          <LogoIcon size={96} className="w-[46%] drop-shadow-[0_8px_20px_rgba(0,0,0,.45)]" />
          <Wordmark className="text-[clamp(14px,2.2vw,30px)] drop-shadow-[0_2px_0_#1d1450]" />
          <span className="rounded-full bg-black/35 px-[8%] py-[2%] text-[clamp(7px,0.9vw,11px)] font-semibold uppercase tracking-[0.18em] text-white/85">{label}</span>
        </div>
        <div className="foil absolute inset-x-0 bottom-0 h-[5%] opacity-90" style={{ clipPath: "polygon(0 30%,3% 0,6% 30%,9% 0,12% 30%,15% 0,18% 30%,21% 0,24% 30%,27% 0,30% 30%,33% 0,36% 30%,39% 0,42% 30%,45% 0,48% 30%,51% 0,54% 30%,57% 0,60% 30%,63% 0,66% 30%,69% 0,72% 30%,75% 0,78% 30%,81% 0,84% 30%,87% 0,90% 30%,93% 0,96% 30%,100% 0,100% 100%,0 100%)" }} />
        <span className="poster absolute top-[9%] right-[6%] flex flex-col items-center rounded-md bg-[#12131c] px-[4%] py-[1.5%] leading-[0.9] text-white">
          <span className="text-[clamp(12px,1.6vw,22px)]">10</span>
          <span className="text-[clamp(6px,.6vw,8px)] tracking-wider">CARDS</span>
        </span>
      </div>
      {flap && <div className="flap foil absolute inset-x-0 top-0 h-[7%] origin-[0%_100%] rounded-t-[14px]" style={{ clipPath: ZIG }} />}
    </div>
  );
}

/** Hit card shown when the pack is ripped. Uses a real catalog image when we have one. */
function HitCard({ image, name }: { image?: string | null; name?: string | null }) {
  return (
    <div className="hit-card relative aspect-[63/88] w-full overflow-hidden rounded-[12px] shadow-[0_0_0_2px_rgba(255,216,79,.85),0_0_60px_rgba(255,216,79,.45),0_30px_60px_rgba(0,0,0,.5)]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name ?? "Hit reciente"} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="foil flex h-full w-full p-[5%]">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-[8px] bg-[radial-gradient(circle_at_50%_38%,#5a3ad6,#1c1446_70%)]">
            <div className="flex items-center justify-between px-[7%] pt-[6%]">
              <span className="poster text-[clamp(13px,1.5vw,20px)] text-white">HOLO HIT</span>
              <span className="poster text-[clamp(11px,1.2vw,16px)] text-gold">★★★</span>
            </div>
            <div className="relative flex flex-1 items-center justify-center">
              <div className="absolute h-[70%] w-[70%] rounded-full bg-[conic-gradient(from_0deg,#5ee3ff,#b388ff,#f383d6,#ffd84f,#5ee3ff)] opacity-50 blur-xl" />
              <LogoIcon size={120} className="relative w-[62%]" />
            </div>
            <span className="mx-[7%] mb-[7%] rounded bg-black/40 py-[3%] text-center text-[clamp(8px,.8vw,11px)] font-bold uppercase tracking-[0.2em] text-gold">Special Illustration</span>
          </div>
        </div>
      )}
      <span className="sheen pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}

/** Card back shown mid-spin, before the reveal. */
function CardBack({ src }: { src?: string | null }) {
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-full w-full rounded-[12px] object-cover" draggable={false} />;
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[12px] border-[7px] border-[#2b2160] bg-[radial-gradient(circle_at_50%_42%,#6a45e0,#2a1f68_55%,#1a1442)] shadow-[0_24px_60px_rgba(0,0,0,.5)]">
      <div className="absolute inset-[10%] rounded-[50%] border-2 border-white/10" />
      <LogoIcon size={110} className="relative w-[52%] drop-shadow-[0_6px_18px_rgba(0,0,0,.5)]" />
    </div>
  );
}

function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={`sparkle absolute ${className}`} style={style} aria-hidden="true">
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="currentColor" />
    </svg>
  );
}

const BG_PACKS = [
  { c: "left-[4%] top-[8%] w-[13%] rotate-[-14deg]", d: "-40px,-20px" },
  { c: "left-[2%] top-[52%] w-[17%] rotate-[-22deg]", d: "-50px,20px" },
  { c: "left-[22%] top-[60%] w-[10%] rotate-[12deg]", d: "-20px,40px" },
  { c: "right-[24%] top-[6%] w-[10%] rotate-[16deg]", d: "20px,-40px" },
  { c: "right-[3%] top-[18%] w-[15%] rotate-[20deg]", d: "50px,-10px" },
  { c: "right-[6%] top-[58%] w-[14%] rotate-[-12deg]", d: "40px,30px" },
];

export default function RipPanel({
  todayLabel,
  hitImage,
  hitName,
  setLabel,
  packImage,
  cardBackImage,
  video,
}: {
  todayLabel?: string | null;
  hitImage?: string | null;
  hitName?: string | null;
  setLabel?: string;
  packImage?: string | null;
  cardBackImage?: string | null;
  /** Pre-rendered rip video (desktop). The CSS stage stays as the phone version. */
  video?: { webm: string; mp4: string; poster: string } | null;
}) {
  const [on, setOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const vid = useRef<HTMLVideoElement>(null);

  // Same trick as the reference: still poster at rest, video on top that plays once per hover and holds its last frame.
  useEffect(() => {
    const v = vid.current;
    if (!v || !video) return;
    if (on) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      setPlaying(false);
      const t = setTimeout(() => {
        v.pause();
        v.currentTime = 0;
      }, 350);
      return () => clearTimeout(t);
    }
  }, [on, video]);

  // Touch screens have no hover: play the rip on a loop instead.
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const t = setInterval(() => setOn((v) => !v), 3400);
    return () => clearInterval(t);
  }, []);

  return (
    <Link
      href="/packs"
      data-on={on}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOn(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={() => setOn(false)}
      className="rip group relative isolate block overflow-hidden rounded-[28px] border border-[#2a2d44] bg-[#1a1b2a] text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-b2"
    >
      <div className="rip-bg absolute inset-0 -z-10" aria-hidden="true" />
      {BG_PACKS.map((p, i) => (
        <div key={i} className={`bg-pack absolute ${p.c} ${video ? "sm:hidden" : ""}`} style={{ "--d": p.d } as React.CSSProperties} aria-hidden="true">
          <PackArt flap={false} label={setLabel} src={packImage} />
        </div>
      ))}

      {todayLabel && (
        <span className="absolute top-5 right-6 z-10 flex items-center gap-2 text-[15px] font-medium text-[#d7d9ec] sm:text-[17px]">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.7.8 2.7 2.5 3 5.2" />
          </svg>
          {todayLabel}
        </span>
      )}

      {video && (
        <div className="relative hidden aspect-[1445/784] w-full sm:block" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={video.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <video
            ref={vid}
            muted
            playsInline
            preload="auto"
            poster={video.poster}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
          >
            <source src={video.webm} type="video/webm" />
            <source src={video.mp4} type="video/mp4" />
          </video>
          <div className="absolute inset-x-0 -bottom-px h-28 bg-gradient-to-b from-transparent via-[#1d1f36]/70 to-[#1d1f36]" />
        </div>
      )}
      <div className={`relative mx-auto flex h-[360px] max-w-[560px] items-end justify-center sm:h-[540px] ${video ? "sm:hidden" : ""}`}>
        <div className="orb absolute top-[14%] left-1/2 h-[68%] w-[70%] -translate-x-1/2 rounded-full" aria-hidden="true" />
        {/* Sequence (from packs.com frames): pack grows → spins fast with motion blur and turns into a card back
            → sparkles → flips to reveal the hit. One 3D element, three faces, driven by CSS keyframes. */}
        <div className="rip-spin absolute bottom-[7%] h-[266px] w-[170px] sm:h-[430px] sm:w-[275px]">
          <div className="face face-pack absolute inset-0">
            <PackArt label={setLabel} src={packImage} />
          </div>
          <div className="face face-back absolute top-1/2 left-1/2 aspect-[63/88] w-[104%]">
            <CardBack src={cardBackImage} />
          </div>
          <div className="face face-front absolute top-1/2 left-1/2 aspect-[63/88] w-[104%]">
            <HitCard image={hitImage} name={hitName} />
          </div>
        </div>
        <div className="rip-sparkles pointer-events-none absolute bottom-[7%] h-[266px] w-[200px] sm:h-[430px] sm:w-[320px]" aria-hidden="true">
          <Sparkle className="top-[-4%] left-[-10%] w-10 text-white" style={{ animationDelay: "0s" }} />
          <Sparkle className="top-[8%] right-[-12%] w-8 text-[#ffd84f]" style={{ animationDelay: ".25s" }} />
          <Sparkle className="top-[44%] left-[-18%] w-6 text-[#f383d6]" style={{ animationDelay: ".5s" }} />
          <Sparkle className="bottom-[24%] right-[-16%] w-14 text-[#f3c6ff]" style={{ animationDelay: ".15s" }} />
          <Sparkle className="bottom-[0%] left-[-4%] w-5 text-white" style={{ animationDelay: ".4s" }} />
          <Sparkle className="top-[-10%] right-[18%] w-6 text-[#5ee3ff]" style={{ animationDelay: ".65s" }} />
          <Sparkle className="top-[20%] left-[6%] w-4 text-white" style={{ animationDelay: ".8s" }} />
        </div>
        <span className="rip-badge absolute bottom-[-30px] left-1/2 z-10 flex h-[68px] w-[68px] -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-[#3a3d58] bg-[#2a2c42] shadow-[0_10px_30px_rgba(0,0,0,.5)]">
          <LogoIcon size={40} />
          <span className="brand-grad absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#2a2c42]">
            <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M2.5 6.2 5 8.6 9.5 3.6" fill="none" stroke="#12131c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </span>
      </div>

      <div className={`relative z-10 flex flex-col items-center gap-4 px-6 pt-14 pb-12 text-center ${video ? "sm:-mt-16 sm:pt-0" : ""}`}>
        <span className="rip-cta poster flex items-center gap-4 rounded-2xl px-7 py-3 text-[clamp(36px,5vw,52px)] leading-none">
          Rip Packs
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
        <p className="m-0 max-w-[620px] text-balance text-[17px] leading-relaxed text-[#b9bcd4] sm:text-[19px]">
          10 sobres <em>sellados de fábrica</em> cada mes en tu puerta. La misma emoción de siempre… <strong className="italic text-white">y tu jalón queda en el muro.</strong>
        </p>
      </div>
    </Link>
  );
}

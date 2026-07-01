import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * HeroWithStatsCountUp
 * - Drop into any React + Tailwind project.
 * - Replace `content` JSON to customize headline, image, and stats.
 * - Numbers animate on first visibility via requestAnimationFrame.
 */
export default function HeroWithStatsCountUp() {
  // ===== Hardcoded, easy-to-edit content JSON =====
  const content = {
    hero: {
      heading: " ",
      subheading: " ",
      imageUrl: "/images/img2.jpeg", // swap with your own
      imageAlt: "Celebration photo under balloons",
    },
    stats: [
      {
        id: "revenue",
        prefix: "",
        value: 1600,
        suffix: "+",
        label: "Uddannet gennem Value Profits System",
      },
      {
        id: "reviews",
        prefix: "+",
        value: 30000000,
        suffix: " kr.",
        label: "Omsat gennem vores strategi",
      },
      {
        id: "members",
        prefix: "",
        value: 130,
        suffix: "+",
        label: "Aktive i VP Protocol",
      },
      {
        id: "entrepreneurs",
        prefix: "",
        value: 5000,
        suffix: "+",
        label: "Dokumenterede Value Bets delt offenligt",
      },
    ],
    // Animation settings
    animation: { durationMs: 1600, ease: "outCubic" },
  };

  return (
    <section className="w-full bg-transparent text-white">
      <div className="relative mx-auto max-w-7xl">
        {/* Hero image */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-b-3xl bg-neutral-900 shadow-2xl">
          <img
            src={content.hero.imageUrl}
            alt={content.hero.imageAlt}
            className="h-full w-full object-cover"
            loading="eager"
          />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />
          {/* Headline */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-10">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-balance text-2xl font-semibold sm:text-3xl md:text-4xl"
            >
              {content.hero.heading}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-1 max-w-3xl text-sm text-neutral-200 sm:text-base"
            >
              {content.hero.subheading}
            </motion.p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mx-3 -mt-8 sm:mx-6">
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-neutral-900/70 p-4 shadow-xl ring-1 ring-white/10 backdrop-blur  sm:grid-cols-4 sm:gap-4 sm:p-6">
            {content.stats.map((s, idx) => (
              <StatCard
                key={s.id}
                {...s}
                durationMs={content.animation.durationMs}
                delayMs={idx * 80}
                ease={content.animation.ease}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Utilities =====
function StatCard({
  prefix = "",
  value,
  suffix = "",
  label,
  durationMs,
  delayMs = 0,
  ease = "outCubic",
}) {
  const { ref, hasIntersected } = useOnceOnIntersect({
    rootMargin: "0px 0px -20% 0px",
  });
  const target = useMemo(() => Number(value) || 0, [value]);
  const display = useCountUp({
    to: hasIntersected ? target : 0,
    durationMs,
    delayMs,
    ease,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: hasIntersected ? 1 : 0, y: hasIntersected ? 0 : 8 }}
      transition={{ duration: 0.4, delay: delayMs / 1000 }}
      className="flex flex-col items-center gap-1 rounded-xl p-2 text-center sm:gap-2"
    >
      <div className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
        <span aria-hidden>
          {prefix}
          {formatNiceNumber(display)}
          {suffix}
        </span>
        <span className="sr-only">
          {prefix}
          {target}
          {suffix}
        </span>
      </div>
      <div className="text-xs text-neutral-300 sm:text-sm">{label}</div>
    </motion.div>
  );
}

function useOnceOnIntersect(options) {
  const ref = useRef(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    if (!ref.current || hasIntersected) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          io.disconnect();
        }
      });
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [options, hasIntersected]);

  return { ref, hasIntersected };
}

function useCountUp({ to, durationMs = 1500, delayMs = 0, ease = "outCubic" }) {
  const [n, setN] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    let start = 0;
    const d = Math.max(200, durationMs);
    const run = (ts) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / d);
      setN(to * easings[ease](t));
      if (t < 1) raf.current = requestAnimationFrame(run);
    };
    const id = setTimeout(() => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(run);
    }, Math.max(0, delayMs));
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf.current);
    };
  }, [to, durationMs, delayMs, ease]);

  return n;
}

const easings = {
  linear: (t) => t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
};

function formatNiceNumber(n) {
  // Use compact notation but preserve full integers for small values
  if (n < 1000) return Math.round(n).toString();
  return Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

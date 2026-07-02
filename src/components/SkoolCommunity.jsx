import React from "react";

const SKOOL_URL = "https://www.skool.com/the-value-profits-system";
const CALENDLY_URL = "https://calendly.com/vpsystem1/30min";

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export default function SkoolCommunity() {
  const benefits = [
    {
      icon: (
        <svg {...iconProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: "Aktivt community",
      description: "Få adgang til vores Skool-gruppe med 1600+ medlemmer",
    },
    {
      icon: (
        <svg {...iconProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      title: "Gratis indhold",
      description: "Kom i gang med gratis ressourcer og læremateriale",
    },
    {
      icon: (
        <svg {...iconProps}>
          <path d="M14 9a2 2 0 0 1-2 2H6l-3 3V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2z" />
          <path d="M18 8h1a2 2 0 0 1 2 2v9l-3-3h-5a2 2 0 0 1-2-2v-1" />
        </svg>
      ),
      title: "Daglige diskussioner",
      description: "Del analyser, stil spørgsmål og lær af erfarne bettere",
    },
    {
      icon: (
        <svg {...iconProps}>
          <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
        </svg>
      ),
      title: "Se resultater",
      description: "Følg med i medlemmernes succeser og profit",
    },
  ];

  const stats = [
    { label: "Aktivitet i gruppen", value: "Dagligt" },
    { label: "Gns. responstid", value: "< 1 time" },
    { label: "Medlemstilfredshed", value: "4.8/5 ★" },
  ];

  return (
    <section className="container-xl pt-8 md:pt-12 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="card-accent p-6 sm:p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* Venstre – tekst */}
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold tracking-wide mb-4">
                100% GRATIS
              </div>
              <h2 className="h2 mb-4">
                Bliv en del af vores{" "}
                <span className="glow-accent">community</span>
              </h2>
              <p className="text-[var(--ink-2)] mb-8 leading-relaxed">
                Vil du lære mere om value betting, før du investerer? Få adgang
                til vores gratis Skool-community, hvor du kan:
              </p>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6 mb-8">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-[var(--accent)]/40 pl-4"
                  >
                    <h4 className="font-bold text-[var(--ink)] mb-1 leading-snug">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-[var(--ink-2)] leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={SKOOL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-accent inline-flex items-center justify-center gap-2"
                >
                  <span>Tilmeld dig gratis community</span>
                  <span aria-hidden>→</span>
                </a>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline-accent inline-flex items-center justify-center"
                >
                  Book et gratis intromøde
                </a>
              </div>

              <p className="text-sm text-[var(--muted)] mt-4">
                Ingen kreditkort påkrævet · Tilmeld dig på 30 sekunder
              </p>
            </div>

            {/* Højre – Skool-billede med 1600+ overlay + stats (klik = Skool) */}
            <a
              href={SKOOL_URL}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] transition-colors hover:border-[var(--accent)]/50"
            >
              <div className="relative overflow-hidden">
                <img
                  src="/images/Skool.png"
                  alt="Value Profits System community på Skool"
                  className="h-full w-full aspect-[16/11] object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-4xl md:text-5xl font-black glow-accent leading-none">
                    1600+
                  </div>
                  <div className="mt-1 text-[var(--ink-2)]">Aktive medlemmer</div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-[var(--ink-2)]">
                      {s.label}
                    </span>
                    <span className="font-bold text-[var(--accent)]">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

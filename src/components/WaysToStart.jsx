import React from "react";

const APP_URL = "https://app.valueprofitsprotocol.dk/login";
const SKOOL_URL = "https://www.skool.com/the-value-profits-system";
const EVENTS_URL = "https://asgerleerskov.dk/";

const iconProps = {
  width: 40,
  height: 40,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const cards = [
  {
    image: "/images/Skool.png",
    placeholderIcon: (
      <svg {...iconProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: "Gratis Skool-kursus",
    description:
      "Lær grundprincipperne bag value betting helt gratis i vores community på Skool.",
    cta: "Se kurset på Skool",
    href: SKOOL_URL,
  },
  {
    image: "/images/App.png",
    placeholderIcon: (
      <svg {...iconProps}>
        <rect x="6" y="2" width="12" height="20" rx="2.5" />
        <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
      </svg>
    ),
    title: "Opret adgang til vores app",
    description:
      "Få et gratis indblik i systemet og se hvordan vores setup fungerer i praksis.",
    cta: "Opret gratis bruger",
    href: APP_URL,
  },
  {
    image: "/images/Event.png",
    placeholderIcon: (
      <svg {...iconProps}>
        <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
        <line x1="16" y1="2.5" x2="16" y2="6.5" />
        <line x1="8" y1="2.5" x2="8" y2="6.5" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Deltag i vores gratis events",
    description:
      "Vær med til live-sessions og events, hvor vi gennemgår systemet og svarer på spørgsmål.",
    cta: "Se kommende events",
    href: EVENTS_URL,
  },
];

export default function WaysToStart() {
  return (
    <section className="container-xl pt-8 md:pt-12 relative z-10">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="h2">
          Tre <span className="glow-accent">gratis måder</span> at komme i gang
        </h2>
        <p className="mt-3 text-lg text-[var(--ink-2)]">
          Start med kurset, prøv appen, eller mød os live – helt uden binding.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {cards.map((c, i) => (
          <div key={i} className="card-accent overflow-hidden flex flex-col">
            {/* Billede øverst (pladsholder indtil rigtige billeder indsættes) */}
            <div className="aspect-[16/10] w-full overflow-hidden">
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-[var(--accent)]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(71,250,190,0.14), rgba(71,250,190,0.02))",
                  }}
                >
                  {c.placeholderIcon}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl font-bold mb-2 text-[var(--ink)] leading-snug">
                {c.title}
              </h3>
              <p className="text-[var(--ink-2)] text-[15px] leading-relaxed flex-1">
                {c.description}
              </p>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="btn-accent mt-5 block w-full text-center"
              >
                {c.cta}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

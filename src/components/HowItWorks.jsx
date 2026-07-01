import React from "react";

const iconProps = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export default function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
      title: "Du har måske prøvet at oddse før",
      description:
        "…men endte med at tabe penge. I Value Profits handler det ikke om held, men om at forstå og udnytte fejl i markedet.",
    },
    {
      icon: (
        <svg {...iconProps}>
          <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
        </svg>
      ),
      title: "Du vil skabe en ekstra indkomst",
      description:
        "…men uden at skulle sælge, poste content eller overtale nogen. Her får du et system, der arbejder for dig, ikke omvendt.",
    },
    {
      icon: (
        <svg {...iconProps}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      ),
      title: "Du stoler mere på data end tilfældigheder",
      description:
        "…og du ved, at logik altid vinder over held. Her får du en struktureret model, hvor tal og disciplin bestemmer resultatet.",
    },
  ];

  return (
    <section className="container-xl pt-8 md:pt-12 relative z-10">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="h2 glow-accent">Er det her dig?</h2>
        <p className="mt-3 text-lg text-[var(--ink-2)]">
          Tre typer mennesker, der klarer sig ekstra godt i Value Profits System.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <div
            key={i}
            className="card-accent p-6 text-left flex flex-col"
          >
            <div
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "rgba(71, 250, 190, 0.12)",
                color: "var(--accent)",
                border: "1px solid rgba(71, 250, 190, 0.25)",
              }}
            >
              {step.icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-[var(--ink)] leading-snug">
              {step.title}
            </h3>
            <p className="text-[var(--ink-2)] text-[15px] leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-[var(--ink-2)] mb-4">
          Lyder det som dig? Så er det værd at tage en snak.
        </p>
        <a
          href="https://calendly.com/vpsystem1/30min"
          target="_blank"
          rel="noreferrer"
          className="btn-accent"
        >
          Book et gratis intromøde
        </a>
      </div>
    </section>
  );
}

import React, { useState } from "react";

const faqData = [
  {
    q: "Hvordan fungerer jeres garanti?",
    a: "Vi er så sikre på vores system, at vi stiller en klar resultatgaranti. Følger du det fuldt ud som anvist og ser du stadig ikke resultater, står vi på mål for det. Risikoen er vores – ikke din.",
  },
  {
    q: "Skal jeg have erfaring?",
    a: "Nej. Systemet er bygget til både begyndere og øvede. Du guides trin for trin.",
  },
  {
    q: "Hvor hurtigt kan jeg komme i gang?",
    a: "Typisk samme dag. Du får onboarding, værktøjer, dine første VP bets og community-adgang.",
  },
  {
    q: "Er det her gambling?",
    a: "Nej.+EV er en strategi. Vi udnytter markedsfejl baseret på data og disciplin — ikke “spil for sjov”.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="h2 text-white">Ofte stillede spørgsmål</h2>
      <div className="mt-6 space-y-3">
        {faqData.map((item, i) => {
          const active = open === i;
          return (
            <div key={i} className="faq-item">
              <button
                className="faq-q"
                onClick={() => setOpen(active ? null : i)}
              >
                <span>{item.q}</span>
                <span
                  className={`transition-transform ${
                    active ? "rotate-180" : ""
                  }`}
                >
                  ⌄
                </span>
              </button>
              {active && <div className="faq-a">{item.a}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

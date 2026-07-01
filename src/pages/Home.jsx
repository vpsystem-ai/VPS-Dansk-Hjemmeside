import React from "react";
import Testimonials from "../components/Testimonials";
import TestimonialCards from "../components/TestimonialCards";
import FAQ from "../components/FAQAccordion";
import BetList from "../components/BetList";
import VidalyticsEmbed from "../components/VidalyticsEmbed";
import WaysToStart from "../components/WaysToStart";
import SkoolCommunity from "../components/SkoolCommunity";
import HeroWithAvatars from "../components/HeroWithAvatars";
import SEO from "../components/SEO";
import {
  organizationSchema,
  websiteSchema,
  courseSchema,
  faqSchema,
} from "../utils/schema";
import { Link } from "react-router-dom";
import HeroWithStatsCountUp from "../components/HeroWithStatsCountUp";

export default function Home() {
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema, courseSchema, faqSchema],
  };

  return (
    <>
      <SEO schema={combinedSchema} />
      <div className="relative">
        {/* Accent glows */}
        <div className="bg-glow top-24 -left-10"></div>
        <div className="bg-glow bottom-24 right-0"></div>

        {/* HERO */}
        <section className="container-xl pt-8 md:pt-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero with Avatars */}
            <HeroWithAvatars />

            {/* Main Headline */}
            <div className="flex justify-center mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center">
                <span className="block md:whitespace-nowrap">Skab en <span className="glow-accent">Stabil indkomst</span> <span className="text-[var(--ink)]">gennem et system,</span></span>
                <span className="block text-[var(--ink)] md:whitespace-nowrap">
                  der udnytter <span className="glow-accent">fejl </span>i det globale marked
                </span>
              </h1>
            </div>

            <p className="mt-6 text-lg text-[var(--ink-2)] max-w-2xl mx-auto leading-relaxed">
              En dokumenteret, disciplineret strategi til at identificere{" "}
              <span className="text-[var(--accent)] font-semibold">
                +EV væddemål
              </span>{" "}
              og bygge langsigtet profit. Få adgang til komplet kursus,
              værktøjer og community.
            </p>

            {/* VIDEO */}
            <section id="video" className="container-xl pt-4 md:pt-6 relative z-10">
              <div className="max-w-3xl mx-auto">
                <VidalyticsEmbed />
              </div>
            </section>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 scale-75 md:scale-[1.125]">
              <Link
                to="/overblik"
                className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--accent)] bg-[#47fabe1a] px-6 py-3 text-lg font-semibold text-[var(--accent)] transition-colors hover:bg-[#47fabe2e]"
              >
                Forstå det på 30 sekunder →
              </Link>
              <a
                href="https://calendly.com/vpsystem1/30min"
                target="_blank"
                rel="noreferrer"
                className="btn-accent text-base px-5 py-2.5"
              >
                Se om det giver mening for dig?
              </a>
            </div>
            {/* Social proof badges */}
            <div className="mt-8 md:mt-10 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {[
                { value: "1600+", label: "Aktive medlemmer" },
                { value: "+EV", label: "Fokus" },
                { value: "7+", label: "År erfaring" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-2 py-4 sm:py-5"
                >
                  <div className="text-2xl md:text-4xl font-black glow-accent">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-10 divider" />
          </div>
        </section>

        {/* KOM I GANG – 3 indgange */}
        <WaysToStart />

        {/* CTA til overblik-siden */}
        <section className="container-xl pt-6 md:pt-8 relative z-10 text-center">
          <p className="text-[var(--ink-2)] mb-4">
            Nysgerrig på hvordan det egentlig virker? Leg med tallene og forstå
            det på 30 sekunder.
          </p>
          <Link
            to="/overblik"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--accent)] bg-[#47fabe1a] px-6 py-3 text-lg font-semibold text-[var(--accent)] transition-colors hover:bg-[#47fabe2e]"
          >
            Prøv det selv: value betting, surebetting &amp; arbitrage →
          </Link>
        </section>

        {/* INTERVIEW TESTIMONIALS */}
        <section className="container-xl pt-8 md:pt-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="h2 glow-accent">De tog chancen. Se, hvad der skete.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "ydZtkbFdZiU",
              "tbRX6kVjg_k",
              "_2t7Eh7cZ28",
              "yqEog9O9xIw",
              "UkKf1zk704c",
              "qLv59zF9CLQ",
            ].map((id) => (
              <div key={id} className="rounded-xl overflow-hidden aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${id}`}
                  title={`Interview ${id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="text-center">
          <h2 className="h2 glow-accent mt-6 md:mt-8 mb-6 md:mb-8">Lidt om os</h2>
          <HeroWithStatsCountUp />
        </div>

        {/* PERFORMANCE / BETLIST */}
        <section className="container-xl pt-8 md:pt-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="h2 glow-accent">Performance & gennemsigtighed</h2>
            <p className="mt-3 text-[var(--ink-2)]">
              Se historik, winrate, gennemsnitsodds og simuleret saldo.
            </p>
          </div>
          <BetList />
        </section>

        {/* REAL RESULTS SHOWCASE */}
        {/* <section className="container-xl pt-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="h2 glow-accent">Dokumenterede resultater</h2>
            <p className="mt-3 text-[var(--ink-2)]">
              Se rigtige skærmbilleder fra vores medlemmer
            </p>
          </div>
          <div className="card-modern p-6 rounded-2xl">
            <img
              src="/images/img1.png"
              alt="Dokumenterede resultater fra Value Profits System medlemmer viser konsistent profit gennem value betting strategi"
              className="w-full rounded-xl shadow-2xl"
              loading="lazy"
              width="1200"
              height="800"
            />
          </div>
        </section> */}

        {/* SKOOL COMMUNITY */}
        <SkoolCommunity />

        {/* TESTIMONIALS */}
        <section id="testimonials" className="container-xl pt-8 md:pt-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="h2 glow-accent">Hør flere historier inde på skool.</h2>
          </div>
          <TestimonialCards />
        </section>

        {/* FAQ + CTA */}
        <section className="container-xl pt-8 md:pt-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="h2 glow-accent">Ofte stillede spørgsmål</h2>
            <p className="mt-3 text-[var(--ink-2)]">
              Find svar på de mest almindelige spørgsmål om systemet
            </p>
          </div>
          <FAQ />

          {/* Final CTA */}
          <div className="mt-8 md:mt-12 max-w-3xl mx-auto">
            <div className="card-accent p-8 md:p-10 text-center">
              <h3 className="h2 mb-4">Klar til at komme i gang?</h3>
              <p className="text-lg text-[var(--ink-2)] mb-6 max-w-xl mx-auto">
                Book en gratis 30 minutters demo, eller tilmeld dig vores gratis
                Skool community for at lære mere.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://calendly.com/vpsystem1/30min"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-accent text-lg px-8 py-4"
                >
                  Book et gratis intromøde
                </a>
                <a
                  href="https://www.skool.com/the-value-profits-system/about"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline-accent text-lg px-8 py-4"
                >
                  Tilmeld gratis community
                </a>
              </div>
              <p className="text-sm text-[var(--muted)] mt-6">
                Ingen kreditkort påkrævet • 100% risikofrit
              </p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm">
            <Link to="/betingelser" className="link-accent">
              Handelsbetingelser
            </Link>
            <Link to="/privatliv" className="link-accent">
              Privatlivspolitik
            </Link>
          </div>
        </section>

        <footer className="container-xl py-14 text-center text-[var(--muted)] relative z-10">
          © {new Date().getFullYear()} Value Profits System
        </footer>
      </div>
    </>
  );
}

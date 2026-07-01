import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="nav">
      <nav className="container-xl h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-black tracking-tight text-[18px] glow-accent"
        >
          Value Profits System
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/overblik"
            className="link-accent hover:text-[var(--accent)] transition-colors"
          >
            Sådan virker det
          </Link>
          <Link
            to="/#video"
            className="link-accent hover:text-[var(--accent)] transition-colors"
          >
            Se demo
          </Link>
          <a
            href="https://www.skool.com/the-value-profits-system/about"
            target="_blank"
            rel="noreferrer"
            className="link-accent hover:text-[var(--accent)] transition-colors"
          >
            Gratis community
          </a>
          <Link
            to="/#testimonials"
            className="link-accent hover:text-[var(--accent)] transition-colors"
          >
            Anmeldelser
          </Link>
        </div>

        {/* Desktop CTA */}
        <a
          href="https://calendly.com/vpsystem1/30min"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex btn-accent text-sm px-3 py-1.2"
        >
          Book intromøde
        </a>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[var(--accent)]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--panel)]">
          <div className="container-xl py-4 flex flex-col gap-3">
            <Link
              to="/overblik"
              className="link-accent py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sådan virker det
            </Link>
            <Link
              to="/#video"
              className="link-accent py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Se demo
            </Link>
            <a
              href="https://www.skool.com/the-value-profits-system/about"
              target="_blank"
              rel="noreferrer"
              className="link-accent py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gratis community
            </a>
            <Link
              to="/#testimonials"
              className="link-accent py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Anmeldelser
            </Link>
            <a
              href="https://calendly.com/vpsystem1/30min"
              target="_blank"
              rel="noreferrer"
              className="btn-accent mt-2 text-center"
            >
              Book intromøde
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

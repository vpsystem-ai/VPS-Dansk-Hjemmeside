import React, { useState } from "react";

const APP_URL = "https://app.valueprofitsprotocol.dk/login";
const STORAGE_KEY = "vps_app_launch_bar";

/**
 * Nyheds-bjælke øverst på sitet: "Vores nye app er live".
 * Kan lukkes, og valget huskes via localStorage.
 */
export default function AnnouncementBar() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "dismissed";
    } catch {
      return true;
    }
  });

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="relative z-50"
      style={{ background: "var(--accent)", color: "#0b0c0e" }}
    >
      <a
        href={APP_URL}
        target="_blank"
        rel="noreferrer"
        className="container-xl flex items-center justify-center gap-2 px-10 py-2.5 text-center text-sm font-semibold hover:opacity-90"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="rounded-full bg-[#0b0c0e] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[var(--accent)]">
            Nyhed
          </span>
          Vores nye app er live — opret en gratis bruger nu
        </span>
        <span aria-hidden className="hidden font-extrabold sm:inline">
          →
        </span>
      </a>
      <button
        onClick={dismiss}
        aria-label="Luk besked"
        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-lg font-bold leading-none text-[#0b0c0e] transition-colors hover:bg-[#0b0c0e]/15"
      >
        ×
      </button>
    </div>
  );
}

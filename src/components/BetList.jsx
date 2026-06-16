// src/components/BetList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/** Konfiguration */
const SHEET_ID = "1XUh7MYzti9EnVh4w5Jw7vre2dg6nYyWYMH9rg9VhPd0";
const availableMonths = [
  { label: "Juni 25", sheet: "Bet tracker_Juni25" },
  { label: "Juli 25", sheet: "Bet tracker_Juli25" },
  { label: "August 25", sheet: "Bet tracker_August25" },
  { label: "September 25", sheet: "Bet tracker_September25" },
  { label: "Oktober 25", sheet: "Bet tracker_Oktober25" },
  { label: "November 25", sheet: "Bet tracker_November25" },
  { label: "December 25", sheet: "Bet tracker_December25" },
  { label: "Januar 26", sheet: "Bet tracker_Januar26" },
  { label: "Februar 26", sheet: "Bet tracker_Februar26" },
  { label: "Marts 26", sheet: "Bet tracker_Marts26" },
  { label: "April 26", sheet: "Bet tracker_April26" },
  { label: "Maj 26", sheet: "Bet tracker_Maj26" },
  { label: "Juni 26", sheet: "Bet tracker_Juni26" },
];

/** Hjælpere */
const canon = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
// Hvert måneds-ark har et dashboard øverst; selve bet-tabellen starter
// længere nede. Vi finder header-rækken (Dato/Odds/Unit/Status) og læser
// hvilke nøgler de fire kolonner ligger under, og henter så data derfra.
const parseSheet = (rows) => {
  const cols = { dato: null, odds: null, unit: null, status: null };
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const entries = Object.entries(rows[i]);
    const found = {};
    for (const [k, v] of entries) {
      const cv = canon(v);
      if (cv === "dato") found.dato = k;
      else if (cv === "odds") found.odds = k;
      else if (cv === "unit") found.unit = k;
      else if (cv === "status") found.status = k;
    }
    if (found.dato) {
      Object.assign(cols, found);
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return [];
  return rows.slice(headerIdx + 1).map((r) => ({
    dato: r[cols.dato],
    odds: r[cols.odds],
    unit: r[cols.unit],
    status: r[cols.status],
  }));
};
const parseNumber = (v) => {
  if (v == null) return 0;
  const s = String(v).trim().replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};
const parseDateDA = (s) => {
  if (!s) return 0;
  const m = String(s)
    .trim()
    .match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) return 0;
  const [_, d, mo, y] = m;
  const t = new Date(+y, +mo - 1, +d).getTime();
  return Number.isFinite(t) ? t : 0;
};
const normStatus = (v) => {
  const s = String(v || "").toLowerCase();
  if (s.startsWith("vun")) return "Vundet";
  if (s.startsWith("tab")) return "Tabt";
  if (s.startsWith("pus") || s === "push") return "Push";
  if (s.startsWith("vaer") || s.startsWith("vær")) return "Værdi";
  return "Ukendt";
};
const kr = (n) =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: 0,
  }).format(Math.round(n));

export default function BetList() {
  const [selectedMonth, setSelectedMonth] = useState("Alle");
  const [bankroll, setBankroll] = useState(10000);
  const [stake, setStake] = useState(400);
  const [bets, setBets] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [debug, setDebug] = useState(false);
  const dref = useRef(debug);
  useEffect(() => {
    dref.current = debug;
  }, [debug]);
  const log = (...a) => dref.current && console.log("[BetList]", ...a);

  useEffect(() => {
    const s = Math.max(1, Math.round((+bankroll || 0) * 0.03));
    setStake(s);
  }, [bankroll]);

  useEffect(() => {
    let dead = false;
    const fetchMonth = async (sheet) => {
      const url = `https://opensheet.elk.sh/${SHEET_ID}/${sheet}`;
      const res = await axios.get(url);
      return res.data || [];
    };
    const run = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        let parsed = [];
        if (selectedMonth === "Alle") {
          const all = await Promise.all(
            availableMonths.map((m) => fetchMonth(m.sheet))
          );
          parsed = all.flatMap((rows) => parseSheet(rows));
        } else {
          parsed = parseSheet(await fetchMonth(selectedMonth));
        }
        const normalized = parsed
          .map((r, idx) => ({
            i: idx,
            dato: r.dato || "",
            datoTS: parseDateDA(r.dato),
            odds: parseNumber(r.odds),
            unit: parseNumber(r.unit),
            status: normStatus(r.status),
          }))
          .filter((o) => o.datoTS > 0)
          .sort((a, b) => a.datoTS - b.datoTS);

        if (dead) return;
        setBets(normalized);
        log("Rækker normaliseret:", normalized.length);
      } catch (e) {
        console.error(e);
        if (!dead) setErrorMsg("Kunne ikke hente data.");
      } finally {
        if (!dead) setLoading(false);
      }
    };
    run();
    return () => {
      dead = true;
    };
  }, [selectedMonth]);

  const simSaldo = useMemo(() => {
    let saldo = +bankroll || 0;
    bets.forEach((b) => {
      const indsats = stake * b.unit;
      if (b.status === "Vundet") saldo += b.odds * indsats - indsats;
      else if (b.status === "Tabt") saldo -= indsats;
    });
    return Math.round(saldo);
  }, [bets, stake, bankroll]);

  const roiPct = useMemo(() => {
    if (!bankroll) return 0;
    return ((simSaldo - bankroll) / bankroll) * 100;
  }, [simSaldo, bankroll]);

  const history = useMemo(() => {
    let saldo = +bankroll || 0;
    return bets.map((b, i) => {
      const indsats = stake * b.unit;
      if (b.status === "Vundet") saldo += b.odds * indsats - indsats;
      else if (b.status === "Tabt") saldo -= indsats;
      return { index: i + 1, saldo: Math.round(saldo) };
    });
  }, [bets, stake, bankroll]);

  /* Skeleton components */
  const SkeletonCard = () => (
    <div className="card-accent p-5 animate-pulse">
      <div className="h-4 bg-[var(--line)] rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-[var(--line)] rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-[var(--line)] rounded w-1/4"></div>
    </div>
  );

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );

  /** UI */
  return (
    <div className="space-y-6">
      {/* Filter/inputs */}
      <div className="card-accent p-6">
        <div className="flex flex-wrap items-center gap-3">
          {availableMonths.map((m) => (
            <button
              key={m.sheet}
              onClick={() => {
                setSelectedMonth(m.sheet);
                setVisibleCount(12);
              }}
              className={`chip ${
                selectedMonth === m.sheet ? "chip--active" : ""
              }`}
            >
              {m.label}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedMonth("Alle");
              setVisibleCount(12);
            }}
            className={`chip ${selectedMonth === "Alle" ? "chip--active" : ""}`}
          >
            Alle måneder
          </button>

          <div className="ml-auto flex items-center gap-3">
            <label className="text-sm text-[var(--ink-2)]">Bankroll</label>
            <input
              type="number"
              value={bankroll}
              onChange={(e) => setBankroll(Number(e.target.value) || 0)}
              className="input-accent w-32 text-right"
            />
            <span className="text-sm text-accent font-semibold">
              1 unit = {stake} kr
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <>
          {/* KPI skeleton */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card-accent p-6 animate-pulse">
              <div className="h-4 bg-[var(--line)] rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-[var(--line)] rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-[var(--line)] rounded w-1/4"></div>
            </div>
            <div className="card-accent p-6 animate-pulse">
              <div className="h-full bg-[var(--line)] rounded"></div>
            </div>
          </div>

          {/* Bet cards skeleton */}
          <SkeletonGrid />
        </>
      ) : (
        <>
          {/* KPI + graf */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card-accent p-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[15px]">
                <div className="text-[var(--ink-2)]">Total væddemål</div>
                <div className="font-semibold text-accent">{bets.length}</div>

                <div className="text-[var(--ink-2)]">Vundet</div>
                <div className="font-semibold text-accent">
                  {bets.filter((b) => b.status === "Vundet").length}
                </div>

                <div className="text-[var(--ink-2)]">Tabt</div>
                <div className="font-semibold">
                  {bets.filter((b) => b.status === "Tabt").length}
                </div>

                <div className="text-[var(--ink-2)]">Winrate</div>
                <div className="font-semibold text-accent">
                  {Math.round(
                    (bets.filter((b) => b.status === "Vundet").length /
                      (bets.length || 1)) *
                      100
                  ) || 0}
                  %
                </div>

                <div className="text-[var(--ink-2)]">Vækst i %</div>
                <div className="font-semibold text-accent">
                  {roiPct.toFixed(1)}%
                </div>

                <div className="text-[var(--ink-2)]">Gns. odds</div>
                <div className="font-semibold text-accent">
                  {(
                    bets.reduce((a, b) => a + (b.odds || 0), 0) /
                    (bets.length || 1)
                  ).toFixed(2)}
                </div>

                <div className="text-[var(--ink-2)]">Gns. sats/spil</div>
                <div className="font-semibold text-accent">
                  {kr(
                    bets.reduce((a, b) => a + (b.unit || 0) * stake, 0) /
                      (bets.length || 1)
                  )}
                </div>

                <div className="text-[var(--ink-2)]">Aktiv måned</div>
                <div className="font-semibold">
                  {selectedMonth === "Alle"
                    ? "Alle"
                    : availableMonths.find((m) => m.sheet === selectedMonth)
                        ?.label || selectedMonth}
                </div>
              </div>

              <p className="mt-5 text-base font-extrabold">
                Din saldo ville være:{" "}
                <span className="glow-accent">{kr(simSaldo)}</span>
              </p>
            </div>

            <div className="card-accent p-6">
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid stroke="rgba(71,250,190,.18)" />
                    <XAxis
                      dataKey="index"
                      stroke="#8b929a"
                      tick={{ fill: "#8b929a", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#8b929a"
                      tick={{ fill: "#8b929a", fontSize: 12 }}
                      domain={["dataMin", "dataMax"]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0f1113",
                        border: "1px solid rgba(71,250,190,.35)",
                        borderRadius: "8px",
                        color: "#e9eef2",
                      }}
                      labelStyle={{ color: "#ffffff", fontWeight: 800 }}
                      formatter={(v, name) =>
                        name === "saldo" ? [`${v} kr`, "Saldo"] : [v, name]
                      }
                      labelFormatter={(l) => `Væddemål #${l}`}
                    />
                    <ReferenceLine
                      y={+bankroll || 0}
                      stroke="rgba(71,250,190,.6)"
                      strokeDasharray="6 6"
                    />
                    <Line
                      type="linear"
                      dataKey="saldo"
                      stroke="#47FABE"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive
                      animationDuration={500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Kort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {bets.slice(0, visibleCount).map((b, i) => {
              const indsats = stake * b.unit;
              const res = b.status === "Vundet";
              const push = b.status === "Push";
              const profit = res
                ? Math.round(b.odds * indsats)
                : push
                ? Math.round(indsats)
                : -Math.round(indsats);
              return (
                <div key={i} className="card-accent p-5">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs text-[var(--muted)]">
                      {b.dato || "—"}
                    </p>
                    <p className="text-xs font-semibold">
                      {res ? (
                        <span className="text-accent">Vundet</span>
                      ) : push ? (
                        <span className="text-accent/80">Push</span>
                      ) : (
                        <span className="text-rose-300">{b.status}</span>
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-[var(--ink-2)]">
                    Odds: {b.odds?.toString().replace(".", ",")}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    Unit: {b.unit} • Indsats: {kr(indsats)}
                  </p>
                  <p
                    className={`mt-1 text-base font-semibold ${
                      profit > 0 ? "text-accent" : ""
                    }`}
                  >
                    {profit > 0 ? "+" : ""}
                    {profit} kr
                  </p>
                </div>
              );
            })}
          </div>

          {visibleCount < bets.length && (
            <div className="text-center">
              <button
                onClick={() => setVisibleCount((v) => v + 9)}
                className="btn-outline-accent"
              >
                Vis flere væddemål
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

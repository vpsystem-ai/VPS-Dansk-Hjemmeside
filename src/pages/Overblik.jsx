import React, { useMemo, useState } from "react";

/**
 * Overblik – interaktiv "prøv selv"-side der forklarer value betting,
 * surebetting og arbitrage helt simpelt og visuelt.
 *
 * Tænkt som markedsførings-hook: en besøgende skal på 30 sekunder kunne
 * lege med tallene og forstå princippet UDEN at have set kurset.
 */

/* ---------- helpers ---------- */
const dk = (n, d = 2) =>
  (isFinite(n) ? n : 0).toLocaleString("da-DK", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
const kr = (n) => `${dk(Math.round(n), 0)} kr`;
const pct = (n, d = 1) => `${dk(n, d)}%`;

// deterministisk RNG så grafen er stabil mellem renders (kun ændrer sig med input)
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GOOD = "#47fabe";
const BAD = "#ff5c7a";

const APP_SIGNUP_URL = "https://app.valueprofitsprotocol.dk/login";
const CALENDLY_URL = "https://calendly.com/vpsystem1/30min";
const SKOOL_URL = "https://www.skool.com/the-value-profits-system";

/* ---------- ordbog (hover-forklaringer for nybegyndere) ---------- */
function Term({ children, def }) {
  return (
    <span
      tabIndex={0}
      className="group relative inline cursor-help border-b border-dotted border-[var(--accent)] font-medium text-[var(--accent)] outline-none"
    >
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-60 max-w-[80vw] -translate-x-1/2 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3 text-left text-xs font-normal leading-relaxed text-[var(--ink-2)] shadow-xl group-hover:block group-focus:block group-focus-within:block">
        {def}
      </span>
    </span>
  );
}

// tidshorisont-markør: value = langsigtet (fokus), sure/arb = kortsigtet
function Horizon({ kind }) {
  const long = kind === "long";
  const c = long ? GOOD : "#ffca57";
  return (
    <span
      className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
      style={{ color: c, background: `${c}1a`, border: `1px solid ${c}44` }}
    >
      {long ? "🎯 Langsigtet · vores fokus" : "⚡ Kortsigtet · godt til at komme i gang"}
    </span>
  );
}

/* ---------- små UI-byggeklodser ---------- */
function Slider({ label, value, onChange, min, max, step, format, help }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-sm text-[var(--ink-2)]">
          {label}
          {help && (
            <>
              {" "}
              <Term def={help}>
                <span className="text-xs">ⓘ</span>
              </Term>
            </>
          )}
        </span>
        <span className="text-sm font-semibold text-[var(--accent)]">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: "var(--accent)" }}
      />
    </label>
  );
}

function Verdict({ ok, okText, noText }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
      style={{
        color: ok ? GOOD : BAD,
        background: `${ok ? GOOD : BAD}1a`,
        border: `1px solid ${ok ? GOOD : BAD}55`,
      }}
    >
      <span>{ok ? "✓" : "✕"}</span>
      {ok ? okText : noText}
    </div>
  );
}

function StatRow({ label, value, strong, color }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[var(--line)] py-2 last:border-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span
        className={strong ? "text-base font-bold" : "text-sm font-medium"}
        style={{ color: color || "var(--ink)" }}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------- "Hvad analyserer vi?"-panel ---------- */
const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
const ANALYSIS = [
  {
    title: "H2H historik",
    sub: "De seneste indbyrdes møder mellem de to hold",
    def: "H2H betyder “head-to-head” – altså de seneste gange præcis de to hold har mødt hinanden. Nogle hold ligger typisk godt eller skidt mod bestemte modstandere, uanset hvordan formen ellers er.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    title: "Seneste 20 kampe per hold",
    sub: "Hjemme- og udestatistik for begge hold",
    def: "Vi kigger på formen i de sidste 20 kampe – og skelner mellem hjemme- og udekampe, fordi mange hold spiller markant bedre på hjemmebane end ude.",
    icon: (
      <svg {...iconProps}>
        <path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
      </svg>
    ),
  },
  {
    title: "Modelbaserede fair odds",
    sub: "Poisson-model + empirisk blending",
    def: "Vores statistiske model regner ud, hvor sandsynligt hvert resultat er, og blander det med, hvad der historisk faktisk er sket. Resultatet er de “fair odds” – de reelle odds, før bookmakeren lægger sin avance oveni.",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3v18M5 21h14M6 7h12M6 7l-3 6a3 3 0 0 0 6 0zM18 7l-3 6a3 3 0 0 0 6 0z" />
      </svg>
    ),
  },
  {
    title: "Odds bevægelse",
    sub: "Realtidshistorik fra alle bookmakere",
    def: "Vi følger, hvordan oddsene ændrer sig i realtid hos alle bookmakere. Store bevægelser afslører ofte, hvor pengene – og de skarpe spillere – lægger sig, før kampen starter.",
    icon: (
      <svg {...iconProps}>
        <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
      </svg>
    ),
  },
  {
    title: "Konsensus prismodel",
    sub: "Bookmakere sammenlignes",
    def: "Vi sammenligner priserne på tværs af mange bookmakere for at finde markedets “sande” pris. Så kan vi se, hvem der stikker ud med for høje odds – altså hvor der er value.",
    icon: (
      <svg {...iconProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Dommere",
    sub: "Hvem dømmer kampen?",
    def: "Vi kigger på, hvem dommeren er i den enkelte kamp. Nogle dommere giver markant flere kort og frispark end andre – det påvirker især kort-, frispark- og hjørnemarkederne.",
    icon: (
      <svg {...iconProps}>
        <rect x="5" y="5" width="9" height="13" rx="1.5" />
        <rect x="10" y="7" width="9" height="13" rx="1.5" />
      </svg>
    ),
  },
  {
    title: "Vejrforhold",
    sub: "Indflydelse på mål, hjørner og kort",
    def: "Regn, vind og temperatur påvirker spillet. Kraftig vind eller regn giver typisk færre mål og flere fejl – det tager vi højde for på mål-, hjørne- og kortmarkederne.",
    icon: (
      <svg {...iconProps}>
        <path d="M17.5 19a4.5 4.5 0 1 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6.5 19z" />
      </svg>
    ),
  },
];

function AnalysisPanel() {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="border-b border-[var(--line)] p-6">
        <h3 className="text-lg font-bold text-[var(--accent)]">
          Hvad analyserer vi?
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ink-2)]">
          Du skal ikke selv regne noget ud. For hver eneste kamp henter vores
          system automatisk en masse data og beregner de rigtige (“fair”) odds –
          og sammenligner dem med bookmakernes. Her er nogle af de ting, vi
          kigger på:
        </p>
        <p className="mt-2 text-xs font-medium text-[var(--accent)]">
          👆 Hold musen over hver linje (eller tap på mobil) for en forklaring
        </p>
      </div>
      <ul>
        {ANALYSIS.map((a) => (
          <li
            key={a.title}
            tabIndex={0}
            className="group relative cursor-help border-b border-[var(--line)] p-4 outline-none transition-colors last:border-0 hover:bg-[var(--panel-2)] focus-visible:bg-[var(--panel-2)]"
          >
            <div className="flex items-start gap-4">
              <span className="mt-0.5 text-[var(--ink-2)]">{a.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                  {a.title}
                  <span className="text-xs font-normal text-[var(--muted)] opacity-60 transition-opacity group-hover:opacity-0">
                    ⓘ
                  </span>
                </div>
                <div className="text-sm text-[var(--muted)]">{a.sub}</div>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ink-2)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                      {a.def}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* forklaring: manuelt vs. automatisk */}
      <div className="border-t border-[var(--line)] p-6 text-sm leading-relaxed text-[var(--ink-2)]">
        <p>
          Det lyder komplekst – men du kan sagtens lære at gøre det{" "}
          <b className="text-[var(--ink)]">manuelt</b>. Det viser vi dig skridt
          for skridt i vores videomateriale.
        </p>
        <p className="mt-2">
          Eller lad{" "}
          <b className="text-[var(--accent)]">vores system gøre det hele
          automatisk</b>
          . Du får adgang til hele vores setup, så alt det her regnes ud for dig
          – og du kun skal bruge tiden på det sidste, nemme skridt: at placere
          dine bets hos din foretrukne bookmaker.
        </p>
      </div>
    </div>
  );
}

/* ---------- 1) VALUE BETTING ---------- */
function ValueTool() {
  const [chance, setChance] = useState(52); // din vurdering af den reelle chance (%)
  const [odds, setOdds] = useState(2.1); // bookmakerens odds
  const stake = 100;

  const p = chance / 100;
  const impliedChance = 100 / odds; // bookmakerens "skjulte" chance
  const fairOdds = 100 / chance; // hvad odds BURDE være
  const evKr = stake * (odds * p - 1); // forventet gevinst pr. bet
  const evPct = (odds * p - 1) * 100;
  const hasValue = odds > fairOdds;

  // illustration af 200 bets á 100 kr (starter i 0 kr).
  // Kurven svinger realistisk, men "trækkes" hen på den matematisk forventede
  // slutsaldo (= forventet gevinst pr. bet × antal bets), så grafen ALTID er
  // konsistent med resultatet: value = grøn/plus, ingen value = rød/minus.
  const chart = useMemo(() => {
    const N = 900;
    const rng = mulberry32(Math.round(chance * 1000 + odds * 100));
    const expectedTotal = N * stake * (odds * p - 1);
    // rå tilfældig gang (viser variansen/svingningerne)
    const raw = [0];
    let bal = 0;
    for (let i = 1; i <= N; i++) {
      bal += rng() < p ? stake * (odds - 1) : -stake;
      raw.push(bal);
    }
    const rawFinal = raw[N];
    // korrigér forløbet, så det ender præcis på den forventede slutsaldo
    const pts = raw.map((v, i) => v - (rawFinal - expectedTotal) * (i / N));
    let min = 0;
    let max = 0;
    for (const v of pts) {
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
    const W = 520;
    const H = 210;
    const padLeft = 30;
    const padRight = 16;
    const padTop = 12;
    const padBot = 26;
    const range = max - min || 1;
    const x = (i) => padLeft + (i / N) * (W - padLeft - padRight);
    const y = (v) => padTop + (1 - (v - min) / range) * (H - padTop - padBot);
    const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
    const ticks = [100, 300, 500, 700, 900].map((t) => ({ t, x: x(t) }));
    return {
      d,
      zeroY: y(0),
      W,
      H,
      padLeft,
      padBot,
      final: expectedTotal,
      startX: x(0),
      startY: y(0),
      endX: x(N),
      endY: y(expectedTotal),
      ticks,
    };
  }, [chance, odds, p]);

  return (
    <div className="space-y-8">
    <div className="grid gap-6 lg:grid-cols-2">
      {/* controls + forklaring */}
      <div className="space-y-5">
        <div>
          <Horizon kind="long" />
        </div>
        <p className="text-[var(--ink-2)]">
          <b className="text-[var(--ink)]">Value betting</b> (også kaldet{" "}
          <b className="text-[var(--ink)]">+EV betting</b> eller EV+ betting – det
          er præcis det samme) er kernen i vores system – det er her, den store,
          langsigtede profit ligger. Det handler om at satse, når{" "}
          <Term def="En bookmaker er et spilfirma (fx Bet365, Unibet eller Betano), der tilbyder odds og tager imod dine væddemål.">
            bookmakeren
          </Term>{" "}
          giver dig for høje{" "}
          <Term def="Odds fortæller, hvor meget du får udbetalt. Odds 2,00 betyder, at 100 kr bliver til 200 kr, hvis du vinder.">
            odds
          </Term>{" "}
          i forhold til, hvor sandsynligt udfaldet i virkeligheden er. Så tjener
          du på <b className="text-[var(--accent)]">den lange bane</b> – præcis som
          et kasino.
        </p>

        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-5">
          <Slider
            label="Den reelle chance for at det sker"
            help="Hvor ofte tror du udfaldet faktisk sker? Sætter du den til 60%, betyder det: hvis kampen blev spillet 100 gange, ville det ske i 60 af dem. Vores system regner det her ud for dig automatisk."
            value={chance}
            onChange={setChance}
            min={5}
            max={95}
            step={1}
            format={(v) => pct(v, 0)}
          />
          <Slider
            label="Odds bookmakeren tilbyder"
            help="Odds er det, bookmakeren udbetaler. Odds 2,00 betyder, at 100 kr bliver til 200 kr, hvis du vinder. Jo højere odds, jo mere får du – men jo sjældnere sker det typisk."
            value={odds}
            onChange={setOdds}
            min={1.1}
            max={5}
            step={0.01}
            format={(v) => dk(v, 2)}
          />
          <p className="text-xs text-[var(--muted)]">
            Indsats: 100 kr pr. bet
          </p>
        </div>

        <p className="text-sm text-[var(--ink-2)]">
          Bookmakerens odds på {dk(odds)} svarer til, at de tror udfaldet kun
          sker <b>{pct(impliedChance)}</b> af gangene. Tror du selv det sker{" "}
          <b>{pct(chance, 0)}</b> af gangene, så{" "}
          {hasValue ? (
            <span style={{ color: GOOD }}>
              får du betalt for meget = value ✓
            </span>
          ) : (
            <span style={{ color: BAD }}>
              får du betalt for lidt = ingen value ✕
            </span>
          )}
          .
        </p>
      </div>

      {/* resultat */}
      <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <Verdict
          ok={hasValue}
          okText="VALUE BET – skalerbar profit"
          noText="INGEN VALUE"
        />

        <div className="mt-2">
          <StatRow label="Bookmakerens odds" value={dk(odds)} />
          <StatRow
            label={
              <Term def="Odds kan regnes om til en chance i procent (100 ÷ odds). Det er den chance, bookmakeren 'tror på'. Er den lavere end din egen vurdering, er der value.">
                …svarer til en chance på
              </Term>
            }
            value={pct(impliedChance)}
          />
          <StatRow
            label={
              <Term def="Fair odds er de 'ærlige' odds, der passer præcis til den chance, du har vurderet – uden bookmakerens avance. Er bookmakerens odds HØJERE end fair odds, er der value.">
                Fair odds (det den burde være)
              </Term>
            }
            value={dk(fairOdds)}
          />
          <StatRow
            label={
              <Term def="Din gennemsnitlige gevinst pr. bet på den lange bane. Er tallet grønt (plus), tjener du over tid. Er det rødt (minus), taber du over tid. Enkelte bets kan altid vindes eller tabes – det er gennemsnittet, der tæller.">
                Forventet gevinst pr. bet
              </Term>
            }
            value={`${evKr >= 0 ? "+" : ""}${kr(evKr)} (${
              evPct >= 0 ? "+" : ""
            }${pct(evPct)})`}
            strong
            color={hasValue ? GOOD : BAD}
          />
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <p className="text-xs text-[var(--muted)]">
              Din saldo over 900 bets á 100 kr:
            </p>
            <p className="text-sm">
              <span className="text-[var(--muted)]">Efter 900 bets: </span>
              <b style={{ color: chart.final >= 0 ? GOOD : BAD }}>
                {chart.final >= 0 ? "+" : "−"}
                {kr(Math.abs(chart.final))}
              </b>
            </p>
          </div>
          <svg viewBox={`0 0 ${chart.W} ${chart.H}`} className="w-full">
            {/* 0-linje = du går i nul */}
            <line
              x1={chart.padLeft}
              x2={chart.W - 4}
              y1={chart.zeroY}
              y2={chart.zeroY}
              stroke="var(--muted)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={chart.padLeft - 6}
              y={chart.zeroY + 3}
              fontSize="10"
              textAnchor="end"
              fill="var(--muted)"
            >
              0 kr
            </text>

            {/* kurven */}
            <path
              d={chart.d}
              fill="none"
              stroke={chart.final >= 0 ? GOOD : BAD}
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* start- og slutpunkt */}
            <circle cx={chart.startX} cy={chart.startY} r="3" fill="var(--muted)" />
            <circle
              cx={chart.endX}
              cy={chart.endY}
              r="4"
              fill={chart.final >= 0 ? GOOD : BAD}
            />

            {/* antal bets langs bunden */}
            {chart.ticks.map((tk, idx) => (
              <text
                key={tk.t}
                x={tk.x}
                y={chart.H - 6}
                fontSize="10"
                fill="var(--muted)"
                textAnchor={
                  idx === 0
                    ? "start"
                    : idx === chart.ticks.length - 1
                    ? "end"
                    : "middle"
                }
              >
                {tk.t} bets
              </text>
            ))}
          </svg>

          <div className="mt-3 space-y-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel-2)] p-3 text-xs leading-relaxed text-[var(--ink-2)]">
            <p className="font-semibold text-[var(--ink)]">
              Sådan læser du grafen:
            </p>
            <p>
              • Den stiplede linje er <b>0 kr</b> – der hvor du hverken har tjent
              eller tabt.
            </p>
            <p>
              • Er kurven <b style={{ color: GOOD }}>over stregen</b>, er du i plus.
              Er den <b style={{ color: BAD }}>under stregen</b>, er du i minus.
            </p>
            <p>
              • Hvert bet svinger op og ned – men er der value, ender kurven i{" "}
              <b style={{ color: GOOD }}>plus (grøn)</b>. Uden value ender den i{" "}
              <b style={{ color: BAD }}>minus (rød)</b>.
            </p>
          </div>
        </div>
      </div>
    </div>

      <AnalysisPanel />
    </div>
  );
}

/* ---------- 2+3) SUREBETTING / ARBITRAGE (samme princip) ---------- */
function computeArb(oddsArr, budget) {
  const inv = oddsArr.map((o) => 1 / o);
  const margin = inv.reduce((a, b) => a + b, 0);
  const stakes = inv.map((i) => (budget * i) / margin);
  const ret = budget / margin; // hvert udfald returnerer det samme
  const profit = ret - budget;
  return {
    margin,
    stakes,
    ret,
    profit,
    profitPct: (1 / margin - 1) * 100,
    isSure: margin < 1,
  };
}

function SureTool({
  labels,
  defaults,
  intro,
  note,
  defaultBudget = 1000,
  maxBudget = 5000,
  fixedBudget = null,
}) {
  const [odds, setOdds] = useState(defaults);
  const [budgetState, setBudget] = useState(defaultBudget);
  const budget = fixedBudget ?? budgetState;
  const setOne = (i, v) => setOdds((prev) => prev.map((x, j) => (j === i ? v : x)));
  const r = computeArb(odds, budget);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <p className="text-[var(--ink-2)]">{intro}</p>

        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-5">
          {labels.map((lb, i) => (
            <Slider
              key={lb.key}
              label={`Odds hos ${lb.book} – ${lb.name}`}
              value={odds[i]}
              onChange={(v) => setOne(i, v)}
              min={1.1}
              max={6}
              step={0.01}
              format={(v) => dk(v, 2)}
            />
          ))}
          {fixedBudget ? (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[var(--ink-2)]">
                Dit indskud (fast beløb){" "}
                <Term def="Du indbetaler ca. 10.700 kr fordelt på de 16 bookmakere. Velkomstbonusserne (også ca. 10.700 kr) løfter din samlede kapital til ca. 21.000 kr. Dit indskud får du igen; profitten kommer fra bonussen. Se hele profit-forløbet i modellen nedenfor.">
                  <span className="text-xs">ⓘ</span>
                </Term>
              </span>
              <span className="text-sm font-semibold text-[var(--accent)]">
                {kr(budget)}
              </span>
            </div>
          ) : (
            <Slider
              label="Samlet beløb du vil satse"
              value={budget}
              onChange={setBudget}
              min={100}
              max={maxBudget}
              step={100}
              format={(v) => kr(v)}
            />
          )}
        </div>

        <p className="text-sm text-[var(--ink-2)]">
          Trick'et: fordel pengene på tværs af bookmakere, så du{" "}
          <b>får mere tilbage, end du satsede – uanset hvem der vinder</b>. Så er
          profitten garanteret.
        </p>

        {note}
      </div>

      <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <Verdict
          ok={r.isSure}
          okText="SUREBET – garanteret profit"
          noText="Ikke en surebet lige nu"
        />

        <div className="mt-2 overflow-hidden rounded-lg border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--panel-2)] text-[var(--muted)]">
              <tr>
                <th className="p-2 text-left font-medium">Udfald</th>
                <th className="p-2 text-right font-medium">Odds</th>
                <th className="p-2 text-right font-medium">Sæt</th>
                <th className="p-2 text-right font-medium">Returnerer</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((lb, i) => (
                <tr key={lb.key} className="border-t border-[var(--line)]">
                  <td className="p-2">
                    <div className="font-medium text-[var(--ink)]">{lb.name}</div>
                    <div className="text-xs text-[var(--muted)]">{lb.book}</div>
                  </td>
                  <td className="p-2 text-right">{dk(odds[i])}</td>
                  <td className="p-2 text-right">{kr(r.stakes[i])}</td>
                  <td
                    className="p-2 text-right font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    {kr(r.ret)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <StatRow
            label={
              <Term def="Et teknisk mål for bookmakernes samlede 'pris'. Jo lavere, jo bedre for dig. Du behøver ikke tænke på tallet – kig bare på, om du får flere penge igen, end du satsede.">
                Markedsprocent
              </Term>
            }
            value={pct(r.margin * 100)}
          />
          <StatRow label="Du satser i alt" value={kr(budget)} />
          <StatRow
            label="Du får igen (uanset udfald)"
            value={kr(r.ret)}
            color={r.isSure ? GOOD : BAD}
          />
          <StatRow
            label="Garanteret profit"
            value={`${r.profit >= 0 ? "+" : ""}${kr(r.profit)} (${
              r.profitPct >= 0 ? "+" : ""
            }${pct(r.profitPct)})`}
            strong
            color={r.isSure ? GOOD : BAD}
          />
        </div>
        {!r.isSure && (
          <p className="text-xs text-[var(--muted)]">
            Skru op for én af odds'ene, indtil du får mere igen, end du satser –
            så opstår den garanterede profit.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- 4) RENTE-RENTE / COMPOUNDING ---------- */
function niceCeil(x) {
  if (x <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(x)));
  const n = x / pow;
  const s = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return s * pow;
}

function CompoundTool() {
  const [start, setStart] = useState(10000);
  const [numBets, setNumBets] = useState(900);
  const [stakePct, setStakePct] = useState(2.5); // % af bankroll
  const [evPct, setEvPct] = useState(5); // % af indsats
  const [compound, setCompound] = useState(true); // rente-rente til/fra
  const adjustEvery = 300; // justér indsats ~1 gang om måneden (~300 bets)

  const sim = useMemo(() => {
    const series = [start];
    let bal = start;
    // Med rente-rente: indsatsen genberegnes ud fra den voksende bankroll.
    // Uden: indsatsen er fast ud fra startbankrollen (lineær vækst).
    let blockStake = start * (stakePct / 100);
    for (let i = 1; i <= numBets; i++) {
      if (compound && (i - 1) % adjustEvery === 0) {
        blockStake = bal * (stakePct / 100);
      }
      bal += blockStake * (evPct / 100);
      series.push(bal);
    }
    return { series, final: bal, profit: bal - start };
  }, [start, numBets, stakePct, evPct, compound]);

  // graf-geometri
  const W = 600;
  const H = 300;
  const padL = 8;
  const padR = 62;
  const padT = 14;
  const padB = 26;
  const gridStep = niceCeil((sim.final * 1.1) / 4);
  const yMax = Math.max(gridStep, Math.ceil((sim.final * 1.05) / gridStep) * gridStep);
  const gridlines = [];
  for (let v = 0; v <= yMax + 1; v += gridStep) gridlines.push(v);

  const x = (i) => padL + (i / numBets) * (W - padL - padR);
  const y = (v) => H - padB - (v / yMax) * (H - padT - padB);

  // sampled path for ydeevne
  const stepEvery = Math.max(1, Math.floor(sim.series.length / 160));
  const samples = [];
  for (let i = 0; i < sim.series.length; i += stepEvery) samples.push(i);
  if (samples[samples.length - 1] !== sim.series.length - 1)
    samples.push(sim.series.length - 1);

  const topLine = samples.map((i) => `${x(i)},${y(sim.series[i])}`).join(" ");
  const greenArea =
    `M${x(0)},${y(start)} ` +
    samples.map((i) => `L${x(i)},${y(sim.series[i])}`).join(" ") +
    ` L${x(numBets)},${y(start)} Z`;
  const blackArea = `M${x(0)},${y(0)} L${x(numBets)},${y(0)} L${x(numBets)},${y(
    start
  )} L${x(0)},${y(start)} Z`;

  const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => Math.round(numBets * f));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      {/* venstre: input + strategi */}
      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Start bankroll (DKK)
          </label>
          <input
            type="number"
            min={100}
            step={500}
            value={start}
            onChange={(e) => setStart(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel-2)] px-4 py-3 text-lg font-semibold text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-5">
          <Slider
            label="Antal væddemål"
            help="Hvor mange bets du placerer i alt. Med vores system er omkring 900 bets realistisk på cirka 3 måneder."
            value={numBets}
            onChange={(v) => setNumBets(Math.round(v))}
            min={100}
            max={1500}
            step={50}
            format={(v) => `${dk(v, 0)} stk.`}
          />
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Strategi &amp; forventninger
          </p>
          <Slider
            label="Indsats pr. bet (% af bankroll)"
            help="Din bankroll er den samlede pulje, du spiller for. Her vælger du, hvor stor en del du satser pr. bet. En lille del ad gangen gør, at du kan tåle uheldige perioder undervejs."
            value={stakePct}
            onChange={setStakePct}
            min={1}
            max={5}
            step={0.5}
            format={(v) => pct(v, v % 1 ? 1 : 0)}
          />
          {stakePct >= 4 && (
            <p
              className="rounded-lg border p-2.5 text-xs leading-relaxed"
              style={{
                borderColor: "#ffca5744",
                background: "#ffca571a",
                color: "var(--ink-2)",
              }}
            >
              ⚠️ Med {pct(stakePct, stakePct % 1 ? 1 : 0)} pr. bet vokser risikoen
              for større tab i træk. De fleste vælger 2-3% for en mere stabil
              kurve.
            </p>
          )}
          <Slider
            label="Expected value (+ev, % af indsats)"
            help="Din gennemsnitlige fordel pr. bet. 5% betyder, at du i gennemsnit får 5 kr igen for hver 100 kr, du satser – på den lange bane."
            value={evPct}
            onChange={setEvPct}
            min={1}
            max={10}
            step={0.5}
            format={(v) => pct(v, v % 1 ? 1 : 0)}
          />
          <div className="border-t border-[var(--line)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[var(--ink-2)]">
                Rente-rente-effekt{" "}
                <Term def="Rente-rente betyder, at du geninvesterer din gevinst. Vi genberegner din indsats ca. hver 300 bets (~1 gang om måneden) ud fra din aktuelle bankroll – så når puljen vokser, satser du gradvist større beløb (og spreder dem typisk over flere bookmakere), og profitten vokser hurtigere. Slår du det fra, satser du hele tiden ud fra din startbankroll (lineær vækst).">
                  <span className="text-xs">ⓘ</span>
                </Term>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={compound}
                onClick={() => setCompound((c) => !c)}
                className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                style={{ background: compound ? "var(--accent)" : "var(--line)" }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full transition-transform"
                  style={{
                    transform: compound
                      ? "translateX(1.5rem)"
                      : "translateX(0.25rem)",
                    background: compound ? "#0b0c0e" : "var(--muted)",
                  }}
                />
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              {compound
                ? "Til: din indsats genberegnes ca. hver 300 bets (~1 gang om måneden) ud fra din aktuelle bankroll. Så tjener du mere, jo større din pulje bliver."
                : "Fra: du satser hele tiden det samme ud fra din startbankroll – væksten bliver lineær."}
            </p>
          </div>
        </div>
      </div>

      {/* højre: resultat + graf */}
      <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Forventet slut-bankroll (skattefrit)
          </p>
          <p className="text-4xl font-black tracking-tight text-[var(--accent)] sm:text-5xl">
            {dk(sim.final, 0)} DKK
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-1 border-t border-[var(--line)] pt-3 text-sm">
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: GOOD }}
            />
            <span className="text-[var(--muted)]">Estimeret profit:</span>
            <b className="text-[var(--ink)]">{dk(sim.profit, 0)} DKK</b>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#16302a]" />
            <span className="text-[var(--muted)]">Start bankroll:</span>
            <b className="text-[var(--ink)]">{dk(start, 0)} DKK</b>
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <defs>
            <linearGradient id="profFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOOD} stopOpacity="0.55" />
              <stop offset="100%" stopColor={GOOD} stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {/* gridlines + y-labels */}
          {gridlines.map((v) => (
            <g key={v}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(v)}
                y2={y(v)}
                stroke="var(--line)"
                strokeWidth="1"
              />
              <text
                x={W - padR + 6}
                y={y(v) + 4}
                fontSize="11"
                fill="var(--muted)"
              >
                {dk(v / 1000, 0)}k
              </text>
            </g>
          ))}

          <path d={blackArea} fill="#16302a" />
          <path d={greenArea} fill="url(#profFill)" />
          <polyline
            points={topLine}
            fill="none"
            stroke={GOOD}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* x-labels */}
          {xTicks.map((t, idx) => (
            <text
              key={t + "-" + idx}
              x={x(t)}
              y={H - 6}
              fontSize="11"
              fill="var(--muted)"
              textAnchor={idx === 0 ? "start" : idx === xTicks.length - 1 ? "end" : "middle"}
            >
              {t === 0 ? "Start" : `${dk(t, 0)} bets`}
            </text>
          ))}
        </svg>

        <p className="text-xs text-[var(--muted)]">
          Illustrativt eksempel baseret på de valgte forventninger. Reelle
          resultater svinger undervejs og er ikke garanteret.
        </p>
      </div>
    </div>
  );
}

/* ---------- potentiale: surebetting ---------- */
function SurebetPotential() {
  const [count, setCount] = useState(100);
  const [stake, setStake] = useState(1000);
  const [profitPct, setProfitPct] = useState(2.5);
  const perBet = (stake * profitPct) / 100;
  const total = count * perBet;

  // lineær graf: profitten vokser jævnt for hver surebet
  const W = 520;
  const H = 190;
  const padL = 34;
  const padR = 16;
  const padT = 12;
  const padB = 26;
  const gridStep = niceCeil((total * 1.1) / 4) || 1;
  const yMax = Math.max(gridStep, Math.ceil((total * 1.05) / gridStep) * gridStep);
  const gridlines = [];
  for (let v = 0; v <= yMax + 1; v += gridStep) gridlines.push(v);
  const px = (f) => padL + f * (W - padL - padR);
  const py = (v) => H - padB - (v / yMax) * (H - padT - padB);
  const area = `M${px(0)},${py(0)} L${px(1)},${py(total)} L${px(1)},${py(0)} Z`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div className="space-y-4">
        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-5">
          <Slider
            label="Antal surebets"
            help="Hvor mange surebets du laver i alt. Med vores system finder du dem automatisk – du skal bare placere dem."
            value={count}
            onChange={(v) => setCount(Math.round(v))}
            min={10}
            max={500}
            step={10}
            format={(v) => `${dk(v, 0)} stk.`}
          />
          <Slider
            label="Beløb pr. surebet"
            help="Hvor mange penge du fordeler ud på hver surebet. Jo større beløb, jo større profit i kroner – men risikoen er stadig nul."
            value={stake}
            onChange={(v) => setStake(Math.round(v))}
            min={200}
            max={5000}
            step={100}
            format={(v) => kr(v)}
          />
          <Slider
            label="Sikker profit pr. surebet"
            help="Den garanterede fortjeneste på hver surebet. Typisk 2–4% af beløbet – helt uden risiko for at tabe."
            value={profitPct}
            onChange={setProfitPct}
            min={1}
            max={5}
            step={0.5}
            format={(v) => pct(v, 1)}
          />
        </div>
        <p className="text-sm text-[var(--ink-2)]">
          Hver surebet giver ca.{" "}
          <b className="text-[var(--accent)]">{kr(perBet)}</b> i sikker profit.
          Gør du det {dk(count, 0)} gange, løber det op.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Samlet sikker profit
          </p>
          <p className="text-4xl font-black tracking-tight text-[var(--accent)] sm:text-5xl">
            {dk(total, 0)} DKK
          </p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {gridlines.map((v) => (
            <g key={v}>
              <line
                x1={padL}
                x2={W - padR}
                y1={py(v)}
                y2={py(v)}
                stroke="var(--line)"
                strokeWidth="1"
              />
              <text x={padL - 6} y={py(v) + 3} fontSize="10" textAnchor="end" fill="var(--muted)">
                {dk(v / 1000, 0)}k
              </text>
            </g>
          ))}
          <path d={area} fill={`${GOOD}22`} />
          <line
            x1={px(0)}
            y1={py(0)}
            x2={px(1)}
            y2={py(total)}
            stroke={GOOD}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
          <text x={px(0)} y={H - 8} fontSize="10" fill="var(--muted)" textAnchor="start">
            0
          </text>
          <text x={px(1)} y={H - 8} fontSize="10" fill="var(--muted)" textAnchor="end">
            {dk(count, 0)} surebets
          </text>
        </svg>
        <p className="text-xs text-[var(--muted)]">
          Sikker profit = ingen risiko for at tabe. Hver surebet lægger det samme
          oveni, så jo flere du laver, jo mere tjener du.
        </p>
      </div>
    </div>
  );
}

/* ---------- potentiale: arbitrage / velkomstbonusser ---------- */
const BONUS_STEPS = [
  {
    t: "Du indbetaler ca. 10.700 kr",
    s: "fordelt på de 16 bookmakere (alt efter hvor mange bonusser du claimer).",
  },
  {
    t: "Bonusserne løfter din kapital til ca. 21.000 kr",
    s: "– ca. 10.700 kr i gratis bonusser oveni dit eget indskud.",
  },
  {
    t: "Du gennemspiller det på 2-3 bets",
    s: "med arbitrage. Selve spillene koster typisk et par procent, men bonussen dækker det rigeligt.",
  },
  {
    t: "Du trækker pengene ud igen",
    s: "og sidder tilbage med ca. 4.-6.000 kr i profit. Pr. person.",
  },
];

function BonusSteps() {
  return (
    <div>
      <p className="mb-4 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
        Sådan fungerer det
      </p>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BONUS_STEPS.map((step, i) => (
          <li
            key={i}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: `${GOOD}22`, color: GOOD }}
            >
              {i + 1}
            </span>
            <div className="mt-3 text-sm font-bold leading-snug text-[var(--ink)]">
              {step.t}
            </div>
            <div className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              {step.s}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm leading-relaxed text-[var(--ink-2)]">
        <b className="text-[var(--ink)]">
          Hvorfor “kun” 4.-6.000 kr, når bonusserne er på 10.700 kr?
        </b>{" "}
        Fordi du ikke beholder hele bonussens værdi: mange bonusser er “free
        bets”, hvor du kun beholder gevinsten – ikke selve indsatsen. Og
        deposit-bonusser skal gennemspilles 2-3 gange, hvor hver runde koster et
        par procent. Tilsammen forvandler du realistisk{" "}
        <b className="text-[var(--ink)]">cirka halvdelen</b> af bonusserne til
        ren, udbetalbar profit.
      </div>
    </div>
  );
}

function BonusPotential() {
  const [perPerson, setPerPerson] = useState(5000);
  const [persons, setPersons] = useState(1);
  const total = perPerson * persons;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div className="space-y-4">
        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-5">
          <Slider
            label="Profit pr. person"
            help="Hvor meget du sidder tilbage med, efter du har gennemspillet bonusserne (selve spillene koster et par procent) og trukket dit indskud ud igen. Typisk 4.000-6.000 kr, når du udnytter alle bookmakerne."
            value={perPerson}
            onChange={(v) => setPerPerson(Math.round(v))}
            min={4000}
            max={6000}
            step={250}
            format={(v) => kr(v)}
          />
          <Slider
            label="Antal personer (dig + andre du hjælper)"
            help="Hjælper du andre igennem processen – et 'kundehold' – tjener hver person deres egne 4-5.000 kr. Det ganger dit potentiale op, og du kan gentage det uge efter uge."
            value={persons}
            onChange={(v) => setPersons(Math.round(v))}
            min={1}
            max={5}
            step={1}
            format={(v) => `${v} ${v === 1 ? "person" : "personer"}`}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Estimeret profit {persons > 1 ? "i alt" : ""} (skattefrit)
          </p>
          <p className="text-4xl font-black tracking-tight text-[var(--accent)] sm:text-5xl">
            {dk(total, 0)} DKK
          </p>
        </div>

        <div className="border-t border-[var(--line)] pt-3">
          <StatRow label="Profit pr. person" value={kr(perPerson)} />
          <StatRow
            label="Antal personer"
            value={`${persons} ${persons === 1 ? "person" : "personer"}`}
          />
          <StatRow
            label="Samlet profit"
            value={kr(total)}
            strong
            color={GOOD}
          />
        </div>

        <div
          className="rounded-xl border p-4 text-sm leading-relaxed"
          style={{
            borderColor: `${GOOD}55`,
            background: `${GOOD}12`,
            color: "var(--ink-2)",
          }}
        >
          👥 <b className="text-[var(--ink)]">Kør et kundehold:</b> hjælper du
          andre igennem processen, kan du tjene omkring{" "}
          <b className="text-[var(--accent)]">12.000 kr på cirka en uge</b> – og
          gentage det, så længe du vil hjælpe nye i gang.
        </div>

        <p className="text-xs text-[var(--muted)]">
          Uden risiko for at tabe – dit indskud får du igen, og profitten kommer
          fra de gratis bonusser. Følg altid den enkelte bookmakers regler.
        </p>
      </div>
    </div>
  );
}

/* ---------- fast eksempel: arbitrage-fordeling (ingen skydere) ---------- */
function ArbExample() {
  const odds = [2.95, 3.45, 2.55];
  const budget = 21400; // samlet kapital: indskud 10.700 + bonus 10.700
  const rows = [
    { name: "1 – Hjemmesejr", book: "Bookmaker 1" },
    { name: "X – Uafgjort", book: "Bookmaker 2" },
    { name: "2 – Udesejr", book: "Bookmaker 3" },
  ];
  const r = computeArb(odds, budget);

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6">
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
        Eksempel · sådan fordeles pengene
      </p>
      <p className="mb-4 text-sm leading-relaxed text-[var(--ink-2)]">
        Du deler din samlede kapital (indskud + bonus ≈ 21.000 kr) ud på de tre
        udfald hos forskellige bookmakere – så du får (næsten) det samme igen,
        uanset hvem der vinder.
      </p>

      <div className="overflow-hidden rounded-lg border border-[var(--line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--panel-2)] text-[var(--muted)]">
            <tr>
              <th className="p-2 text-left font-medium">Udfald</th>
              <th className="p-2 text-right font-medium">Odds</th>
              <th className="p-2 text-right font-medium">Sæt</th>
              <th className="p-2 text-right font-medium">Returnerer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-[var(--line)]">
                <td className="p-2">
                  <div className="font-medium text-[var(--ink)]">{row.name}</div>
                  <div className="text-xs text-[var(--muted)]">{row.book}</div>
                </td>
                <td className="p-2 text-right">{dk(odds[i])}</td>
                <td className="p-2 text-right">{kr(r.stakes[i])}</td>
                <td
                  className="p-2 text-right font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  {kr(r.ret)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">
        Når kampen er afgjort, <b className="text-[var(--ink)]">taber du</b> hos de
        bookmakere, hvor du satsede på det forkerte udfald – men{" "}
        <b className="text-[var(--ink)]">vinder</b> hos den, hvor du ramte det
        rigtige. Gevinsten (og bonussen dér) kører du så videre med.
      </p>

      <div className="mt-3">
        <div className="flex items-center justify-between border-b border-[var(--line)] py-2 text-sm">
          <span className="text-[var(--muted)]">Du fordeler i alt (indskud + bonus)</span>
          <span className="font-medium">{kr(budget)}</span>
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-[var(--muted)]">Du får igen (inkl. bonus)</span>
          <span className="font-medium">{kr(r.ret)}</span>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
        Bemærk: beløbet du får igen er <b>inklusiv bonus</b>. Bonussen kan ikke
        hæves med det samme – den skal gennemspilles først – så det er ikke ren,
        udbetalbar profit endnu.
      </p>

      <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-4 text-sm leading-relaxed text-[var(--ink-2)]">
        <b className="text-[var(--ink)]">Sådan ender du på profitten:</b> Dit
        indskud på <b className="text-[var(--ink)]">10.700 kr</b> får du igen. Ud
        af de <b className="text-[var(--ink)]">10.700 kr i gratis bonus</b> koster
        gennemspillet og free-bet-reglerne dig cirka halvdelen – så du sidder
        tilbage med ca.{" "}
        <b className="text-[var(--accent)]">4.500-5.000 kr</b> i ren profit.
      </div>
    </div>
  );
}

/* ---------- side ---------- */
const TABS = [
  { key: "value", label: "Value betting", badge: "Vores fokus" },
  { key: "sure", label: "Surebetting" },
  { key: "arb", label: "Arbitrage" },
];

export default function Overblik() {
  const [tab, setTab] = useState("value");

  return (
    <div className="container-xl py-12 text-[var(--ink)]">
      <header className="mb-8 max-w-2xl space-y-3">
        <h1 className="text-3xl font-black tracking-tight glow-accent sm:text-4xl">
          Forstå det på 30 sekunder
        </h1>
        <p className="text-[var(--ink-2)]">
          Value betting, surebetting og arbitrage er de metoder, professionelle
          bruger til at tjene på betting. Det kan lyde teknisk – men uanset om du
          er helt ny eller har spillet i årevis, behøver du hverken være
          matematik-geni eller forstå statistik. Leg med tallene herunder og se
          selv, hvordan det virker – og lad vores system gøre det tunge arbejde,
          når du vil i gang for alvor.
        </p>
        <p className="text-sm text-[var(--muted)]">
          <b className="text-[var(--accent)]">Value betting</b> er kernen i vores
          system og det, vi går efter på den lange bane. Surebetting og arbitrage
          er mere kortsigtede – gode til at komme i gang og hente hurtige, sikre
          gevinster.
        </p>
      </header>

      {/* Mini-guide for nye brugere */}
      <div className="mb-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <p className="mb-4 text-sm font-bold text-[var(--accent)]">
          👋 Ny her? Sådan bruger du siden:
        </p>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Vælg en metode",
              d: "Start med Value betting nedenfor – det er vores primære fokus.",
            },
            {
              t: "Læs forklaringen først",
              d: "Læs teksten for at forstå metoden – prøv så skyderne bagefter.",
            },
            {
              t: "Er et ord nyt?",
              d: "Hold musen over ⓘ for en helt simpel forklaring.",
            },
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: `${GOOD}22`, color: GOOD }}
              >
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-[var(--ink)]">{s.t}</div>
                <div className="text-sm text-[var(--muted)] leading-relaxed">
                  {s.d}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-[var(--line)] pt-4 text-sm text-[var(--ink-2)]">
          💡 Gennemgå gerne fanerne i rækkefølge –{" "}
          <b className="text-[var(--ink)]">Value betting → Surebetting → Arbitrage</b>{" "}
          – så bygger forståelsen sig naturligt op.
        </p>
      </div>

      {/* tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                color: active ? "var(--bg)" : "var(--ink-2)",
                background: active ? "var(--accent)" : "var(--panel)",
                border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
              }}
            >
              {t.label}
              {t.badge && (
                <span
                  className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{
                    background: active ? "rgba(0,0,0,0.25)" : `${GOOD}22`,
                    color: active ? "var(--bg)" : GOOD,
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "value" && <ValueTool />}

      {tab === "sure" && (
        <>
          <SureTool
            intro={
              <>
                <span className="mb-3 block">
                  <Horizon kind="short" />
                </span>
                <b className="text-[var(--ink)]">Surebetting</b> (også kaldet
                arbitrage) er betting <b className="text-[var(--accent)]">uden
                risiko</b>. Det er samtidig den <b className="text-[var(--ink)]">nemmeste
                at forstå</b> – men også den strategi, vi{" "}
                <b className="text-[var(--ink)]">mindst anbefaler</b>. Ikke fordi
                den ikke virker, men fordi den er kortsigtet og giver mindst. Den
                er dog et rigtig godt sted at starte. To{" "}
                <Term def="En bookmaker er et spilfirma (fx Bet365, Unibet eller Betano), der tilbyder odds og tager imod dine væddemål.">
                  bookmakere
                </Term>{" "}
                er uenige om oddsene i fx en tenniskamp – så satser du på begge
                spillere, og vinder uanset hvem der vinder.
              </>
            }
            labels={[
              { key: "a", name: "Spiller A vinder", book: "Bookmaker 1" },
              { key: "b", name: "Spiller B vinder", book: "Bookmaker 2" },
            ]}
            defaults={[2.05, 2.05]}
          />

          <section className="mt-12 border-t border-[var(--line)] pt-8">
            <header className="mb-6 max-w-2xl space-y-3">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Hvad kan du tjene med surebetting?
              </h2>
              <p className="text-[var(--ink-2)]">
                Hver surebet giver en lille, sikker profit – prøv at se, hvad det bliver til over mange spil.
              </p>
              <div
                className="rounded-xl border p-4 text-sm leading-relaxed"
                style={{
                  borderColor: "#ffca5744",
                  background: "#ffca571a",
                  color: "var(--ink-2)",
                }}
              >
                ⚠️ <b className="text-[var(--ink)]">Vær opmærksom:</b> surebetting
                giver typisk kun en lav profit, og gør du det for meget, risikerer
                du at bookmakerne begrænser eller lukker din konto. Derfor bruger
                vi det mest til at komme i gang – på den lange bane er{" "}
                <b className="text-[var(--accent)]">value betting</b> langt bedre.
              </div>
            </header>
            <SurebetPotential />
          </section>
        </>
      )}

      {tab === "arb" && (
        <>
          <section>
            <header className="mb-6 max-w-2xl space-y-3">
              <Horizon kind="short" />
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Hvad kan du tjene på velkomstbonusserne?
              </h2>
              <p className="text-[var(--ink-2)] leading-relaxed">
                <b className="text-[var(--ink)]">Arbitrage</b> bygger på samme
                princip som surebetting – forskellen er, at vi her udnytter
                bookmakernes{" "}
                <Term def="En velkomstbonus er penge eller gratis spil, som en bookmaker giver nye kunder for at få dem til at oprette en konto.">
                  velkomstbonusser
                </Term>
                . På selve spillene går man typisk et par procent i minus, men da
                du spiller med{" "}
                <b className="text-[var(--ink)]">gratis bonuspenge</b>, ender du
                alligevel med solid profit. Prøv selv:
              </p>
            </header>
            <div className="space-y-8">
              <BonusSteps />
              <ArbExample />
              <BonusPotential />
            </div>
          </section>

          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
              ⚙️ Ser det nemt ud?
            </h3>
            <p className="text-sm leading-relaxed text-[var(--ink-2)]">
              Selve princippet er enkelt – men bag ved ligger der et system, der
              skal passe sammen: du skal ramme de rigtige odds, den rigtige
              timing og de rigtige bookmakere, holde styr på indbetalinger og
              gennemspil, og undgå de fejl, der ellers æder profitten. Gør du det
              på må og få, går det galt.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">
              Det er præcis dét, vores{" "}
              <b className="text-[var(--accent)]">system og videomateriale</b>{" "}
              tager sig af. Vi har gjort det{" "}
              <b className="text-[var(--ink)]">nærmest automatisk for dig</b> – det
              hele er sat i system og kører, så du ikke skal regne eller holde
              styr på noget. Vi guider dig skridt for skridt, så du altid ved
              nøjagtig hvad du skal gøre – og du kun skal bruge tiden på at
              placere dine bets.
            </p>
          </div>
        </>
      )}

      {/* rente-rente / compounding – kun for value betting */}
      {tab === "value" && (
        <section
          id="potentiale"
          className="mt-16 scroll-mt-24 border-t border-[var(--line)] pt-10"
        >
          <header className="mb-6 max-w-2xl space-y-2">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold"
              style={{ color: GOOD, background: `${GOOD}1a` }}
            >
              Gælder value betting
            </span>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Dit potentiale med value betting over tid
            </h2>
            <p className="text-[var(--ink-2)]">
              Hvor surebetting og bonusser giver et hurtigt, sikkert engangsbeløb,
              er det <b className="text-[var(--ink)]">value betting</b>, der for
              alvor vokser på den lange bane. Den virkelige styrke er{" "}
              <b className="text-[var(--accent)]">rente-rente-effekten</b>: når din
              bankroll vokser, vokser din indsats med – og profitten accelererer.
              Prøv selv:
            </p>
          </header>
          <CompoundTool />
        </section>
      )}

      {/* CTA – opret gratis bruger */}
      <div className="mt-16 rounded-2xl border border-[var(--accent)]/40 bg-[var(--panel)] p-8 text-center sm:p-10">
        <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
          Prøv systemet gratis
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-[var(--ink-2)]">
          Det her er kun overfladen. Opret en gratis bruger nu og få et indblik i,
          hvordan vores setup og app fungerer i praksis – helt uden binding.
          Eller se vores <b className="text-[var(--ink)]">gratis kursus</b> igennem
          inde på appen eller på Skool.
        </p>
        <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
          <a
            href={APP_SIGNUP_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-accent inline-flex px-6 py-3 text-base"
          >
            Opret gratis bruger nu
          </a>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--accent)] bg-[#47fabe1a] px-6 py-3 text-base font-semibold text-[var(--accent)] transition-colors hover:bg-[#47fabe2e]"
          >
            Se om det giver mening for dig?
          </a>
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Eller se vores gratis kursus{" "}
          <a
            href={SKOOL_URL}
            target="_blank"
            rel="noreferrer"
            className="link-accent underline"
          >
            på Skool
          </a>
        </p>
      </div>
    </div>
  );
}

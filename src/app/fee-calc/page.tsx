"use client";
import { useState, useMemo } from "react";
import { Calculator, DollarSign, TrendingUp, Zap, Info, CheckCircle } from "lucide-react";

// Present value of an annuity: PMT × [1 - (1+r)^-n] / r
function pvAnnuity(annual: number, years: number, r = 0.08): number {
  if (r === 0) return annual * years;
  return annual * (1 - Math.pow(1 + r, -years)) / r;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtAnnual(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M / yr`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K / yr`;
  return `$${n.toFixed(0)} / yr`;
}

const PER_MW_OPTIONS = [5_000, 8_000, 10_000, 12_000, 15_000];
const PER_MWH_OPTIONS = [0.50, 0.75, 1.00, 1.25, 1.50];
const HYBRID_MW_OPTIONS = [3_000, 5_000, 7_500];
const HYBRID_MWH_OPTIONS = [0.25, 0.50, 0.75];

export default function FeeCalcPage() {
  const [mw, setMw] = useState(200);
  const [cents, setCents] = useState(3.8);
  const [years, setYears] = useState(10);
  const [cf, setCf] = useState(88); // capacity factor %
  const [perMwRate, setPerMwRate] = useState(10_000);
  const [perMwhRate, setPerMwhRate] = useState(1.00);
  const [hybridMw, setHybridMw] = useState(5_000);
  const [hybridMwh, setHybridMwh] = useState(0.50);
  const [showScript, setShowScript] = useState(false);

  const annualMwh = useMemo(() => mw * 8760 * (cf / 100), [mw, cf]);
  const totalValueM = useMemo(() => (cents / 100) * annualMwh * years / 1_000_000, [cents, annualMwh, years]);
  const annualRevenueM = useMemo(() => (cents / 100) * annualMwh / 1_000_000, [cents, annualMwh]);

  const optA = useMemo(() => {
    const total = mw * perMwRate;
    return { total, npv: total, annual: 0, pct: (total / (totalValueM * 1_000_000)) * 100 };
  }, [mw, perMwRate, totalValueM]);

  const optB = useMemo(() => {
    const annual = annualMwh * perMwhRate;
    const total = annual * years;
    const npvVal = pvAnnuity(annual, years);
    return { total, npv: npvVal, annual, pct: (total / (totalValueM * 1_000_000)) * 100 };
  }, [annualMwh, perMwhRate, years, totalValueM]);

  const optC = useMemo(() => {
    const upfront = mw * hybridMw;
    const annual = annualMwh * hybridMwh;
    const total = upfront + annual * years;
    const npvVal = upfront + pvAnnuity(annual, years);
    return { total, npv: npvVal, annual, upfront, pct: (total / (totalValueM * 1_000_000)) * 100 };
  }, [mw, hybridMw, annualMwh, hybridMwh, years, totalValueM]);

  const breakevenYr = useMemo(() => {
    if (optB.annual === 0) return null;
    const yr = Math.ceil(optA.total / optB.annual);
    return yr > 0 && yr <= years ? yr : null;
  }, [optA.total, optB.annual, years]);

  const best = useMemo(() => {
    const opts = [{ k: "A", v: optA.npv }, { k: "B", v: optB.npv }, { k: "C", v: optC.npv }];
    return opts.sort((a, b) => b.v - a.v)[0].k;
  }, [optA.npv, optB.npv, optC.npv]);

  const maxNpv = Math.max(optA.npv, optB.npv, optC.npv);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calculator className="h-6 w-6 text-green-400" />Fee Structure Calculator
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Compare fee structures in real time. Pull this up when a counterparty asks{" "}
          <span className="text-white italic">&ldquo;what&apos;s your fee?&rdquo;</span>
        </p>
      </div>

      {/* Deal Parameters */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Deal Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* MW */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Contract Capacity</label>
            <div className="flex items-baseline gap-2">
              <input
                type="number" min={10} max={5000} step={10} value={mw}
                onChange={e => setMw(Math.max(10, Number(e.target.value)))}
                className="w-24 bg-gray-800 text-white text-xl font-bold rounded px-2 py-1 outline-none border border-gray-700"
              />
              <span className="text-gray-400 text-sm font-medium">MW</span>
            </div>
            <input type="range" min={10} max={2000} step={10} value={mw}
              onChange={e => setMw(Number(e.target.value))} className="w-full accent-green-500" />
            <p className="text-[10px] text-gray-600">{mw < 100 ? "Small deal" : mw < 500 ? "Mid-market" : "Large deal"}</p>
          </div>

          {/* ¢/kWh */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">All-In Power Price</label>
            <div className="flex items-baseline gap-2">
              <input
                type="number" min={1.5} max={10} step={0.1} value={cents}
                onChange={e => setCents(Number(e.target.value))}
                className="w-20 bg-gray-800 text-white text-xl font-bold rounded px-2 py-1 outline-none border border-gray-700"
              />
              <span className="text-gray-400 text-sm font-medium">¢/kWh</span>
            </div>
            <input type="range" min={1.5} max={8.0} step={0.1} value={cents}
              onChange={e => setCents(Number(e.target.value))} className="w-full accent-green-500" />
            <p className="text-[10px] text-gray-600">
              {cents <= 3 ? "BTM gas / hydro range" : cents <= 4.5 ? "Mid-market comp" : "Hyperscaler / premium"}
            </p>
          </div>

          {/* Term */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Contract Term</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[7, 10, 12, 15, 20].map(y => (
                <button key={y} onClick={() => setYears(y)}
                  className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${years === y ? "bg-green-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          {/* Capacity Factor */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex items-center gap-1">
              Capacity Factor
              <span title="Data centers typically run 85–95%. Mining/AI compute can be 90%+." className="cursor-help">
                <Info className="h-3 w-3 text-gray-600" />
              </span>
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-white text-xl font-bold">{cf}%</span>
            </div>
            <input type="range" min={50} max={98} step={1} value={cf}
              onChange={e => setCf(Number(e.target.value))} className="w-full accent-green-500" />
            <p className="text-[10px] text-gray-600">
              {cf >= 90 ? "AI/HPC baseload profile" : cf >= 80 ? "Data center / compute" : "Curtailable / flexible load"}
            </p>
          </div>
        </div>
      </div>

      {/* Deal Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={<TrendingUp className="h-4 w-4 text-blue-400" />}
          label="Total Contract Value" value={`$${totalValueM.toFixed(1)}M`}
          sub={`${years}-year PPA`} color="text-blue-400" />
        <StatTile icon={<Zap className="h-4 w-4 text-yellow-400" />}
          label="Annual Energy" value={`${(annualMwh / 1_000).toFixed(0)}k MWh/yr`}
          sub={`${mw} MW × ${cf}% CF`} color="text-yellow-400" />
        <StatTile icon={<DollarSign className="h-4 w-4 text-green-400" />}
          label="Annual Power Revenue" value={`$${annualRevenueM.toFixed(2)}M/yr`}
          sub="to power provider" color="text-green-400" />
      </div>

      {/* Fee Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Option A */}
        <FeeCard
          label="Option A" title="Per-MW Upfront"
          isBest={best === "A"} npvBar={optA.npv / maxNpv}
          summary={[
            { k: "Your fee at closing", v: fmt(optA.total), highlight: true },
            { k: "As % of contract value", v: `${optA.pct.toFixed(2)}%` },
            { k: "Ongoing admin", v: "None" },
            { k: "Risk profile", v: "Zero — paid at signing" },
          ]}
          insight="Best for smaller deals and new relationships. Simple to explain. Collected once — no ongoing tracking needed."
        >
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">Rate</label>
            <div className="flex flex-wrap gap-1.5">
              {PER_MW_OPTIONS.map(r => (
                <button key={r} onClick={() => setPerMwRate(r)}
                  className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${perMwRate === r ? "bg-green-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  ${(r / 1000).toFixed(0)}K/MW
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500">{mw} MW × ${perMwRate.toLocaleString()} = <span className="text-white font-semibold">{fmt(optA.total)}</span></p>
          </div>
        </FeeCard>

        {/* Option B */}
        <FeeCard
          label="Option B" title="Residual $/MWh"
          isBest={best === "B"} npvBar={optB.npv / maxNpv}
          summary={[
            { k: "Annual fee", v: fmtAnnual(optB.annual), highlight: true },
            { k: `Total over ${years} years`, v: fmt(optB.total) },
            { k: "NPV at 8% discount rate", v: fmt(optB.npv) },
            { k: "Breakeven vs Option A", v: breakevenYr ? `Year ${breakevenYr}` : `Beyond ${years}yr term` },
          ]}
          insight={`Pays more on large, long-term deals. Seller prefers it — lower upfront cost. You prefer Option A for certainty. Use this for 15–20 year contracts where ${breakevenYr ? `you break even by Year ${breakevenYr}` : "total exceeds upfront"}.`}
        >
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">Rate</label>
            <div className="flex flex-wrap gap-1.5">
              {PER_MWH_OPTIONS.map(r => (
                <button key={r} onClick={() => setPerMwhRate(r)}
                  className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${perMwhRate === r ? "bg-green-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  ${r.toFixed(2)}/MWh
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500">{(annualMwh / 1000).toFixed(0)}k MWh/yr × ${perMwhRate.toFixed(2)} = <span className="text-white font-semibold">{fmtAnnual(optB.annual)}</span></p>
          </div>
        </FeeCard>

        {/* Option C */}
        <FeeCard
          label="Option C" title="Hybrid (Recommended)"
          isBest={best === "C"} npvBar={optC.npv / maxNpv}
          summary={[
            { k: "Upfront at closing", v: fmt(optC.upfront), highlight: true },
            { k: "Annual residual", v: fmtAnnual(optC.annual) },
            { k: `Total over ${years} years`, v: fmt(optC.total) },
            { k: "NPV at 8% discount rate", v: fmt(optC.npv) },
          ]}
          insight="Balances certainty (upfront) with upside (residual). Easiest to get both sides to agree — seller faces lower upfront, you have guaranteed skin in the game via residual."
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Upfront</label>
              <div className="flex flex-wrap gap-1.5">
                {HYBRID_MW_OPTIONS.map(r => (
                  <button key={r} onClick={() => setHybridMw(r)}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${hybridMw === r ? "bg-green-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                    ${(r / 1000).toFixed(1)}K/MW
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Residual</label>
              <div className="flex flex-wrap gap-1.5">
                {HYBRID_MWH_OPTIONS.map(r => (
                  <button key={r} onClick={() => setHybridMwh(r)}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${hybridMwh === r ? "bg-green-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                    ${r.toFixed(2)}/MWh
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FeeCard>
      </div>

      {/* Recommendation Banner */}
      <div className="rounded-xl border border-green-700/40 bg-green-950/20 p-4 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-white font-semibold">
            For {mw} MW at {cents}¢/kWh over {years} years — Option {best} maximises your NPV at{" "}
            <span className="text-green-400">{fmt(best === "A" ? optA.npv : best === "B" ? optB.npv : optC.npv)}</span>
            {best !== "A" && <span className="text-gray-400 text-xs ml-2">(vs {fmt(optA.total)} upfront for Option A)</span>}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            Contract value: ${totalValueM.toFixed(1)}M · Broker fee as % of deal:{" "}
            {best === "A" ? optA.pct.toFixed(2) : best === "B" ? optB.pct.toFixed(2) : optC.pct.toFixed(2)}%
            {" "}· NPV assumes 8% discount rate
          </p>
        </div>
      </div>

      {/* On-Call Script */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <button onClick={() => setShowScript(s => !s)}
          className="flex items-center justify-between w-full text-left">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-yellow-400" />When they ask &ldquo;What&apos;s your fee?&rdquo; — Use this script
          </h2>
          <span className="text-xs text-gray-500">{showScript ? "Hide" : "Show"}</span>
        </button>
        {showScript && (
          <div className="mt-4 space-y-3 text-sm text-gray-300 border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Script (adapt to your deal)</p>
            <div className="rounded-lg bg-gray-800 p-4 space-y-3 font-mono text-xs leading-relaxed">
              {[
                { tag: "[Opener]", line: `Our fee is entirely success-based — zero cost to you unless a deal closes.` },
                { tag: "[Option A]", line: `Option A is a flat ${fmt(optA.total)} paid at closing — one payment, done. That's ${optA.pct.toFixed(2)}% of the total contract value.` },
                { tag: "[Option B]", line: `Option B is $${perMwhRate.toFixed(2)} per MWh delivered — ${fmtAnnual(optB.annual)} per year, ${fmt(optB.total)} over the ${years}-year term. You pay as energy flows.` },
                { tag: "[Option C — recommend]", line: `Most counterparties prefer ${fmt(optC.upfront)} upfront plus $${hybridMwh.toFixed(2)}/MWh residual — ${fmtAnnual(optC.annual)} per year. Lower upfront for you, aligns my incentive with deal performance.` },
                { tag: "[Close]", line: `All structures are in the MFPA — two pages, standard form. Which works better for your accounting team?` },
              ].map(({ tag, line }) => (
                <p key={tag}><span className="text-yellow-400">{tag}</span> {line}</p>
              ))}
            </div>
            <p className="text-[10px] text-gray-600">Figures update live as you adjust deal parameters above. Verify all numbers with your legal/financial advisor before committing.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex items-center gap-3">
      <div className="rounded-lg bg-gray-800 p-2 shrink-0">{icon}</div>
      <div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-[10px] text-gray-600">{sub}</p>
      </div>
    </div>
  );
}

function FeeCard({
  label, title, isBest, npvBar, children, summary, insight,
}: {
  label: string; title: string; isBest: boolean; npvBar: number;
  children: React.ReactNode;
  summary: { k: string; v: string; highlight?: boolean }[];
  insight: string;
}) {
  return (
    <div className={`rounded-xl border p-4 space-y-4 transition-colors ${isBest ? "border-green-600/60 bg-green-950/15" : "border-gray-800 bg-gray-900/60"}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
          <h3 className="text-sm font-bold text-white mt-0.5">{title}</h3>
        </div>
        {isBest && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-green-300 bg-green-900/50 border border-green-700/40 px-2 py-0.5 rounded-full">
            Best NPV
          </span>
        )}
      </div>

      {/* NPV bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${isBest ? "bg-green-500" : "bg-blue-600"}`}
            style={{ width: `${Math.round(npvBar * 100)}%` }} />
        </div>
        <p className="text-[9px] text-gray-600">NPV relative to best option</p>
      </div>

      {/* Rate selector (children) */}
      {children}

      {/* Summary table */}
      <div className="space-y-1.5 border-t border-gray-800 pt-3">
        {summary.map(({ k, v, highlight }) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] text-gray-500 shrink-0">{k}</span>
            <span className={`text-xs font-semibold ${highlight ? "text-white" : "text-gray-300"}`}>{v}</span>
          </div>
        ))}
      </div>

      {/* Insight */}
      <p className="text-[10px] text-gray-500 leading-relaxed border-t border-gray-800 pt-3">{insight}</p>
    </div>
  );
}

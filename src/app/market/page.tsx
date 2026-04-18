"use client";
import { useState } from "react";
import suppliersData from "@/data/suppliers.json";
import seekersData from "@/data/seekers.json";
import { Supplier, Seeker } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart2, BookOpen, Calendar, Zap, Users } from "lucide-react";

const suppliers = suppliersData as Supplier[];
const seekers = seekersData as Seeker[];

// ─── PPA Price Index (compiled from public filings, market reports) ────────
interface PriceRow {
  tech: string; region: string; low: number; high: number;
  trend: "up" | "down" | "flat"; notes: string;
}

const PRICE_INDEX: PriceRow[] = [
  { tech: "BTM Gas", region: "Permian Basin, TX", low: 2.8, high: 4.5, trend: "up", notes: "EPA flaring enforcement — sellers motivated by shut-in risk" },
  { tech: "BTM Gas", region: "Bakken, ND", low: 3.0, high: 4.2, trend: "flat", notes: "NDIC shut-in risk; Applied Digital ~4¢ comp (Q2 2024 10-Q)" },
  { tech: "BTM Gas", region: "Appalachia, PA", low: 3.2, high: 4.8, trend: "up", notes: "EPA methane fee escalating quarterly" },
  { tech: "Hydro (Run-of-river)", region: "Paraguay (ANDE)", low: 2.5, high: 3.8, trend: "flat", notes: "Law 6.207 industrial tariff window — anchor slots Q3 2026" },
  { tech: "Hydro", region: "Ethiopia (GERD)", low: 2.8, high: 3.5, trend: "down", notes: "Reservoir surplus peak 2026 — EEP prioritising USD agreements" },
  { tech: "Hydro", region: "Iceland (Landsvirkjun)", low: 3.5, high: 4.8, trend: "flat", notes: "Smelter offtake expiring 2027; industrial load wanted by Q4 2026" },
  { tech: "Hydro", region: "Québec, Canada (HQ)", low: 3.0, high: 4.2, trend: "flat", notes: "HQ industrial tariff tier; USD-denominated structures available" },
  { tech: "Hydro", region: "Malaysia (SCORE corridor)", low: 3.0, high: 4.5, trend: "flat", notes: "RECODA allocations — anchor tenant slots closing Q3 2026" },
  { tech: "Hydro / Geothermal", region: "Kenya (KenGen)", low: 4.0, high: 5.5, trend: "flat", notes: "Industrial PPA window opens Q2 2026; USD tariff" },
  { tech: "Solar Curtailment", region: "ERCOT (Texas)", low: 1.5, high: 3.5, trend: "down", notes: "Negative pricing events rising — anchor load eliminates exposure; Riot comp ~2.5¢" },
  { tech: "Nuclear (Restart)", region: "PJM (US East)", low: 4.5, high: 6.0, trend: "up", notes: "Constellation/Microsoft TMI restart set 5.5¢ benchmark (Sep 2023)" },
  { tech: "Stranded Substation", region: "MISO (Midwest)", low: 3.5, high: 5.0, trend: "flat", notes: "Carrying cost arbitrage — vacancy erodes book value every quarter" },
];

// ─── Reference transactions (public disclosures) ──────────────────────────
interface RefTxn { buyer: string; tech: string; region: string; cents: string; mw: string; year: string; source: string; }

const REF_TRANSACTIONS: RefTxn[] = [
  { buyer: "Applied Digital (NASDAQ: APLD)", tech: "BTM Gas", region: "Permian, TX", cents: "~4.0¢", mw: "200", year: "2024", source: "Q2 2024 10-Q" },
  { buyer: "TeraWulf (NASDAQ: WULF)", tech: "Hydro", region: "Lake Mariner, NY", cents: "<2.5¢", mw: "160", year: "2023", source: "Annual Report 2023" },
  { buyer: "Cipher Mining (NASDAQ: CIFR)", tech: "Various", region: "Texas / Other", cents: "~3.5¢", mw: "300", year: "2024", source: "Investor Presentation 2024" },
  { buyer: "Microsoft", tech: "Nuclear (restart)", region: "Crane, PA (TMI)", cents: "~5.5¢", mw: "835", year: "2023", source: "Press Release Sep 2023" },
  { buyer: "Google", tech: "Solar + Storage", region: "ERCOT, TX", cents: "~3.8¢", mw: "500", year: "2024", source: "ESG Report Q3 2024" },
  { buyer: "CoreWeave (NASDAQ: CRWV)", tech: "Nuclear / Utility", region: "PJM", cents: "~4.5¢", mw: "1,200+", year: "2024", source: "2024 Investor Documents" },
  { buyer: "Riot Platforms (NASDAQ: RIOT)", tech: "ERCOT (curtailable)", region: "Corsicana, TX", cents: "~2.5¢ avg", mw: "700", year: "2024", source: "Q2 2024 Investor Update" },
  { buyer: "Stronghold Digital (NASDAQ: SDIG)", tech: "Coal Refuse / BTM", region: "Appalachia, PA", cents: "~3.2¢", mw: "165", year: "2024", source: "Annual Report 2023" },
];

// ─── Regulatory alerts ────────────────────────────────────────────────────
interface Alert { date: string; title: string; region: string; urgency: "critical" | "high" | "medium"; detail: string; }

const ALERTS: Alert[] = [
  { date: "Q2 2026", title: "EPA Methane Fee Escalation", region: "Permian / Bakken / Appalachia", urgency: "critical", detail: "Quarterly fee increases under IRA methane provisions — venting penalty exposure grows each month without committed offtake." },
  { date: "Q3 2026", title: "RECODA SCORE Corridor Close", region: "Malaysia", urgency: "critical", detail: "Industrial anchor tenant slots for 2027 energization being committed now. Window closes Q3 2026." },
  { date: "Q3 2026", title: "NDIC Flaring Production Shut-in Risk", region: "Bakken, ND", urgency: "high", detail: "North Dakota Industrial Commission flaring rules — operators face production shut-in without emissions solution." },
  { date: "Q4 2026", title: "Iceland Smelter Contract Expiry", region: "Iceland (Landsvirkjun)", urgency: "high", detail: "Aluminum smelter offtake contracts expiring. Industrial load replacement must be contracted by Q4 2026 for project economics." },
  { date: "Q2 2026", title: "KenGen Industrial PPA Window Opens", region: "Kenya", urgency: "medium", detail: "Olkaria IV expansion creates industrial PPA opportunity. Early movers secure preferential USD tariff structure." },
  { date: "Ongoing", title: "Grid Interconnection Queue 36–60 Months", region: "MISO / PJM / ERCOT", urgency: "medium", detail: "Interconnection queues running 3–5 years — off-market permitted assets are the only fast-track path for 2026–2027 energization." },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <span title="Price trending up"><TrendingUp className="h-3.5 w-3.5 text-red-400" /></span>;
  if (trend === "down") return <span title="Buyer opportunity"><TrendingDown className="h-3.5 w-3.5 text-green-400" /></span>;
  return <span title="Stable"><Minus className="h-3.5 w-3.5 text-gray-500" /></span>;
}

function urgencyBadge(u: Alert["urgency"]) {
  if (u === "critical") return "bg-red-900/50 text-red-300 border border-red-700/40";
  if (u === "high") return "bg-orange-900/50 text-orange-300 border border-orange-700/40";
  return "bg-yellow-900/30 text-yellow-400 border border-yellow-800/30";
}

export default function MarketPage() {
  const [indexSort, setIndexSort] = useState<"tech" | "low" | "high">("low");

  const totalSupplyMW = suppliers.reduce((s, x) => s + x.availableMW, 0);
  const totalDemandMW = seekers.reduce((s, x) => s + x.neededMW, 0);
  const gapMW = totalDemandMW - totalSupplyMW;
  const avgSupplierCents = (suppliers.reduce((s, x) => s + x.estimatedAllInCents, 0) / suppliers.length).toFixed(2);
  const highUrgency = suppliers.filter(s => s.urgencyScore >= 8).length;

  const sorted = [...PRICE_INDEX].sort((a, b) => {
    if (indexSort === "low") return a.low - b.low;
    if (indexSort === "high") return b.high - a.high;
    return a.tech.localeCompare(b.tech);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-blue-400" />Market Intelligence
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">PPA price benchmarks, regulatory alerts, and reference transactions — compiled from public filings and market reports</p>
        <p className="text-[10px] text-gray-600 mt-1">Sources: SEC filings, press releases, BloombergNEF, ERCOT public data, DNV market reports. All data for reference only — verify independently.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Platform Supply" value={`${(totalSupplyMW / 1000).toFixed(1)} GW`} sub={`${suppliers.length} suppliers tracked`} color="text-yellow-400" icon={<Zap className="h-4 w-4 text-yellow-400" />} />
        <KpiCard label="Platform Demand" value={`${(totalDemandMW / 1000).toFixed(1)} GW`} sub={`${seekers.length} seekers tracked`} color="text-blue-400" icon={<Users className="h-4 w-4 text-blue-400" />} />
        <KpiCard label="Demand Gap" value={`+${(gapMW / 1000).toFixed(1)} GW`} sub="demand vs. tracked supply" color="text-orange-400" icon={<TrendingUp className="h-4 w-4 text-orange-400" />} />
        <KpiCard label="High-Urgency Assets" value={`${highUrgency}`} sub={`avg supply price ${avgSupplierCents}¢/kWh`} color="text-red-400" icon={<AlertTriangle className="h-4 w-4 text-red-400" />} />
      </div>

      {/* Price Index */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-400" />PPA Price Index — By Technology &amp; Region
          </h2>
          <div className="flex gap-1.5 items-center">
            <span className="text-[10px] text-gray-500">Sort:</span>
            {(["low", "high", "tech"] as const).map(s => (
              <button key={s} onClick={() => setIndexSort(s)}
                className={`text-[10px] px-2 py-0.5 rounded ${indexSort === s ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                {s === "low" ? "Price Low" : s === "high" ? "Price High" : "Type A–Z"}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-900 text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="text-left px-4 py-2.5">Technology</th>
                <th className="text-left px-4 py-2.5">Region / Market</th>
                <th className="text-right px-4 py-2.5">Low ¢</th>
                <th className="text-right px-4 py-2.5">High ¢</th>
                <th className="text-center px-3 py-2.5">Trend</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">Market Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={i} className={`border-t border-gray-800 hover:bg-gray-900/60 transition-colors ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/30"}`}>
                  <td className="px-4 py-2.5 font-medium text-white">{row.tech}</td>
                  <td className="px-4 py-2.5 text-gray-300">{row.region}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-mono font-semibold ${row.low <= 3 ? "text-green-400" : row.low <= 4 ? "text-yellow-400" : "text-orange-400"}`}>{row.low}¢</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="font-mono text-gray-400">{row.high}¢</span>
                  </td>
                  <td className="px-3 py-2.5 text-center"><TrendIcon trend={row.trend} /></td>
                  <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell max-w-xs truncate">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5 flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-green-400" /> = buyer opportunity &nbsp;
          <TrendingUp className="h-3 w-3 text-red-400" /> = seller urgency/price pressure &nbsp;
          All-in ¢/kWh includes transmission, capacity, and ancillary where applicable.
        </p>
      </section>

      {/* Reference Transactions */}
      <section>
        <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-purple-400" />Reference Transactions — Publicly Disclosed
        </h2>
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-900 text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="text-left px-4 py-2.5">Buyer</th>
                <th className="text-left px-4 py-2.5 hidden sm:table-cell">Technology</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">Region</th>
                <th className="text-right px-4 py-2.5">¢/kWh</th>
                <th className="text-right px-4 py-2.5">MW</th>
                <th className="text-left px-4 py-2.5">Source</th>
              </tr>
            </thead>
            <tbody>
              {REF_TRANSACTIONS.map((t, i) => (
                <tr key={i} className={`border-t border-gray-800 hover:bg-gray-900/60 transition-colors ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/30"}`}>
                  <td className="px-4 py-2.5 font-medium text-white">{t.buyer}</td>
                  <td className="px-4 py-2.5 text-gray-400 hidden sm:table-cell">{t.tech}</td>
                  <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell">{t.region}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-400">{t.cents}</td>
                  <td className="px-4 py-2.5 text-right text-white">{t.mw}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[10px]">{t.source} · {t.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Regulatory Alerts */}
      <section>
        <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-orange-400" />Regulatory &amp; Market Alert Calendar
        </h2>
        <div className="space-y-2">
          {ALERTS.map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900/60 px-4 py-3">
              <span className="text-[10px] font-mono text-gray-500 shrink-0 w-14 pt-0.5">{a.date}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-white">{a.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase ${urgencyBadge(a.urgency)}`}>{a.urgency}</span>
                  <span className="text-[10px] text-gray-500">{a.region}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{a.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market Context */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />2026 Structural Market Thesis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
          <div>
            <p className="font-semibold text-white mb-1">Supply Side</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>BTM gas operators facing regulatory cost → must monetize or shut in</li>
              <li>Hydro surplus (GERD, Paraguay) seeking USD-denominated offtake</li>
              <li>Stranded substations / curtailment zones with zero revenue</li>
              <li>Motivated sellers create pricing leverage for broker-represented buyers</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Demand Side</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Hyperscalers need 5–10 GW new capacity by 2027 (IEA 2024)</li>
              <li>Grid queues: 3–5 years via MISO/PJM/ERCOT standard process</li>
              <li>Miners (~4 GW) pivoting to AI compute — existing infrastructure advantage</li>
              <li>HPC co-location demand doubling every 18 months (BloombergNEF)</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Broker Opportunity</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Off-market assets: 12–18 month energization vs. 36–60 month grid queue</li>
              <li>Motivated sellers + motivated buyers = transaction certainty premium</li>
              <li>Multi-party outreach creates competitive dynamic → better terms</li>
              <li>Success-based fee: $0.5–2/MWh (paid by seller) on 10-year contracts</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex items-center gap-3">
      <div className="rounded-lg bg-gray-800 p-2 shrink-0">{icon}</div>
      <div>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
        <p className="text-[10px] text-gray-600">{sub}</p>
      </div>
    </div>
  );
}

"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import suppliersData from "@/data/suppliers.json";
import seekersData from "@/data/seekers.json";
import { Supplier, Seeker } from "@/lib/types";
import { matchSeekersToSupplier } from "@/lib/matching";
import { rankSuppliers, type Strategy, STRATEGY_LABELS } from "@/lib/prospectRanker";
import { SupplierCard } from "@/components/shared/SupplierCard";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, ListFilter, SlidersHorizontal, TrendingUp, Filter, Zap } from "lucide-react";

const allSuppliers = suppliersData as Supplier[];
const seekers = seekersData as Seeker[];
const ALL_REGIONS = ["All", ...Array.from(new Set(allSuppliers.map((s) => s.region.split(",")[0].trim())))];
const ALL_TYPES = ["All", ...Array.from(new Set(allSuppliers.map((s) => s.type)))];
const DISPLAY_COUNT = 25;

type SortMode = "engagement" | "urgency" | "price" | "mw" | "az";

function engagementScore(s: Supplier) {
  const fit = s.newBrokerFit ?? s.startupFriendly;
  return s.urgencyScore * 0.5 + fit * 0.3 + s.startupFriendly * 0.2;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(6);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [sortMode, setSortMode] = useState<SortMode>("engagement");
  const [workingList, setWorkingList] = useState(false);
  const [strategy, setStrategy] = useState<Strategy>("default");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [rankKey, setRankKey] = useState(0);

  function handleRefresh() {
    const now = new Date();
    setLastRefreshed(now);
    setRankKey(k => k + 1);
  }

  // Dynamic ranked pool — re-runs on every Refresh click
  const rankedPool = useMemo(() => {
    return rankSuppliers(allSuppliers, { strategy, date: new Date(), seed: rankKey });
  }, [strategy, rankKey]);

  const topSeekersBySupplier = useMemo(() => {
    const map = new Map<number, { id: number; name: string; score: number; type: string }[]>();
    rankedPool.slice(0, DISPLAY_COUNT).forEach((sup) => {
      const matches = matchSeekersToSupplier(sup, seekers).slice(0, 3);
      map.set(sup.id, matches.map((m) => ({ id: m.seeker.id, name: m.seeker.name, score: m.score, type: m.seeker.type })));
    });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankedPool]);

  const filtered = useMemo(() => {
    const base = rankedPool.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.region.toLowerCase().includes(search.toLowerCase());
      const matchRegion = regionFilter === "All" || s.region.includes(regionFilter);
      const matchType = typeFilter === "All" || s.type === typeFilter;
      const matchPrice = s.estimatedAllInCents <= maxPrice;
      const matchWorking = !workingList || (s.newBrokerFit ?? s.startupFriendly) >= 7;
      return matchSearch && matchRegion && matchType && matchPrice && matchWorking;
    });

    if (workingList) return base.sort((a, b) => {
      const aScore = a.urgencyScore * (a.newBrokerFit ?? a.startupFriendly);
      const bScore = b.urgencyScore * (b.newBrokerFit ?? b.startupFriendly);
      return bScore - aScore;
    }).slice(0, DISPLAY_COUNT);

    if (sortMode !== "engagement") return base.sort((a, b) => {
      if (sortMode === "urgency") return b.urgencyScore - a.urgencyScore;
      if (sortMode === "price") return a.estimatedAllInCents - b.estimatedAllInCents;
      if (sortMode === "mw") return b.availableMW - a.availableMW;
      return a.name.localeCompare(b.name);
    }).slice(0, DISPLAY_COUNT);

    // Default: preserve ranker order (already scored)
    return base.slice(0, DISPLAY_COUNT);
  }, [rankedPool, search, regionFilter, typeFilter, maxPrice, sortMode, workingList]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Power Suppliers</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {workingList
              ? `Working List — ${filtered.length} realistic targets, ranked by urgency × fit`
              : `Top ${DISPLAY_COUNT} of ${allSuppliers.length} prospects — re-ranked on Refresh by strategy + live market signals`}
          </p>
          {lastRefreshed && (
            <p className="text-[11px] text-gray-600 mt-0.5">
              Re-ranked: {lastRefreshed.toLocaleTimeString()} · Strategy: {STRATEGY_LABELS[strategy].split("—")[0].trim()}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <select
            value={strategy}
            onChange={(e) => { setStrategy(e.target.value as Strategy); handleRefresh(); }}
            className="bg-purple-900/40 text-sm text-purple-200 rounded-md px-3 py-1.5 border border-purple-700/50 outline-none"
            title="Strategy changes which prospect types surface at the top"
          >
            {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.split("—")[0].trim()}</option>
            ))}
          </select>
          <Button
            size="sm"
            variant={workingList ? "default" : "outline"}
            onClick={() => setWorkingList(w => !w)}
            className={workingList ? "bg-green-700 hover:bg-green-600 border-green-600" : ""}
          >
            <ListFilter className="h-3.5 w-3.5 mr-1.5" />
            Working List
          </Button>
          <Button size="sm" variant="outline" onClick={handleRefresh} title="Re-rank pool with current market signals">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" variant={view === "grid" ? "default" : "outline"} onClick={() => setView("grid")}>Grid</Button>
          <Button size="sm" variant={view === "table" ? "default" : "outline"} onClick={() => setView("table")}>Table</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
        </div>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="bg-gray-800 text-sm text-white rounded-md px-3 py-1.5 border border-gray-700 outline-none">
          {ALL_REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-gray-800 text-sm text-white rounded-md px-3 py-1.5 border border-gray-700 outline-none">
          {ALL_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <label className="text-xs text-gray-400">Max ¢:</label>
          <input type="range" min={2} max={6} step={0.1} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-24" />
          <span className="text-xs text-white w-8">{maxPrice}¢</span>
        </div>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} className="bg-gray-800 text-sm text-white rounded-md px-3 py-1.5 border border-gray-700 outline-none">
          <option value="engagement">Sort: Strategy Rank</option>
          <option value="urgency">Sort: Urgency Only</option>
          <option value="price">Sort: Price (Low)</option>
          <option value="mw">Sort: MW (High)</option>
          <option value="az">Sort: A–Z</option>
        </select>
        <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setRegionFilter("All"); setTypeFilter("All"); setMaxPrice(6); }}>
          <Filter className="h-3.5 w-3.5 mr-1" />Clear
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-400">
        <TrendingUp className="h-4 w-4 text-blue-400" />
        <span>{filtered.length} shown · pool of {allSuppliers.length} · </span>
        <span className="flex items-center gap-1 text-purple-400 text-xs">
          <Zap className="h-3 w-3" />{STRATEGY_LABELS[strategy]}
        </span>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              topMatches={topSeekersBySupplier.get(s.id)}
              onMatch={() => router.push(`/matches?supplierId=${s.id}`)}
              onGenerateOutreach={() => router.push(`/outreach?supplierId=${s.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Region</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">MW</th>
                <th className="text-right px-4 py-3">¢/kWh</th>
                <th className="text-right px-4 py-3">Rank</th>
                <th className="text-left px-4 py-3">Signal</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const top = topSeekersBySupplier.get(s.id)?.[0];
                return (
                  <tr key={s.id} className={`border-t border-gray-800 hover:bg-gray-900 transition-colors ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/50"}`}>
                    <td className="px-4 py-3 font-medium text-white">
                      {s.name}
                      {s.signalNote && <p className="text-[10px] text-purple-400 mt-0.5 truncate max-w-[160px]">{s.signalNote}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.region.split(",")[0]}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.type}</td>
                    <td className="px-4 py-3 text-right text-white">{s.availableMW}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${s.estimatedAllInCents <= 4 ? "text-green-400" : s.estimatedAllInCents <= 5 ? "text-yellow-400" : "text-red-400"}`}>
                        {s.estimatedAllInCents}¢
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-orange-400 font-bold">{Math.round(engagementScore(s) * 10)}%</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {top ? <span>{top.name} <span className={`font-bold ${top.score >= 75 ? "text-green-400" : "text-yellow-400"}`}>({top.score})</span></span> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => router.push(`/matches?supplierId=${s.id}`)}>Match</Button>
                        <Button size="sm" className="text-xs h-7" onClick={() => router.push(`/outreach?supplierId=${s.id}`)}>Outreach</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

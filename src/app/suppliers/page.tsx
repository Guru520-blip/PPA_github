"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import suppliersData from "@/data/suppliers.json";
import seekersData from "@/data/seekers.json";
import { Supplier, Seeker } from "@/lib/types";
import { matchSeekersToSupplier } from "@/lib/matching";
import { SupplierCard } from "@/components/shared/SupplierCard";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal, RefreshCw, TrendingUp } from "lucide-react";

const suppliers = suppliersData as Supplier[];
const seekers = seekersData as Seeker[];
const ALL_REGIONS = ["All", ...Array.from(new Set(suppliers.map((s) => s.region)))];
const ALL_TYPES = ["All", ...Array.from(new Set(suppliers.map((s) => s.type)))];

type SortMode = "engagement" | "urgency" | "price" | "mw" | "az";

function engagementScore(s: Supplier) {
  return s.urgencyScore * 0.6 + s.startupFriendly * 0.4;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(6);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [sortMode, setSortMode] = useState<SortMode>("engagement");
  const [rankKey, setRankKey] = useState(0);

  const topSeekersBySupplier = useMemo(() => {
    const map = new Map<number, { id: number; name: string; score: number; type: string }[]>();
    suppliers.forEach((sup) => {
      const matches = matchSeekersToSupplier(sup, seekers).slice(0, 3);
      map.set(sup.id, matches.map((m) => ({ id: m.seeker.id, name: m.seeker.name, score: m.score, type: m.seeker.type })));
    });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankKey]);

  const filtered = useMemo(() => {
    const base = suppliers.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.region.toLowerCase().includes(search.toLowerCase());
      const matchRegion = regionFilter === "All" || s.region === regionFilter;
      const matchType = typeFilter === "All" || s.type === typeFilter;
      const matchPrice = s.estimatedAllInCents <= maxPrice;
      return matchSearch && matchRegion && matchType && matchPrice;
    });
    return base.sort((a, b) => {
      if (sortMode === "engagement") return engagementScore(b) - engagementScore(a);
      if (sortMode === "urgency") return b.urgencyScore - a.urgencyScore;
      if (sortMode === "price") return a.estimatedAllInCents - b.estimatedAllInCents;
      if (sortMode === "mw") return b.availableMW - a.availableMW;
      return a.name.localeCompare(b.name);
    });
  }, [search, regionFilter, typeFilter, maxPrice, sortMode]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Power Suppliers</h1>
          <p className="text-gray-400 text-sm mt-0.5">BTM gas, surplus hydro, curtailment zones — ranked by startup engagement probability</p>
        </div>
        <div className="flex gap-2">
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
          <option value="engagement">Sort: Engagement Rank</option>
          <option value="urgency">Sort: Urgency Only</option>
          <option value="price">Sort: Price (Low)</option>
          <option value="mw">Sort: MW (High)</option>
          <option value="az">Sort: A–Z</option>
        </select>
        <Button size="sm" variant="outline" onClick={() => setRankKey((k) => k + 1)} className="gap-1.5 text-xs border-blue-700/50 text-blue-400 hover:bg-blue-900/20">
          <RefreshCw className="h-3.5 w-3.5" />Re-rank
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setRegionFilter("All"); setTypeFilter("All"); setMaxPrice(6); }}>
          <Filter className="h-3.5 w-3.5 mr-1" />Clear
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-400">
        <TrendingUp className="h-4 w-4 text-blue-400" />
        <span>{filtered.length} of {suppliers.length} suppliers — sorted by startup engagement probability (urgency × 60% + accessibility × 40%)</span>
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
                <th className="text-left px-4 py-3">Top Match</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const top = topSeekersBySupplier.get(s.id)?.[0];
                return (
                  <tr key={s.id} className={`border-t border-gray-800 hover:bg-gray-900 transition-colors ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/50"}`}>
                    <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.region}</td>
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

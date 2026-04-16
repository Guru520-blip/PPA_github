"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import seekersData from "@/data/seekers.json";
import { Seeker } from "@/lib/types";
import { SeekerCard } from "@/components/shared/SeekerCard";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

const seekers = seekersData as Seeker[];
const ALL_TYPES = ["All", ...Array.from(new Set(seekers.map((s) => s.type)))];
const ALL_REGIONS = ["All", ...Array.from(new Set(seekers.flatMap((s) => s.preferredRegions)))];

export default function SeekersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [minMW, setMinMW] = useState(0);
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => {
    return seekers.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || s.type === typeFilter;
      const matchRegion = regionFilter === "All" || s.preferredRegions.includes(regionFilter);
      const matchMW = s.neededMW >= minMW;
      return matchSearch && matchType && matchRegion && matchMW;
    });
  }, [search, typeFilter, regionFilter, minMW]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Power Seekers</h1>
          <p className="text-gray-400 text-sm mt-0.5">Hyperscalers, miners pivoting to AI, hybrid compute operators seeking affordable power</p>
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
            placeholder="Search name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-gray-800 text-sm text-white rounded-md px-3 py-1.5 border border-gray-700 outline-none">
          {ALL_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="bg-gray-800 text-sm text-white rounded-md px-3 py-1.5 border border-gray-700 outline-none">
          {ALL_REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <label className="text-xs text-gray-400">Min MW:</label>
          <input type="range" min={0} max={1000} step={50} value={minMW} onChange={(e) => setMinMW(Number(e.target.value))} className="w-24" />
          <span className="text-xs text-white w-16">{minMW} MW</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setTypeFilter("All"); setRegionFilter("All"); setMinMW(0); }}>
          <Filter className="h-3.5 w-3.5 mr-1" />Clear
        </Button>
      </div>

      <p className="text-sm text-gray-400">{filtered.length} of {seekers.length} seekers</p>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <SeekerCard
              key={s.id}
              seeker={s}
              onMatch={() => router.push(`/matches?seekerId=${s.id}`)}
              onGenerateOutreach={() => router.push(`/outreach?seekerId=${s.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">MW Needed</th>
                <th className="text-left px-4 py-3">Regions</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={`border-t border-gray-800 hover:bg-gray-900 transition-colors ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/50"}`}>
                  <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                  <td className="px-4 py-3 text-gray-400">{s.type}</td>
                  <td className="px-4 py-3 text-right text-white font-semibold">{s.neededMW} MW</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.preferredRegions.slice(0, 2).join(", ")}{s.preferredRegions.length > 2 ? ` +${s.preferredRegions.length - 2}` : ""}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => router.push(`/matches?seekerId=${s.id}`)}>Match</Button>
                      <Button size="sm" className="text-xs h-7" onClick={() => router.push(`/outreach?seekerId=${s.id}`)}>Outreach</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

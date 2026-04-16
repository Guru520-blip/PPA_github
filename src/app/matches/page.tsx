"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import suppliersData from "@/data/suppliers.json";
import seekersData from "@/data/seekers.json";
import { Supplier, Seeker } from "@/lib/types";
import { matchSuppliersToSeeker, matchSeekersToSupplier } from "@/lib/matching";
import { MatchCard } from "@/components/shared/MatchCard";
import { Button } from "@/components/ui/button";
import { GitMerge, Users, Zap, CheckSquare, Square } from "lucide-react";
import { Toast, useToast } from "@/components/ui/toast";
import { Suspense } from "react";

const suppliers = suppliersData as Supplier[];
const seekers = seekersData as Seeker[];

function MatchesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast, show, dismiss } = useToast();

  const initialMode = searchParams.get("mode") ?? (searchParams.get("seekerId") ? "seekers" : searchParams.get("supplierId") ? "suppliers" : "seekers");
  const [mode, setMode] = useState<"seekers" | "suppliers">(initialMode as "seekers" | "suppliers");

  const preSelectedSeekerId = searchParams.get("seekerId") ? Number(searchParams.get("seekerId")) : null;
  const preSelectedSupplierId = searchParams.get("supplierId") ? Number(searchParams.get("supplierId")) : null;

  const [selectedSeekerIds, setSelectedSeekerIds] = useState<Set<number>>(preSelectedSeekerId ? new Set([preSelectedSeekerId]) : new Set());
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<number>>(preSelectedSupplierId ? new Set([preSelectedSupplierId]) : new Set());
  const [results, setResults] = useState<ReturnType<typeof matchSuppliersToSeeker>>([]);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    if (preSelectedSeekerId || preSelectedSupplierId) {
      handleFind();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFind() {
    if (mode === "seekers") {
      const selected = seekers.filter((s) => selectedSeekerIds.has(s.id));
      if (!selected.length) { show("Select at least one seeker", "error"); return; }
      const allResults = selected.flatMap((seeker) => matchSuppliersToSeeker(seeker, suppliers));
      const deduped = allResults.filter((r, i, arr) => arr.findIndex((x) => x.supplier.id === r.supplier.id && x.seeker.id === r.seeker.id) === i);
      setResults(deduped.sort((a, b) => b.score - a.score));
    } else {
      const selected = suppliers.filter((s) => selectedSupplierIds.has(s.id));
      if (!selected.length) { show("Select at least one supplier", "error"); return; }
      const allResults = selected.flatMap((supplier) => matchSeekersToSupplier(supplier, seekers));
      const deduped = allResults.filter((r, i, arr) => arr.findIndex((x) => x.supplier.id === r.supplier.id && x.seeker.id === r.seeker.id) === i);
      setResults(deduped.sort((a, b) => b.score - a.score));
    }
    setRan(true);
  }

  function toggleSeeker(id: number) {
    setSelectedSeekerIds((prev) => { const s = new Set(prev); if (s.has(id)) { s.delete(id); } else { s.add(id); } return s; });
  }
  function toggleSupplier(id: number) {
    setSelectedSupplierIds((prev) => { const s = new Set(prev); if (s.has(id)) { s.delete(id); } else { s.add(id); } return s; });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><GitMerge className="h-6 w-6" />Match Engine</h1>
        <p className="text-gray-400 text-sm mt-0.5">Select entities, run scoring algorithm, create deals</p>
      </div>

      <div className="flex gap-2">
        <Button variant={mode === "seekers" ? "default" : "outline"} onClick={() => { setMode("seekers"); setRan(false); setResults([]); }} className="gap-2">
          <Users className="h-4 w-4" />Scout Seekers → Find Suppliers
        </Button>
        <Button variant={mode === "suppliers" ? "default" : "outline"} onClick={() => { setMode("suppliers"); setRan(false); setResults([]); }} className="gap-2">
          <Zap className="h-4 w-4" />Scout Suppliers → Find Seekers
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">
              {mode === "seekers" ? "Select Seekers" : "Select Suppliers"}
            </h2>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => mode === "seekers" ? setSelectedSeekerIds(new Set(seekers.map(s => s.id))) : setSelectedSupplierIds(new Set(suppliers.map(s => s.id)))}>
              All
            </Button>
          </div>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {mode === "seekers" ? seekers.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSeeker(s.id)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${selectedSeekerIds.has(s.id) ? "border-blue-500 bg-blue-950/30" : "border-gray-800 bg-gray-900 hover:border-gray-700"}`}
              >
                <div className="flex items-start gap-2">
                  {selectedSeekerIds.has(s.id) ? <CheckSquare className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" /> : <Square className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-xs font-medium text-white leading-tight">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.neededMW} MW · {s.type}</p>
                  </div>
                </div>
              </button>
            )) : suppliers.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSupplier(s.id)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${selectedSupplierIds.has(s.id) ? "border-yellow-500 bg-yellow-950/20" : "border-gray-800 bg-gray-900 hover:border-gray-700"}`}
              >
                <div className="flex items-start gap-2">
                  {selectedSupplierIds.has(s.id) ? <CheckSquare className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" /> : <Square className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-xs font-medium text-white leading-tight">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.availableMW} MW @ {s.estimatedAllInCents}¢ · {s.region}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <Button onClick={handleFind} className="w-full gap-2">
            <GitMerge className="h-4 w-4" />
            {mode === "seekers"
              ? `Find Matching Suppliers (${selectedSeekerIds.size} selected)`
              : `Find Matching Seekers (${selectedSupplierIds.size} selected)`}
          </Button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">
              {ran ? `${results.length} Match${results.length !== 1 ? "es" : ""} Found` : "Matches"}
            </h2>
            {ran && <p className="text-xs text-gray-400">Scored: Region 40% · MW Fit 30% · Price 30%</p>}
          </div>

          {!ran && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
              <GitMerge className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select {mode === "seekers" ? "seekers" : "suppliers"} from the left panel and click Find Matches.</p>
            </div>
          )}

          {ran && results.length === 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
              <p className="text-gray-400 text-sm">No strong matches found. Try selecting different entities or adjusting filters.</p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {results.map((match, i) => (
              <MatchCard
                key={`${match.supplier.id}-${match.seeker.id}-${i}`}
                match={match}
                onDealCreated={() => { show("Deal added to pipeline!", "success"); router.push("/pipeline"); }}
                onOutreach={() => router.push(`/outreach?supplierId=${match.supplier.id}&seekerId=${match.seeker.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense>
      <MatchesContent />
    </Suspense>
  );
}

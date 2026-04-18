"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import suppliersData from "@/data/suppliers.json";
import seekersData from "@/data/seekers.json";
import { Supplier, Seeker, OutreachTemplate } from "@/lib/types";
import { generateOutreachToSupplierMulti, generateOutreachToSeekerMulti } from "@/lib/outreach";
import { matchSeekersToSupplier, matchSuppliersToSeeker } from "@/lib/matching";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from "@/components/ui/toast";
import { Mail, Link2, Phone, Copy, Download, AlertTriangle, Search, ExternalLink, CheckSquare, Square } from "lucide-react";
import { generatePDF } from "@/lib/pdfGenerator";

const suppliers = suppliersData as Supplier[];
const seekers = seekersData as Seeker[];

const TEMPLATES: { value: OutreachTemplate; label: string; icon: React.ReactNode }[] = [
  { value: "cold-email", label: "Cold Email", icon: <Mail className="h-4 w-4" /> },
  { value: "linkedin", label: "LinkedIn Message", icon: <Link2 className="h-4 w-4" /> },
  { value: "call-script", label: "Call Script", icon: <Phone className="h-4 w-4" /> },
];

interface ScoutResult {
  email: string | null;
  source: string;
  confidence?: number;
  verified?: boolean;
  searchUrls?: Record<string, string>;
}

function ScoutPanel({ name, domain, company }: { name: string; domain: string; company: string }) {
  const [result, setResult] = useState<ScoutResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function scout() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/scout-email?name=${encodeURIComponent(name)}&domain=${encodeURIComponent(domain)}&company=${encodeURIComponent(company)}`
      );
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ email: null, source: "error", searchUrls: {} });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-gray-700/50 bg-gray-900/60 p-2 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-gray-400 font-medium">Scout: <span className="text-white">{name || "—"}</span></span>
        <Button size="sm" variant="outline" onClick={scout} className="h-6 text-[10px] px-2 gap-1">
          <Search className="h-3 w-3" />{loading ? "Searching…" : "Find Email"}
        </Button>
      </div>
      {result && (
        result.email ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Mail className="h-3 w-3 text-green-400 shrink-0" />
            <a href={`mailto:${result.email}`} className="text-green-400 font-mono hover:underline">{result.email}</a>
            {result.confidence && <span className="text-gray-500">({result.confidence}% conf.)</span>}
            <span className="text-gray-600">· {result.source}</span>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-500">No automated match — search manually:</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(result.searchUrls ?? {}).map(([k, url]) => (
                <a key={k} href={url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-400 hover:underline capitalize flex items-center gap-0.5">
                  {k} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function OutreachContent() {
  const searchParams = useSearchParams();
  const { toast, show, dismiss } = useToast();

  const [supplierId, setSupplierId] = useState<number>(
    searchParams.get("supplierId") ? Number(searchParams.get("supplierId")) : suppliers[0].id
  );
  const [seekerId, setSeekerId] = useState<number>(
    searchParams.get("seekerId") ? Number(searchParams.get("seekerId")) : seekers[0].id
  );
  const [recipient, setRecipient] = useState<"supplier" | "seeker">("supplier");
  const [template, setTemplate] = useState<OutreachTemplate>("cold-email");
  const [generated, setGenerated] = useState("");
  const [selectedCounterIds, setSelectedCounterIds] = useState<Set<number>>(new Set());
  const [showScout, setShowScout] = useState(false);

  const supplier = suppliers.find((s) => s.id === supplierId) ?? suppliers[0];
  const seeker = seekers.find((s) => s.id === seekerId) ?? seekers[0];

  const topMatches = useMemo(() => {
    if (recipient === "supplier") return matchSeekersToSupplier(supplier, seekers).slice(0, 8);
    return matchSuppliersToSeeker(seeker, suppliers).slice(0, 8);
  }, [supplier, seeker, recipient]);

  // Auto-select top 3 when party changes
  useEffect(() => {
    const top3 = topMatches.slice(0, 3).map((m) =>
      recipient === "supplier" ? m.seeker.id : m.supplier.id
    );
    setSelectedCounterIds(new Set(top3));
  }, [topMatches, recipient]);

  // Regenerate outreach
  useEffect(() => {
    if (selectedCounterIds.size === 0) {
      setGenerated("Select at least one counterparty to generate outreach.");
      return;
    }
    if (recipient === "supplier") {
      const sel = topMatches.filter((m) => selectedCounterIds.has(m.seeker.id)).map((m) => m.seeker);
      setGenerated(generateOutreachToSupplierMulti(supplier, sel, template));
    } else {
      const sel = topMatches.filter((m) => selectedCounterIds.has(m.supplier.id)).map((m) => m.supplier);
      setGenerated(generateOutreachToSeekerMulti(sel, seeker, template));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, seekerId, recipient, template, selectedCounterIds]);

  function toggleCounter(id: number) {
    setSelectedCounterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generated);
    show("Copied to clipboard!", "success");
  }

  async function handleDownloadPDF() {
    try {
      await generatePDF("site-teaser", supplier, seeker);
      show("Site Teaser PDF downloaded!", "success");
    } catch {
      show("PDF generation failed", "error");
    }
  }

  const scoutName = recipient === "supplier"
    ? supplier.keyContact?.split("–")[0].split("—")[0].trim() ?? ""
    : seeker.keyContact?.split("–")[0].split("—")[0].trim() ?? "";
  const scoutDomain = (() => {
    try { return new URL(recipient === "supplier" ? supplier.website : seeker.website).hostname.replace("www.", ""); }
    catch { return ""; }
  })();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}

      <div>
        <h1 className="text-2xl font-bold text-white">Outreach Generator</h1>
        <p className="text-gray-400 text-sm mt-0.5">Multi-party outreach — pitch all matched counterparties in one compelling message</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-blue-900/20 border border-blue-800/40 p-3">
        <AlertTriangle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300">Contacts researched from public sources (LinkedIn, IR pages, official websites). Use Scout Email to find direct decision-maker addresses. Verify everything before outreach. Engage attorneys before any commitment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Outreach Direction</label>
            <div className="mt-1.5 flex gap-2">
              <button onClick={() => setRecipient("supplier")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${recipient === "supplier" ? "bg-yellow-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                To Supplier
              </button>
              <button onClick={() => setRecipient("seeker")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${recipient === "seeker" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                To Seeker
              </button>
            </div>
          </div>

          {recipient === "supplier" ? (
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier (Recipient)</label>
              <select value={supplierId} onChange={(e) => setSupplierId(Number(e.target.value))}
                className="mt-1.5 w-full bg-gray-800 text-sm text-white rounded-md px-3 py-2 border border-gray-700 outline-none">
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="mt-2 rounded-md bg-gray-900 p-2 text-xs text-gray-400 space-y-0.5">
                <p><span className="text-gray-300">Region:</span> {supplier.region}</p>
                <p><span className="text-gray-300">Asset:</span> {supplier.availableMW} MW @ {supplier.estimatedAllInCents}¢</p>
                <p><span className="text-gray-300">Contact:</span> {supplier.keyContact?.split("–")[0].split("—")[0].trim()}</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Seeker (Recipient)</label>
              <select value={seekerId} onChange={(e) => setSeekerId(Number(e.target.value))}
                className="mt-1.5 w-full bg-gray-800 text-sm text-white rounded-md px-3 py-2 border border-gray-700 outline-none">
                {seekers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="mt-2 rounded-md bg-gray-900 p-2 text-xs text-gray-400 space-y-0.5">
                <p><span className="text-gray-300">Type:</span> {seeker.type}</p>
                <p><span className="text-gray-300">Need:</span> {seeker.neededMW} MW</p>
                <p><span className="text-gray-300">Contact:</span> {seeker.keyContact?.split("–")[0].split("—")[0].trim()}</p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {recipient === "supplier" ? "Buyers to Mention" : "Power Sources to Mention"}
              </label>
              <span className="text-[10px] text-gray-500">{selectedCounterIds.size} selected</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-1.5">Auto-ranked by match score. All checked = all mentioned in the outreach.</p>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {topMatches.map((m) => {
                const id = recipient === "supplier" ? m.seeker.id : m.supplier.id;
                const name = recipient === "supplier" ? m.seeker.name : m.supplier.name;
                const detail = recipient === "supplier"
                  ? `${m.seeker.neededMW} MW · ${m.seeker.type}`
                  : `${m.supplier.availableMW} MW · ${m.supplier.estimatedAllInCents}¢ · ${m.supplier.region}`;
                const checked = selectedCounterIds.has(id);
                return (
                  <button key={id} onClick={() => toggleCounter(id)}
                    className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${checked ? "bg-gray-700/80 border border-gray-600/40" : "bg-gray-900 hover:bg-gray-800"}`}>
                    {checked
                      ? <CheckSquare className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                      : <Square className="h-3.5 w-3.5 text-gray-600 shrink-0 mt-0.5" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white truncate">{name}</p>
                      <p className="text-[10px] text-gray-500">{detail} · <span className={m.score >= 75 ? "text-green-400" : m.score >= 50 ? "text-yellow-400" : "text-orange-400"}>Score {m.score}</span></p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Template Type</label>
            <div className="mt-1.5 space-y-1.5">
              {TEMPLATES.map((t) => (
                <button key={t.value} onClick={() => setTemplate(t.value)}
                  className={`w-full flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors ${template === t.value ? "bg-gray-700 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800"}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Scout Decision-Maker Email</label>
              <button onClick={() => setShowScout(!showScout)} className="text-[10px] text-blue-400 hover:underline">
                {showScout ? "Hide" : "Show"}
              </button>
            </div>
            {showScout && (
              <div className="mt-1.5">
                <ScoutPanel name={scoutName} domain={scoutDomain} company={recipient === "supplier" ? supplier.name : seeker.name} />
                <p className="text-[9px] text-gray-600 mt-1">Set HUNTER_API_KEY or APOLLO_API_KEY in .env.local for automated lookup. Otherwise uses search links.</p>
              </div>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">
              {TEMPLATES.find((t) => t.value === template)?.label}
              {" — To: "}{recipient === "supplier" ? supplier.name : seeker.name}
              {selectedCounterIds.size > 0 && (
                <span className="text-gray-400 font-normal text-xs ml-1">
                  · {selectedCounterIds.size} {recipient === "supplier" ? "buyer" : "site"}{selectedCounterIds.size !== 1 ? "s" : ""} mentioned
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
                <Copy className="h-3.5 w-3.5" />Copy
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />Site Teaser PDF
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 h-[600px] overflow-y-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{generated}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense>
      <OutreachContent />
    </Suspense>
  );
}

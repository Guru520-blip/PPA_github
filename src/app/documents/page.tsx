"use client";
import { useState } from "react";
import suppliersData from "@/data/suppliers.json";
import seekersData from "@/data/seekers.json";
import { Supplier, Seeker, DocTemplate } from "@/lib/types";
import { generatePDF } from "@/lib/pdfGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Download, AlertTriangle } from "lucide-react";
import { Toast, useToast } from "@/components/ui/toast";

function docRankScore(e: { urgencyScore: number; newBrokerFit?: number; startupFriendly: number }) {
  return e.urgencyScore * (e.newBrokerFit ?? e.startupFriendly);
}
const suppliers = [...(suppliersData as Supplier[])].sort((a, b) => docRankScore(b) - docRankScore(a));
const seekers = [...(seekersData as Seeker[])].sort((a, b) => docRankScore(b) - docRankScore(a));

const DOCS: { id: DocTemplate; title: string; description: string; pages: string; highlight?: boolean }[] = [
  { id: "blind-teaser", title: "Blind Asset Profile", description: "Pre-NCND one-pager: MW, region, asset type, timeline — fully anonymised. No operator name, no contacts, no pricing. Send this to get the first yes before any paperwork.", pages: "~1 page", highlight: true },
  { id: "site-teaser", title: "Site Teaser (Named)", description: "2-page confidential asset summary with non-circumvention disclaimer. Includes capacity, pricing, region, and opportunity overview. Send post-NCND.", pages: "~2 pages" },
  { id: "loi", title: "Letter of Intent (LOI)", description: "90-day exclusivity LOI with good-faith negotiation terms, mutual obligations, and broker fee acknowledgment.", pages: "~2 pages" },
  { id: "ncnd", title: "NCND Agreement", description: "Non-Circumvention, Non-Disclosure Agreement protecting broker introductions for 24 months with liquidated damages clause.", pages: "~2 pages" },
  { id: "mfpa", title: "Master Fee Protection (MFPA)", description: "Brokerage fee agreement with per-MW upfront and residual $/MWh options. Defines protected introductions and trigger events.", pages: "~2 pages" },
  { id: "ppa-outline", title: "PPA Outline Term Sheet", description: "High-level PPA structure: capacity, delivery, pricing, term, flexible load provisions, force majeure, and schedule placeholders.", pages: "~3 pages" },
];

export default function DocumentsPage() {
  const { toast, show, dismiss } = useToast();
  const [supplierId, setSupplierId] = useState(suppliers[0].id);
  const [seekerId, setSeekerId] = useState(seekers[0].id);
  const [loading, setLoading] = useState<DocTemplate | null>(null);

  const supplier = suppliers.find((s) => s.id === supplierId) ?? suppliers[0];
  const seeker = seekers.find((s) => s.id === seekerId) ?? seekers[0];

  async function handleGenerate(docId: DocTemplate) {
    setLoading(docId);
    try {
      await generatePDF(docId, supplier, seeker);
      show(`${DOCS.find((d) => d.id === docId)?.title} downloaded!`, "success");
    } catch (err) {
      console.error(err);
      show("PDF generation failed. Check console.", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}

      <div>
        <h1 className="text-2xl font-bold text-white">Documents Generator</h1>
        <p className="text-gray-400 text-sm mt-0.5">Generate professional deal documents pre-filled with supplier and seeker data</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-amber-900/20 border border-amber-800/40 p-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300">
          All generated documents are templates for guidance only. They do not constitute legal advice. Engage qualified attorneys before executing any agreement. All data/contacts must be independently verified.
        </p>
      </div>

      {/* Entity Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Power Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(Number(e.target.value))}
            className="mt-1.5 w-full bg-gray-800 text-sm text-white rounded-md px-3 py-2 border border-gray-700 outline-none"
          >
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="mt-2 text-xs text-gray-400 space-y-0.5">
            <p>{supplier.region} · {supplier.availableMW} MW · {supplier.estimatedAllInCents}¢/kWh</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Power Seeker</label>
          <select
            value={seekerId}
            onChange={(e) => setSeekerId(Number(e.target.value))}
            className="mt-1.5 w-full bg-gray-800 text-sm text-white rounded-md px-3 py-2 border border-gray-700 outline-none"
          >
            {seekers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="mt-2 text-xs text-gray-400 space-y-0.5">
            <p>{seeker.type} · {seeker.neededMW} MW needed</p>
          </div>
        </div>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCS.map((doc) => (
          <Card key={doc.id} className={doc.highlight ? "border-green-700/60 bg-green-950/10" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-lg p-2 ${doc.highlight ? "bg-green-900/40" : "bg-gray-800"}`}>
                  <FileText className={`h-5 w-5 ${doc.highlight ? "text-green-400" : "text-blue-400"}`} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {doc.highlight && <span className="text-[9px] font-semibold uppercase tracking-wider text-green-400 bg-green-900/40 border border-green-700/40 px-1.5 py-0.5 rounded">Send First</span>}
                  <span className="text-xs text-gray-500">{doc.pages}</span>
                </div>
              </div>
              <CardTitle className="text-sm mt-2">{doc.title}</CardTitle>
              <CardDescription className="text-xs">{doc.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleGenerate(doc.id)}
                disabled={loading === doc.id}
                className={`w-full gap-2 ${doc.highlight ? "bg-green-700 hover:bg-green-600" : ""}`}
                size="sm"
              >
                {loading === doc.id ? (
                  <span className="flex items-center gap-2"><span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />Generating...</span>
                ) : (
                  <><Download className="h-3.5 w-3.5" />Download PDF</>
                )}
              </Button>
              <p className="mt-2 text-[10px] text-gray-600 text-center">
                {doc.id === "blind-teaser" ? `Asset ref: ASSET-${String(supplier.id).padStart(4, "0")} (anonymised)` : `${supplier.name.split("–")[0].trim()} ↔ ${seeker.name.split("–")[0].trim()}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <h3 className="text-sm font-semibold text-white mb-2">Current Deal Context</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div><p className="text-gray-400">Supplier</p><p className="text-white font-medium">{supplier.name.split("–")[0].trim()}</p></div>
          <div><p className="text-gray-400">Seeker</p><p className="text-white font-medium">{seeker.name.split("–")[0].trim()}</p></div>
          <div><p className="text-gray-400">MW</p><p className="text-white font-medium">{Math.min(supplier.availableMW, seeker.neededMW)} MW</p></div>
          <div><p className="text-gray-400">Price</p><p className="text-white font-medium">{supplier.estimatedAllInCents}¢/kWh</p></div>
        </div>
      </div>
    </div>
  );
}

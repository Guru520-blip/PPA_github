"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import suppliersData from "@/data/suppliers.json";
import seekersData from "@/data/seekers.json";
import { Supplier, Seeker, OutreachTemplate } from "@/lib/types";
import { generateOutreachToSupplier, generateOutreachToSeeker } from "@/lib/outreach";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from "@/components/ui/toast";
import { Mail, Link2, Phone, Copy, Download, AlertTriangle } from "lucide-react";
import { generatePDF } from "@/lib/pdfGenerator";

const suppliers = suppliersData as Supplier[];
const seekers = seekersData as Seeker[];

const TEMPLATES: { value: OutreachTemplate; label: string; icon: React.ReactNode }[] = [
  { value: "cold-email", label: "Cold Email", icon: <Mail className="h-4 w-4" /> },
  { value: "linkedin", label: "LinkedIn Message", icon: <Link2 className="h-4 w-4" /> },
  { value: "call-script", label: "Call Script", icon: <Phone className="h-4 w-4" /> },
];

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

  const supplier = suppliers.find((s) => s.id === supplierId) ?? suppliers[0];
  const seeker = seekers.find((s) => s.id === seekerId) ?? seekers[0];

  useEffect(() => {
    generateText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, seekerId, recipient, template]);

  function generateText() {
    const text =
      recipient === "supplier"
        ? generateOutreachToSupplier(supplier, seeker, template)
        : generateOutreachToSeeker(supplier, seeker, template);
    setGenerated(text);
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}

      <div>
        <h1 className="text-2xl font-bold text-white">Outreach Generator</h1>
        <p className="text-gray-400 text-sm mt-0.5">Personalized emails, LinkedIn messages, and call scripts for both sides</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-blue-900/20 border border-blue-800/40 p-3">
        <AlertTriangle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300">Contacts are researched from public sources (LinkedIn, IR pages, official websites). Verify before outreach — decision-makers change. Templates use real buyer-type pricing intelligence, not generic thresholds. Engage attorneys before any commitment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier (Power Asset)</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              className="mt-1.5 w-full bg-gray-800 text-sm text-white rounded-md px-3 py-2 border border-gray-700 outline-none"
            >
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="mt-2 rounded-md bg-gray-900 p-2 text-xs text-gray-400 space-y-0.5">
              <p><span className="text-gray-300">Region:</span> {supplier.region}</p>
              <p><span className="text-gray-300">Capacity:</span> {supplier.availableMW} MW @ {supplier.estimatedAllInCents}¢</p>
              <p><span className="text-gray-300">Pain:</span> {supplier.keyPain.split(";")[0]}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Seeker (Power Buyer)</label>
            <select
              value={seekerId}
              onChange={(e) => setSeekerId(Number(e.target.value))}
              className="mt-1.5 w-full bg-gray-800 text-sm text-white rounded-md px-3 py-2 border border-gray-700 outline-none"
            >
              {seekers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="mt-2 rounded-md bg-gray-900 p-2 text-xs text-gray-400 space-y-0.5">
              <p><span className="text-gray-300">Type:</span> {seeker.type}</p>
              <p><span className="text-gray-300">Need:</span> {seeker.neededMW} MW</p>
              <p><span className="text-gray-300">Pain:</span> {seeker.keyPain.split(";")[0]}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Outreach Recipient</label>
            <div className="mt-1.5 flex gap-2">
              <button
                onClick={() => setRecipient("supplier")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${recipient === "supplier" ? "bg-yellow-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
              >
                To Supplier
              </button>
              <button
                onClick={() => setRecipient("seeker")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${recipient === "seeker" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
              >
                To Seeker
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Template Type</label>
            <div className="mt-1.5 space-y-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTemplate(t.value)}
                  className={`w-full flex items-center gap-2 py-2 px-3 rounded-md text-sm transition-colors ${template === t.value ? "bg-gray-700 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800"}`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">
              {TEMPLATES.find((t) => t.value === template)?.label} — {recipient === "supplier" ? `To: ${supplier.name}` : `To: ${seeker.name}`}
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
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 h-[580px] overflow-y-auto">
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

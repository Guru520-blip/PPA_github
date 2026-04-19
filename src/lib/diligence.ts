import { PipelineDeal } from "./types";

export interface ChecklistItem { id: string; category: string; label: string; }

export const DILIGENCE_CHECKLIST: ChecklistItem[] = [
  // Legal
  { id: "land-rights",   category: "Legal",      label: "Land / mineral rights confirmed" },
  { id: "env-permits",   category: "Legal",      label: "Environmental permits in place" },
  { id: "interconnect",  category: "Legal",      label: "Grid interconnection agreement reviewed" },
  { id: "local-approvals",category: "Legal",     label: "Local / state / federal approvals obtained" },
  { id: "emissions",     category: "Legal",      label: "Flaring / emissions compliance verified" },
  // Commercial
  { id: "board-auth",    category: "Commercial", label: "Board authorisation confirmed (buyer)" },
  { id: "timeline",      category: "Commercial", label: "Deployment timeline committed in writing" },
  { id: "credit",        category: "Commercial", label: "Buyer creditworthiness / financials reviewed" },
  { id: "price-range",   category: "Commercial", label: "Offtake price within buyer's stated range" },
  { id: "ncnd",          category: "Commercial", label: "NCND signed by both parties" },
  // Financial
  { id: "capex-zero",    category: "Financial",  label: "Seller capex zero — buyer-funded structure confirmed" },
  { id: "letter-credit", category: "Financial",  label: "Letter of Credit / credit support agreed" },
  { id: "payment-terms", category: "Financial",  label: "Payment terms and invoicing schedule aligned" },
  { id: "mfpa",          category: "Financial",  label: "MFPA / fee protection agreement executed" },
  // Technical
  { id: "mw-verified",   category: "Technical",  label: "MW capacity verified on-site or technically" },
  { id: "grid-stability",category: "Technical",  label: "Grid stability / power quality confirmed" },
  { id: "transmission",  category: "Technical",  label: "Transmission losses accounted for in pricing" },
  { id: "load-profile",  category: "Technical",  label: "Load profile compatibility confirmed" },
  { id: "curtailment",   category: "Technical",  label: "Curtailment / emergency shutoff provisions agreed" },
];

const KEY = "powermatch_diligence";
type DiligenceState = Record<string, Record<string, boolean>>;

export function loadAllDiligence(): DiligenceState {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

export function toggleItem(dealId: string, itemId: string): Record<string, boolean> {
  const all = loadAllDiligence();
  if (!all[dealId]) all[dealId] = {};
  all[dealId][itemId] = !all[dealId][itemId];
  localStorage.setItem(KEY, JSON.stringify(all));
  return all[dealId];
}

export function getDealDiligence(dealId: string): Record<string, boolean> {
  return loadAllDiligence()[dealId] ?? {};
}

export function diligenceProgress(dealId: string): { done: number; total: number; pct: number } {
  const state = getDealDiligence(dealId);
  const done = Object.values(state).filter(Boolean).length;
  const total = DILIGENCE_CHECKLIST.length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

// CSV export (LevelTen-style reporting)
export function exportPipelineCSV(deals: PipelineDeal[], dealValueFn: (mw: number, c: number, y: number) => number, brokerFeeFn: (mw: number, c: number, y: number, p: number) => number, stageProbFn: (s: string) => number): void {
  const headers = ["Status", "Supplier", "Seeker", "MW", "¢/kWh", "Contract Yrs", "Deal Value $M", "Broker Fee $M", "Probability %", "Diligence %", "Next Action", "Created", "Notes"];
  const rows = deals.map(d => {
    const yrs = d.contractYears ?? 10;
    const { pct } = diligenceProgress(d.id);
    return [
      d.status,
      `"${d.supplierName}"`,
      `"${d.seekerName}"`,
      d.mw,
      d.centsPerKwh,
      yrs,
      dealValueFn(d.mw, d.centsPerKwh, yrs).toFixed(2),
      brokerFeeFn(d.mw, d.centsPerKwh, yrs, d.brokerFeePct ?? 2).toFixed(2),
      d.probability ?? stageProbFn(d.status),
      pct,
      `"${d.nextAction ?? ""}"`,
      d.createdAt.slice(0, 10),
      `"${(d.notes ?? "").replace(/"/g, "'")}"`,
    ];
  });
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `powermatch_pipeline_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

"use client";
import { PipelineDeal, DealStatus } from "./types";

const KEY = "powermatch_pipeline";

export function loadPipeline(): PipelineDeal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePipeline(deals: PipelineDeal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(deals));
}

export function addDeal(deal: Omit<PipelineDeal, "id" | "createdAt" | "updatedAt">): PipelineDeal {
  const deals = loadPipeline();
  const newDeal: PipelineDeal = {
    ...deal,
    id: `deal_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  savePipeline([...deals, newDeal]);
  return newDeal;
}

export function updateDeal(id: string, updates: Partial<PipelineDeal>): void {
  const deals = loadPipeline();
  const updated = deals.map((d) =>
    d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
  );
  savePipeline(updated);
}

export function removeDeal(id: string): void {
  const deals = loadPipeline();
  savePipeline(deals.filter((d) => d.id !== id));
}

export const DEAL_STATUSES: DealStatus[] = [
  "Sourced",
  "Matched",
  "Outreach Sent",
  "NDA",
  "Diligence",
  "Closing",
];

// Probability of close by stage — used for pipeline forecast (Zeigo/LevelTen standard)
export const STAGE_PROBABILITY: Record<DealStatus, number> = {
  Sourced: 5,
  Matched: 15,
  "Outreach Sent": 25,
  NDA: 45,
  Diligence: 70,
  Closing: 90,
};

// Estimated annual revenue per MW at a given ¢/kWh (8,760 hrs/yr)
export function annualRevenuePerMW(centsPerKwh: number): number {
  return (centsPerKwh / 100) * 8760 * 1000; // $ per MW-year
}

// Total contract value in $M
export function dealValueM(mw: number, centsPerKwh: number, years = 10): number {
  return (annualRevenuePerMW(centsPerKwh) * mw * years) / 1_000_000;
}

// Broker fee in $M (default 2% of contract value)
export function brokerFeeM(mw: number, centsPerKwh: number, years = 10, feePct = 2): number {
  return (dealValueM(mw, centsPerKwh, years) * feePct) / 100;
}

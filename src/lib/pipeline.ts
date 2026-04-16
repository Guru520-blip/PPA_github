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
  "Closing",
];

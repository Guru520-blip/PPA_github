export interface Supplier {
  id: number;
  name: string;
  region: string;
  availableMW: number;
  estimatedAllInCents: number;
  type: string;
  keyPain: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  notes: string;
}

export interface Seeker {
  id: number;
  name: string;
  type: string;
  neededMW: number;
  preferredRegions: string[];
  keyPain: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  notes: string;
}

export interface MatchResult {
  supplier: Supplier;
  seeker: Seeker;
  score: number;
  regionMatch: boolean;
  mwFit: boolean;
  priceAlignment: boolean;
  reasons: string[];
}

export type DealStatus = "Sourced" | "Matched" | "Outreach Sent" | "NDA" | "Closing";

export interface PipelineDeal {
  id: string;
  supplierId: number;
  seekerId: number;
  supplierName: string;
  seekerName: string;
  status: DealStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  mw: number;
  centsPerKwh: number;
}

export type OutreachTemplate = "cold-email" | "linkedin" | "call-script";
export type DocTemplate = "site-teaser" | "loi" | "ncnd" | "mfpa" | "ppa-outline";

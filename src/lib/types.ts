export interface Supplier {
  id: number;
  name: string;
  region: string;
  availableMW: number;
  estimatedAllInCents: number;
  type: string;
  keyPain: string;
  contactEmail: string;
  contactEmailAlt?: string;
  contactPhone: string;
  contactForm?: string;
  website: string;
  address?: string;
  keyContact?: string;
  keyContactLinkedIn?: string;
  notes: string;
  urgencyScore: number;    // 1-10: how urgently supplier needs offtake deal
  startupFriendly: number; // 1-10: likelihood to engage with a startup broker
  // ── Verified asset claims (only assert in outreach what's confirmed here) ──
  permitStatus?: "Confirmed" | "Seller-stated" | "Not verified";
  noInterconnectionQueue?: boolean;   // true = confirmed no new queue needed
  estimatedMonthsToEnergization?: number; // point estimate; range shown as N to N+6
  newBrokerFit?: number;             // 1-10: realistic probability of engaging a new/boutique broker
  strategyTags?: string[];           // e.g. ["btm-gas","permian","esg-premium","fast-track"]
  lastSignalDate?: string;           // ISO date of most recent verifiable market signal
  signalNote?: string;               // brief description of the signal
}

export interface Seeker {
  id: number;
  name: string;
  type: string;
  neededMW: number;
  preferredRegions: string[];
  keyPain: string;
  contactEmail: string;
  contactEmailBD?: string;
  contactPhone: string;
  contactForm?: string;
  website: string;
  address?: string;
  keyContact?: string;
  keyContactLinkedIn?: string;
  keyContact2?: string;
  notes: string;
  urgencyScore: number;    // 1-10: urgency of power procurement need
  startupFriendly: number; // 1-10: openness to working with startup brokers
  // ── Engagement intelligence ────────────────────────────────────────────────
  newBrokerFit?: number;    // 1-10: realistic probability of engaging a new/boutique broker
  capexCommitted?: boolean; // true = capital deployment publicly disclosed in investor filings
  strategyTags?: string[];  // e.g. ["btc-miner","ai-pivot","nasdaq","btm-friendly"]
  lastSignalDate?: string;  // ISO date of most recent verifiable market signal
  signalNote?: string;      // brief description of the signal
}

export interface MatchResult {
  supplier: Supplier;
  seeker: Seeker;
  score: number;
  regionMatch: boolean;
  mwFit: boolean;
  priceAlignment: boolean;
  reasons: string[];
  suggestedPriceCents: number;
  priceRationale: string;
}

export type DealStatus = "Sourced" | "Matched" | "Outreach Sent" | "NDA" | "Diligence" | "Closing";

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
  contractYears?: number;    // PPA term (default 10)
  probability?: number;      // close probability % (auto by stage)
  nextAction?: string;       // next CRM step
  brokerFeePct?: number;     // broker fee % of deal value (default 2)
}

export type OutreachTemplate = "cold-email" | "linkedin" | "call-script";
export type DocTemplate = "site-teaser" | "blind-teaser" | "loi" | "ncnd" | "mfpa" | "ppa-outline";

// Dynamic pricing intelligence tiers
export type BuyerTier = "hyperscaler" | "miner" | "hybrid" | "curtailable";

export interface PricingProfile {
  tier: BuyerTier;
  minCents: number;
  targetCents: number;
  maxCents: number;
  label: string;
  rationale: string;
}

export const BUYER_PRICING: Record<string, PricingProfile> = {
  "AI Hyperscaler": {
    tier: "hyperscaler",
    minCents: 3.5,
    targetCents: 5.5,
    maxCents: 8.0,
    label: "Hyperscaler Rate",
    rationale: "Hyperscalers prioritize speed, ESG compliance, and reliability over cost. Can pay 5-8¢ for fast-deployment renewable capacity."
  },
  "Bitcoin Miner Pivoting to AI": {
    tier: "miner",
    minCents: 2.5,
    targetCents: 3.8,
    maxCents: 5.0,
    label: "Miner/AI Pivot Rate",
    rationale: "Miners operate on thin margins; post-halving BTM gas at 2.5-4¢ is required for viability. AI pivot revenue ($2-4M/MW) allows slightly higher tolerance."
  },
  "Hybrid Compute": {
    tier: "hybrid",
    minCents: 3.0,
    targetCents: 4.5,
    maxCents: 6.0,
    label: "HPC/Hybrid Rate",
    rationale: "HPC operators balance energy cost vs. compute density. Target 3.5-5¢ for competitive AI co-location margins."
  }
};

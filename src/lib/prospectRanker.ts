import { Supplier, Seeker } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Prospect Ranker
// Re-ranks the full supplier/seeker pool each time Refresh is pressed.
// Combines urgency × broker-fit × strategy weights × seasonal triggers
// × signal freshness + small jitter so the list feels alive.
// ─────────────────────────────────────────────────────────────────────────────

export type Strategy =
  | "default"
  | "btm-heavy"
  | "esg-forward"
  | "emerging-mkt"
  | "crypto-pivot"
  | "americas-only";

export interface RankInput {
  strategy: Strategy;
  date: Date;
  seed: number; // bumped on each Refresh click for jitter
}

export const STRATEGY_LABELS: Record<Strategy, string> = {
  "default":      "Default — balanced urgency × fit",
  "btm-heavy":    "BTM-Heavy — Permian/Bakken gas priority",
  "esg-forward":  "ESG-Forward — hydro/geothermal + CFE buyers",
  "emerging-mkt": "Emerging Markets — Africa/Asia/LATAM hydro",
  "crypto-pivot": "Crypto→AI Pivot — miners converting to compute",
  "americas-only":"Americas Only — US/Canada/LATAM focus",
};

// ─── Strategy tag boost multipliers ──────────────────────────────────────────

const SUPPLIER_BOOSTS: Record<Strategy, Partial<Record<string, number>>> = {
  "default":      {},
  "btm-heavy":    { "btm-gas": 1.35, "permian": 1.2, "bakken": 1.2, "appalachia": 1.1 },
  "esg-forward":  { "hydro": 1.35, "geothermal": 1.3, "renewables": 1.2, "esg-premium": 1.2 },
  "emerging-mkt": { "emerging-mkt": 1.35, "africa": 1.3, "asia-pac": 1.25, "latam": 1.2 },
  "crypto-pivot": { "btm-gas": 1.3, "curtailment": 1.2, "fast-track": 1.15 },
  "americas-only":{ "americas": 1.3, "permian": 1.15, "bakken": 1.15, "latam": 1.1 },
};

const SEEKER_BOOSTS: Record<Strategy, Partial<Record<string, number>>> = {
  "default":      {},
  "btm-heavy":    { "btm-friendly": 1.3, "btc-miner": 1.2, "ai-pivot": 1.2 },
  "esg-forward":  { "esg-required": 1.35, "hyperscaler": 1.2, "hpc-colo": 1.1 },
  "emerging-mkt": { "hpc-colo": 1.2, "neocloud": 1.25, "data-center": 1.1 },
  "crypto-pivot": { "ai-pivot": 1.4, "btc-miner": 1.3, "btm-friendly": 1.2 },
  "americas-only":{ "americas": 1.3, "btc-miner": 1.1, "hpc-colo": 1.1 },
};

// ─── Seasonal urgency boosts (month 1-12) ────────────────────────────────────
// Based on real cycles: EPA enforcement (Q2), earnings (Q1/Q3), budget cycle (Q4)

function seasonalBoost(tags: string[], month: number): number {
  let boost = 1.0;
  // Q2 (Apr-Jun): EPA flaring enforcement tightens — BTM gas opportunity
  if (month >= 4 && month <= 6 && (tags.includes("btm-gas") || tags.includes("permian")))
    boost *= 1.2;
  // Q1 (Jan-Mar) / Q3 (Jul-Sep): US earnings release months — listed companies show urgency
  if ((month >= 1 && month <= 3) || (month >= 7 && month <= 9)) {
    if (tags.includes("nasdaq") || tags.includes("nyse")) boost *= 1.1;
  }
  // Q4 (Oct-Dec): Budget commitments — hyperscalers lock capacity before year-end
  if (month >= 10 && month <= 12) {
    if (tags.includes("hyperscaler") || tags.includes("esg-required")) boost *= 1.15;
    if (tags.includes("btm-gas")) boost *= 1.1; // Q4 ops review
  }
  // Hydro high-water season (May-Sep in sub-Saharan / LATAM)
  if (month >= 5 && month <= 9 && (tags.includes("africa") || tags.includes("latam") || tags.includes("hydro")))
    boost *= 1.1;
  return boost;
}

// ─── Signal freshness multiplier ─────────────────────────────────────────────

function signalFreshness(lastSignalDate: string | undefined, today: Date): number {
  if (!lastSignalDate) return 1.0;
  const ageDays = (today.getTime() - new Date(lastSignalDate).getTime()) / 86_400_000;
  if (ageDays < 30) return 1.25;
  if (ageDays < 90) return 1.15;
  if (ageDays < 180) return 1.05;
  if (ageDays > 365) return 0.9;
  return 1.0;
}

// ─── Deterministic jitter (avoids full re-sort noise but rotates within bands) ─

function jitter(id: number, seed: number): number {
  // small sine-based jitter ±8% so refresh moves prospects within their urgency band
  return 1 + Math.sin((seed * 7.3 + id * 3.1) % (Math.PI * 2)) * 0.08;
}

// ─── Core scoring ─────────────────────────────────────────────────────────────

function scoreSupplier(s: Supplier, input: RankInput): number {
  const fit = s.newBrokerFit ?? s.startupFriendly ?? 5;
  let score = s.urgencyScore * fit;

  const tags = s.strategyTags ?? [];
  const boosts = SUPPLIER_BOOSTS[input.strategy];
  for (const tag of tags) {
    if (boosts[tag]) score *= boosts[tag]!;
  }

  score *= seasonalBoost(tags, input.date.getMonth() + 1);
  score *= signalFreshness(s.lastSignalDate, input.date);
  score *= jitter(s.id, input.seed);

  return score;
}

function scoreSeeker(s: Seeker, input: RankInput): number {
  const fit = s.newBrokerFit ?? s.startupFriendly ?? 5;
  let score = s.urgencyScore * fit;

  const tags = s.strategyTags ?? [];
  const boosts = SEEKER_BOOSTS[input.strategy];
  for (const tag of tags) {
    if (boosts[tag]) score *= boosts[tag]!;
  }

  score *= seasonalBoost(tags, input.date.getMonth() + 1);
  score *= signalFreshness(s.lastSignalDate, input.date);
  score *= jitter(s.id, input.seed);

  return score;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function rankSuppliers(pool: Supplier[], input: RankInput): Supplier[] {
  return [...pool].sort((a, b) => scoreSupplier(b, input) - scoreSupplier(a, input));
}

export function rankSeekers(pool: Seeker[], input: RankInput): Seeker[] {
  return [...pool].sort((a, b) => scoreSeeker(b, input) - scoreSeeker(a, input));
}

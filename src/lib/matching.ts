import { Supplier, Seeker, MatchResult } from "./types";

const PRICE_TARGET_CENTS = 5.0; // max acceptable

function regionOverlap(supplierRegion: string, seekerRegions: string[]): boolean {
  const sr = supplierRegion.toLowerCase();
  return seekerRegions.some((r) => {
    const rr = r.toLowerCase();
    if (sr.includes("texas") && rr.includes("texas")) return true;
    if (sr.includes("permian") && (rr.includes("permian") || rr.includes("texas"))) return true;
    if (sr.includes("paraguay") && rr.includes("paraguay")) return true;
    if (sr.includes("ethiopia") && rr.includes("ethiopia")) return true;
    if (sr.includes("iceland") && rr.includes("iceland")) return true;
    if (sr.includes("north dakota") && rr.includes("north dakota")) return true;
    if (sr.includes("alberta") && rr.includes("alberta")) return true;
    if (sr.includes("south") && rr.includes("south")) return true;
    return sr === rr;
  });
}

function mwFitScore(availableMW: number, neededMW: number): number {
  const ratio = availableMW / neededMW;
  if (ratio >= 0.5 && ratio <= 3.0) return 1.0;
  if (ratio >= 0.3 && ratio < 0.5) return 0.6;
  if (ratio > 3.0 && ratio <= 5.0) return 0.7;
  return 0.2;
}

function priceScore(estimatedCents: number): number {
  if (estimatedCents <= 4.0) return 1.0;
  if (estimatedCents <= 4.5) return 0.8;
  if (estimatedCents <= 5.0) return 0.5;
  return 0.1;
}

export function matchSuppliersToSeeker(seeker: Seeker, suppliers: Supplier[]): MatchResult[] {
  return suppliers
    .map((supplier) => {
      const regionMatch = regionOverlap(supplier.region, seeker.preferredRegions);
      const mwScore = mwFitScore(supplier.availableMW, seeker.neededMW);
      const pScore = priceScore(supplier.estimatedAllInCents);
      const regionScore = regionMatch ? 1.0 : 0.1;

      const score = Math.round((regionScore * 0.4 + mwScore * 0.3 + pScore * 0.3) * 100);

      const reasons: string[] = [];
      if (regionMatch) reasons.push(`Region match: ${supplier.region} aligns with preferred regions`);
      if (supplier.estimatedAllInCents <= 4.0) reasons.push(`Excellent price: ${supplier.estimatedAllInCents}¢/kWh all-in`);
      else if (supplier.estimatedAllInCents <= PRICE_TARGET_CENTS) reasons.push(`Competitive price: ${supplier.estimatedAllInCents}¢/kWh all-in`);
      if (mwScore >= 0.9) reasons.push(`Strong MW fit: ${supplier.availableMW} MW available vs ${seeker.neededMW} MW needed`);
      else if (mwScore >= 0.6) reasons.push(`Partial MW fit: ${supplier.availableMW} MW available vs ${seeker.neededMW} MW needed`);
      if (supplier.type.includes("Hydro") && seeker.type.includes("Hyperscaler")) reasons.push("Renewable hydro matches ESG requirements");
      if (supplier.type.includes("BTM") && seeker.type.includes("Miner")) reasons.push("BTM gas ideal for flexible compute load profile");

      return {
        supplier,
        seeker,
        score,
        regionMatch,
        mwFit: mwScore >= 0.6,
        priceAlignment: supplier.estimatedAllInCents <= PRICE_TARGET_CENTS,
        reasons,
      };
    })
    .filter((r) => r.score >= 20)
    .sort((a, b) => b.score - a.score);
}

export function matchSeekersToSupplier(supplier: Supplier, seekers: Seeker[]): MatchResult[] {
  return seekers
    .map((seeker) => {
      const regionMatch = regionOverlap(supplier.region, seeker.preferredRegions);
      const mwScore = mwFitScore(supplier.availableMW, seeker.neededMW);
      const pScore = priceScore(supplier.estimatedAllInCents);
      const regionScore = regionMatch ? 1.0 : 0.1;

      const score = Math.round((regionScore * 0.4 + mwScore * 0.3 + pScore * 0.3) * 100);

      const reasons: string[] = [];
      if (regionMatch) reasons.push(`Region match: ${seeker.name} targets ${supplier.region}`);
      if (supplier.estimatedAllInCents <= 4.0) reasons.push(`Below target price: ${supplier.estimatedAllInCents}¢/kWh`);
      if (mwScore >= 0.9) reasons.push(`MW fit: ${supplier.availableMW} MW vs ${seeker.neededMW} MW needed`);

      return {
        supplier,
        seeker,
        score,
        regionMatch,
        mwFit: mwScore >= 0.6,
        priceAlignment: supplier.estimatedAllInCents <= PRICE_TARGET_CENTS,
        reasons,
      };
    })
    .filter((r) => r.score >= 20)
    .sort((a, b) => b.score - a.score);
}

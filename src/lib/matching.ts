import { Supplier, Seeker, MatchResult, BUYER_PRICING } from "./types";

// Dynamic price scoring — no hardcoded "≤5¢" ceiling.
// Each buyer type has its own pricing tolerance profile.
function getPricingProfile(seekerType: string) {
  return BUYER_PRICING[seekerType] ?? BUYER_PRICING["Hybrid Compute"];
}

function regionOverlap(supplierRegion: string, seekerRegions: string[]): boolean {
  const sr = supplierRegion.toLowerCase();
  return seekerRegions.some((r) => {
    const rr = r.toLowerCase();
    if (sr === rr) return true;
    // Texas sub-regions — any Texas region matches any other Texas region
    if (sr.includes("texas") && rr.includes("texas")) return true;
    if (sr.includes("permian") && (rr.includes("permian") || rr.includes("texas"))) return true;
    if (rr.includes("permian") && sr.includes("texas")) return true;
    // North America
    if (sr.includes("bakken") && (rr.includes("bakken") || rr.includes("north dakota"))) return true;
    if (rr.includes("bakken") && sr.includes("north dakota")) return true;
    if (sr.includes("alberta") && (rr.includes("alberta") || rr.includes("canada"))) return true;
    if (sr.includes("quebec") && (rr.includes("quebec") || rr.includes("canada"))) return true;
    if (sr.includes("appalachia") && (rr.includes("appalachia") || rr.includes("pennsylvania"))) return true;
    if (sr.includes("pennsylvania") && (rr.includes("pennsylvania") || rr.includes("appalachia"))) return true;
    // Word-level broad matching for global regions — extract meaningful words and check overlap
    const stopwords = new Set(["usa", "the", "and", "for", "east", "west", "south", "north"]);
    const srWords = sr.split(/[\s,/-]+/).filter(w => w.length >= 4 && !stopwords.has(w));
    const rrWords = rr.split(/[\s,/-]+/).filter(w => w.length >= 4 && !stopwords.has(w));
    return srWords.some(w => rrWords.some(rw => rw.includes(w) || w.includes(rw)));
  });
}

function mwFitScore(availableMW: number, neededMW: number): number {
  const ratio = availableMW / neededMW;
  if (ratio >= 0.5 && ratio <= 3.0) return 1.0;   // strong fit
  if (ratio >= 0.3 && ratio < 0.5) return 0.6;    // partial (supplier can cover 30-50%)
  if (ratio > 3.0 && ratio <= 6.0) return 0.7;    // supplier has more than needed (good)
  if (ratio > 6.0) return 0.5;                    // massive surplus — still possible, partial credit
  return 0.2;
}

// Dynamic price score — based on buyer's actual pricing tolerance, not a global ceiling
function dynamicPriceScore(supplierCents: number, seekerType: string): number {
  const profile = getPricingProfile(seekerType);
  if (supplierCents <= profile.minCents) return 1.0;       // below floor = excellent
  if (supplierCents <= profile.targetCents) return 0.9;   // at target = strong
  if (supplierCents <= profile.maxCents) return 0.65;     // within max = acceptable
  // Above max — penalise but don't eliminate (market conditions may justify premium)
  const overshoot = (supplierCents - profile.maxCents) / profile.maxCents;
  return Math.max(0.1, 0.5 - overshoot);
}

// Derive the market-appropriate suggested price for this specific pair
function suggestedPrice(supplier: Supplier, seeker: Seeker): { price: number; rationale: string } {
  const profile = getPricingProfile(seeker.type);
  const raw = supplier.estimatedAllInCents;

  // Hyperscalers: willing to pay premium for speed + ESG — anchor toward target
  if (profile.tier === "hyperscaler") {
    const markup = supplier.type.includes("Hydro") ? 0.3 : 0.15; // ESG premium for hydro
    const suggested = Math.min(profile.maxCents, Math.max(raw * (1 + markup), profile.targetCents));
    return {
      price: Math.round(suggested * 100) / 100,
      rationale: `Hyperscaler premium: ${raw}¢ base + deployment-speed/ESG markup. Market comps: Google/Microsoft paying 4-7¢ for fast-track renewable capacity.`
    };
  }

  // Miners: margin-sensitive — price at cost + thin spread
  if (profile.tier === "miner") {
    const suggested = Math.min(profile.targetCents, Math.max(raw, profile.minCents));
    return {
      price: Math.round(suggested * 100) / 100,
      rationale: `Mining economics: target ≤${profile.targetCents}¢ for viability. AI pivot revenue ($2-4M/MW) slightly expands tolerance. Curtailment pricing preferred.`
    };
  }

  // Hybrid: moderate — between raw cost and target
  const suggested = Math.min(profile.maxCents, (raw + profile.targetCents) / 2);
  return {
    price: Math.round(suggested * 100) / 100,
    rationale: `HPC market rate: balanced between supplier economics (${raw}¢) and HPC target (${profile.targetCents}¢). Comparable Applied Digital / TeraWulf deals at 3.5-5¢.`
  };
}

// ESG/fuel type bonus — hyperscalers pay more for renewable
function esgBonus(supplierType: string, seekerType: string): number {
  if (seekerType === "AI Hyperscaler" && (supplierType.includes("Hydro") || supplierType.includes("Wind") || supplierType.includes("Curtailment"))) return 0.1;
  if (seekerType === "Bitcoin Miner Pivoting to AI" && supplierType.includes("BTM")) return 0.08;
  return 0;
}

export function matchSuppliersToSeeker(seeker: Seeker, suppliers: Supplier[]): MatchResult[] {
  return suppliers
    .map((supplier) => {
      const regionMatch = regionOverlap(supplier.region, seeker.preferredRegions);
      const mwScore = mwFitScore(supplier.availableMW, seeker.neededMW);
      const pScore = dynamicPriceScore(supplier.estimatedAllInCents, seeker.type);
      const regionScore = regionMatch ? 1.0 : 0.12;
      const bonus = esgBonus(supplier.type, seeker.type);

      const score = Math.round(Math.min(100, (regionScore * 0.40 + mwScore * 0.30 + pScore * 0.30 + bonus) * 100));

      const { price: suggestedPriceCents, rationale: priceRationale } = suggestedPrice(supplier, seeker);
      const profile = getPricingProfile(seeker.type);

      const reasons: string[] = [];
      if (regionMatch) reasons.push(`Region match: ${supplier.region} aligns with ${seeker.name}'s preferred zones`);
      else reasons.push(`Region: ${supplier.region} is outside preferred zones — evaluate as global opportunity`);

      if (supplier.estimatedAllInCents <= profile.targetCents)
        reasons.push(`Strong price fit: ${supplier.estimatedAllInCents}¢ is below ${seeker.type} target of ${profile.targetCents}¢`);
      else if (supplier.estimatedAllInCents <= profile.maxCents)
        reasons.push(`Acceptable price: ${supplier.estimatedAllInCents}¢ within ${seeker.type} max (${profile.maxCents}¢) — negotiate down`);
      else
        reasons.push(`Price stretch: ${supplier.estimatedAllInCents}¢ exceeds ${seeker.type} typical max — premium justification needed`);

      if (mwScore >= 0.9) reasons.push(`Excellent MW fit: ${supplier.availableMW} MW vs ${seeker.neededMW} MW needed`);
      else if (mwScore >= 0.6) reasons.push(`Workable MW fit: ${supplier.availableMW} MW covers significant portion of ${seeker.neededMW} MW need`);

      if (supplier.type.includes("Hydro") && seeker.type === "AI Hyperscaler")
        reasons.push("Renewable hydro aligns with 24/7 CFE mandate (Google/Microsoft requirement)");
      if (supplier.type.includes("BTM") && seeker.type.includes("Miner"))
        reasons.push("BTM gas ideal: no interconnection queue, fast deployment, matches miner cost model");
      if (supplier.type.includes("Curtailment") && seeker.type.includes("Miner"))
        reasons.push("Curtailment zone pricing as low as 2-3¢ — ideal for flexible mining/AI training load");
      if (bonus > 0) reasons.push(`ESG alignment bonus: ${(bonus * 100).toFixed(0)} pts for renewable/BTM fuel match`);

      return {
        supplier,
        seeker,
        score,
        regionMatch,
        mwFit: mwScore >= 0.5,
        priceAlignment: supplier.estimatedAllInCents <= profile.maxCents,
        reasons,
        suggestedPriceCents,
        priceRationale,
      };
    })
    .filter((r) => r.score >= 15)
    .sort((a, b) => b.score - a.score);
}

export function matchSeekersToSupplier(supplier: Supplier, seekers: Seeker[]): MatchResult[] {
  return seekers
    .map((seeker) => {
      const regionMatch = regionOverlap(supplier.region, seeker.preferredRegions);
      const mwScore = mwFitScore(supplier.availableMW, seeker.neededMW);
      const pScore = dynamicPriceScore(supplier.estimatedAllInCents, seeker.type);
      const regionScore = regionMatch ? 1.0 : 0.12;
      const bonus = esgBonus(supplier.type, seeker.type);

      const score = Math.round(Math.min(100, (regionScore * 0.40 + mwScore * 0.30 + pScore * 0.30 + bonus) * 100));

      const { price: suggestedPriceCents, rationale: priceRationale } = suggestedPrice(supplier, seeker);
      const profile = getPricingProfile(seeker.type);

      const reasons: string[] = [];
      if (regionMatch) reasons.push(`Region match: ${seeker.name} targets ${supplier.region}`);
      if (supplier.estimatedAllInCents <= profile.targetCents)
        reasons.push(`Below ${seeker.type} target: ${supplier.estimatedAllInCents}¢ vs ${profile.targetCents}¢ target`);
      if (mwScore >= 0.9) reasons.push(`MW fit: ${supplier.availableMW} MW vs ${seeker.neededMW} MW needed`);

      return {
        supplier,
        seeker,
        score,
        regionMatch,
        mwFit: mwScore >= 0.5,
        priceAlignment: supplier.estimatedAllInCents <= profile.maxCents,
        reasons,
        suggestedPriceCents,
        priceRationale,
      };
    })
    .filter((r) => r.score >= 15)
    .sort((a, b) => b.score - a.score);
}

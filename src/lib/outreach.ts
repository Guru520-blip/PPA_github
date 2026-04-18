import { Supplier, Seeker, OutreachTemplate, BUYER_PRICING } from "./types";

const BROKER_NAME = "PowerMatch Advisors";
const BROKER_EMAIL = "deals@powermatch.io";

// ─── Urgency triggers ───────────────────────────────────────────────────────
function urgencyTrigger(supplier: Supplier): string {
  if (supplier.type.includes("BTM") && supplier.region.includes("Permian"))
    return "EPA flaring cap enforcement beginning Q3 2026 creates a narrow window before regulatory fines and potential well shut-ins";
  if (supplier.type.includes("BTM") && supplier.region.includes("Bakken"))
    return "NDIC flaring regulations with production shut-in threats make Q2 2026 a critical monetization window";
  if (supplier.type.includes("BTM") && supplier.region.includes("Appalachia"))
    return "EPA methane fee escalating quarterly — venting penalty exposure grows every month without a committed offtake partner";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Paraguay"))
    return "Paraguay's Law 6.207 data-center tariff window is active — first-mover advantage before competing allocations are committed";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Ethiopia"))
    return "GERD reservoir surplus peaks in 2026 — USD-denominated off-take agreements are being prioritized by EEP before domestic demand absorbs the capacity";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Iceland"))
    return "Aluminum smelter offtake contracts expiring 2027 — replacement industrial load must be contracted by Q4 2026 to maintain project economics";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Malaysia"))
    return "RECODA's SCORE corridor industrial allocation windows close Q3 2026 — anchor tenant slots for 2027 energization are being assigned now";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Bhutan"))
    return "Royal Government of Bhutan's 25-year PPA offer window is limited — carbon-negative ESG premium is only available to early committed counterparties";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Kenya"))
    return "KenGen's industrial PPA window opens Q2 2026 ahead of the Olkaria IV expansion — early movers get preferential USD tariff terms";
  if (supplier.type.includes("Curtailment"))
    return "Curtailment penalties and congestion pricing are at record levels — a committed industrial load eliminates negative pricing exposure immediately";
  if (supplier.type.includes("Substation"))
    return "Stranded substation carrying costs increase every quarter without an anchor tenant — each month without offtake erodes asset book value";
  return "Grid interconnection queues are running 36-60 months — existing permitted infrastructure is the only fast-track path available to buyers in 2026";
}

// ─── Pricing context by buyer tier ─────────────────────────────────────────
function pricingContext(seeker: Seeker, supplier: Supplier): string {
  const profile = BUYER_PRICING[seeker.type] ?? BUYER_PRICING["Hybrid Compute"];
  if (profile.tier === "hyperscaler")
    return `${supplier.estimatedAllInCents}¢/kWh all-in — competitive vs. the 4-8¢ range hyperscalers are currently paying for fast-deployment renewable capacity globally`;
  if (profile.tier === "miner")
    return `${supplier.estimatedAllInCents}¢/kWh all-in — within the 2.5-4¢ band required for post-halving AI co-location economics`;
  return `${supplier.estimatedAllInCents}¢/kWh all-in — aligned with HPC market comps of 3.5-5¢ seen in Applied Digital, TeraWulf, and CoreWeave deals`;
}

// ─── Revenue context for seekers ────────────────────────────────────────────
function seekerRevenueContext(seeker: Seeker, supplier: Supplier): string {
  const mw = Math.min(supplier.availableMW, seeker.neededMW);
  if (seeker.type === "AI Hyperscaler")
    return `${mw} MW of dedicated compute capacity, generating the equivalent of ${Math.round(mw * 8)}–${Math.round(mw * 12)} petaFLOP/s of training throughput`;
  if (seeker.type.includes("Miner"))
    return `${mw} MW powering AI GPU co-location at $${(mw * 2.5).toFixed(0)}–$${(mw * 4).toFixed(0)}M annual revenue — vs. $${(mw * 0.06).toFixed(0)}–$${(mw * 0.08).toFixed(0)}M from BTC mining at current prices`;
  return `${mw} MW of HPC capacity generating $${(mw * 2.5).toFixed(0)}–$${(mw * 3.5).toFixed(0)}M annually at market GPU co-location rates`;
}

// ─── Public ticker helper ────────────────────────────────────────────────────
function publicTicker(name: string): string {
  const map: Record<string, string> = {
    "CleanSpark": "NASDAQ: CLSK", "Microsoft": "NASDAQ: MSFT", "Google": "NASDAQ: GOOG",
    "Meta Platforms": "NASDAQ: META", "TeraWulf": "NASDAQ: WULF", "Applied Digital": "NASDAQ: APLD",
    "Core Scientific": "NASDAQ: CORZ", "IREN": "NASDAQ: IREN", "Amazon": "NASDAQ: AMZN",
    "Riot Platforms": "NASDAQ: RIOT", "Marathon Digital": "NASDAQ: MARA", "Bit Digital": "NASDAQ: BTBT",
    "Cipher Mining": "NASDAQ: CIFR", "CoreWeave": "NASDAQ: CRWV", "Equinix": "NASDAQ: EQIX",
    "Hut 8": "NASDAQ: HUT", "Stronghold Digital": "NASDAQ: SDIG", "Nebius": "NASDAQ: NBIS",
  };
  for (const [k, v] of Object.entries(map)) {
    if (name.includes(k)) return v;
  }
  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-PARTY: OUTREACH TO SUPPLIER (broker has a buyer pool)
// ─────────────────────────────────────────────────────────────────────────────
export function generateOutreachToSupplierMulti(
  supplier: Supplier,
  seekers: Seeker[],
  template: OutreachTemplate
): string {
  if (seekers.length === 0) return "No seekers selected. Add at least one to generate outreach.";

  const urgency = urgencyTrigger(supplier);
  const contactName = supplier.keyContact?.split("–")[0].split("—")[0].trim() ?? "Team";
  const totalDemandMW = seekers.reduce((sum, s) => sum + s.neededMW, 0);
  const primarySeeker = seekers[0];
  const pricing = pricingContext(primarySeeker, supplier);
  const mw = supplier.availableMW;

  const seekerBullets = seekers.map((s, i) => {
    const ticker = publicTicker(s.name);
    const pain = s.keyPain.split(";")[0].split(".")[0].slice(0, 80);
    return `${i + 1}. ${s.name}${ticker ? ` (${ticker})` : ""} — ${s.neededMW} MW | ${s.type} | ${pain}`;
  }).join("\n");

  if (template === "cold-email") {
    return `Subject: ${seekers.length} Qualified Buyers – ${mw} MW | ${supplier.region} | 90-Day Close

Hi ${contactName},

${urgency}.

We actively represent ${seekers.length} board-approved operators with a combined ${totalDemandMW} MW requirement. Your ${supplier.name} asset is a direct match for all of them:

${seekerBullets}

Your ${mw} MW can be placed with the first qualifying counterparty. We do not offer exclusivity to any single buyer until you select a preferred counterparty — giving you full leverage on price and terms.

What this delivers for you:
• Pricing: ${pricing}
• Term: 10-year take-or-pay PPA (or gas supply agreement for BTM assets)
• Capex: Buyers provide all generation equipment — zero new build on your side
• Timeline: NCND this week → LOI in 60 days → energization in 18 months
• Competitive dynamic: Multiple qualified buyers = you hold the cards on price and counterparty selection

Your current situation — ${supplier.keyPain.split(";")[0]} — is exactly what this buyer pool resolves.

Next step: We can send you a confidential one-pager on each of the ${seekers.length} buyers under a single NCND within 24 hours. No obligation until you've reviewed and selected a preferred counterparty.

Worth a 15-minute call this week?

Best,
${BROKER_NAME}
${BROKER_EMAIL}

---
DISCLAIMER: Guidance tool only. All data, contacts, pricing, and counterparty details must be independently verified. Engage licensed attorneys and engineers before any commitment. PowerMatch Advisors earns a success-based fee upon closing, disclosed in our MFPA.`;
  }

  if (template === "linkedin") {
    const topTwo = seekers.slice(0, 2).map(s => {
      const ticker = publicTicker(s.name);
      return `→ ${s.name}${ticker ? ` (${ticker})` : ""}: ${s.neededMW} MW | ${s.type}`;
    }).join("\n");
    return `Hi ${contactName},

I'm reaching out specifically about your ${supplier.region} position — ${urgency.split("—")[0].trim()}.

We currently represent ${seekers.length} board-approved buyers with a combined ${totalDemandMW} MW demand. Two examples:

${topTwo}
${seekers.length > 2 ? `→ + ${seekers.length - 2} more qualified operator${seekers.length - 2 > 1 ? "s" : ""}` : ""}

Your ${mw} MW matches all of them. We have NCND + deal summaries ready to send today — no exclusivity required until you've reviewed the counterparties.

Worth a 15-minute call to see which buyer fits best?

${BROKER_NAME} | ${BROKER_EMAIL}

[All data subject to independent verification.]`;
  }

  // call-script
  const topThree = seekers.slice(0, 3).map(s => `• ${s.name}: ${s.neededMW} MW, ${s.type}`).join("\n");
  return `CALL SCRIPT — Multi-Buyer Outreach to ${supplier.name}
Target: ${supplier.keyContact ?? "Business Development / CEO / CFO"}
Best contact: ${supplier.contactPhone}
Duration: 10–15 minutes

OPENING (30 sec):
"Hi ${contactName}, this is [Your Name] from ${BROKER_NAME}.
I'm calling about your ${supplier.region} operations — ${urgency.split("—")[0].trim()}.
We represent ${seekers.length} qualified buyers specifically looking for assets like yours.
Do you have 5 minutes?"

[If hesitant:] "I'll be brief — I just want to share who we're representing. If none of them fit, I'll let you go."

VALUE HOOK (60 sec):
"Our current buyer pool includes:
${topThree}
${seekers.length > 3 ? `...and ${seekers.length - 3} more — combined ${totalDemandMW} MW demand.` : `Combined ${totalDemandMW} MW demand.`}

Each is board-approved with committed capex. Your ${mw} MW can be placed with the first qualifying counterparty within 90 days.
We don't lock you into one buyer — you review all profiles and choose. That's your pricing leverage."

PAIN ACKNOWLEDGMENT (45 sec):
"I know your challenge: ${supplier.keyPain.split(";")[0]}.
This structure solves it — multiple buyers competing for your asset, you provide the site/gas stream, they bring all generation capex and sign long-term."

ASK (30 sec):
"Two asks:
1) Can I send you a one-page profile on each of our ${seekers.length} buyers under a single NCND today?
2) Who on your commercial/legal team should review it alongside you?"

OBJECTIONS:
Q: "We're not looking for power offtake right now"
A: "These buyers bring their own capex — it's not investment from you, it's revenue from them. Just worth reviewing the one-pager to see if the economics work."

Q: "We already have something in discussion"
A: "Understood. Having additional qualified counterparties gives you negotiating leverage on whatever you're currently exploring. No harm in knowing who else is interested."

Q: "What's your fee?"
A: "Success-based only — disclosed in our MFPA, paid per MW upon closing. Zero cost to your team until a deal closes."

CLOSE:
"I'll send the NCND and buyer profiles to [email] by [time today].
When would you have 30 minutes to discuss which counterparty fits best?"
[Write down: name, email, callback time]

---
DISCLAIMER: Script is a guidance tool. Verify all representations. Engage legal counsel before commitments.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-PARTY: OUTREACH TO SEEKER (broker has a power menu)
// ─────────────────────────────────────────────────────────────────────────────
export function generateOutreachToSeekerMulti(
  suppliers: Supplier[],
  seeker: Seeker,
  template: OutreachTemplate
): string {
  if (suppliers.length === 0) return "No suppliers selected. Add at least one to generate outreach.";

  const contactName = seeker.keyContact?.split("–")[0].split("—")[0].trim() ?? "Team";
  const profile = BUYER_PRICING[seeker.type] ?? BUYER_PRICING["Hybrid Compute"];
  const totalAvailMW = suppliers.reduce((sum, s) => sum + s.availableMW, 0);
  const primarySupplier = suppliers[0];
  const minPrice = Math.min(...suppliers.map(s => s.estimatedAllInCents));
  const maxPrice = Math.max(...suppliers.map(s => s.estimatedAllInCents));
  const priceRange = minPrice === maxPrice ? `${minPrice}¢` : `${minPrice}–${maxPrice}¢`;
  const revenue = seekerRevenueContext(seeker, primarySupplier);

  const supplierBullets = suppliers.map((s, i) => {
    const urgencyHook = s.keyPain.split(";")[0].split(".")[0].slice(0, 70);
    return `${i + 1}. ${s.name} — ${s.availableMW} MW | ${s.region} | ${s.estimatedAllInCents}¢/kWh | ${s.type}\n   Seller situation: ${urgencyHook}`;
  }).join("\n\n");

  if (template === "cold-email") {
    const subjectPrefix = profile.tier === "hyperscaler"
      ? `${suppliers.length} Off-Market Renewable Sites | ${priceRange}/kWh | Bypass Grid Queue`
      : profile.tier === "miner"
      ? `${suppliers.length} BTM Power Sites | ${priceRange}/kWh | ${suppliers.map(s => s.region).slice(0, 2).join(" / ")} | AI Co-lo Ready`
      : `Power Menu: ${suppliers.length} Sites | ${priceRange}/kWh | ${totalAvailMW} MW Total`;

    return `Subject: ${subjectPrefix}

Hi ${contactName},

Your team's constraint is clear: ${seeker.keyPain.split(";")[0]}.

We have exclusive brokerage access to ${suppliers.length} off-market power assets that collectively address this — each operational or near-operational, no grid queue:

${supplierBullets}

Why this matters for your timeline:
• Combined available capacity: ${totalAvailMW} MW across ${suppliers.length} sites — your ${seeker.neededMW} MW need is covered with redundancy
• Price range: ${priceRange}/kWh all-in — ${profile.tier === "hyperscaler" ? "competitive with Google/Microsoft's fast-track renewable deals globally" : profile.tier === "miner" ? "within post-halving AI co-location viability range" : "aligned with Applied Digital and TeraWulf market comps"}
• Each seller is motivated: urgency situations listed above give you pricing leverage and execution certainty
• Energization: 12–18 months across all sites — vs. 36–60 months via traditional interconnect

What this delivers for your operations: ${revenue}.

A single NCND covers all ${suppliers.length} sites. We can have confidential site teasers for every asset on your desk within 48 hours — 10 minutes to review, and you'll immediately see which fit your 2026 deployment roadmap.

Are you the right contact for power infrastructure decisions, or should I connect with your facilities/infrastructure lead?

${BROKER_NAME}
${BROKER_EMAIL}

---
DISCLAIMER: Guidance tool only. All pricing, capacity, and contacts must be independently verified. This is not a solicitation or binding offer. Engage licensed engineers and legal counsel before any commitment.`;
  }

  if (template === "linkedin") {
    const topTwo = suppliers.slice(0, 2).map(s =>
      `→ ${s.name}: ${s.availableMW} MW | ${s.region} | ${s.estimatedAllInCents}¢/kWh | ${s.type}`
    ).join("\n");
    return `Hi ${contactName},

${seeker.neededMW} MW requirement, ${seeker.keyPain.split(";")[0].toLowerCase()} — we may have a direct solution.

We have exclusive access to ${suppliers.length} off-market power sites (${priceRange}/kWh, ${totalAvailMW} MW total):

${topTwo}
${suppliers.length > 2 ? `→ + ${suppliers.length - 2} more site${suppliers.length - 2 > 1 ? "s" : ""}` : ""}

All are existing infrastructure — 12–18 month energization, no grid queue, motivated sellers. A single NCND covers all sites.

${profile.tier === "hyperscaler" ? "All renewable/low-carbon — aligns with your CFE mandate." : profile.tier === "miner" ? "BTM structures available: no grid exposure, flexible load scheduling — ideal for AI co-location margins." : "Modular deployment-ready across all sites — your GPU fleet is live before your competition finishes their grid application."}

Worth a 20-minute intro call to walk through the site menu?

${BROKER_NAME} | ${BROKER_EMAIL}

[All data subject to independent verification.]`;
  }

  // call-script
  const topThree = suppliers.slice(0, 3).map(s => `• ${s.name}: ${s.availableMW} MW | ${s.region} | ${s.estimatedAllInCents}¢/kWh`).join("\n");
  return `CALL SCRIPT — Multi-Site Outreach to ${seeker.name}
Target: ${seeker.keyContact ?? "VP Infrastructure / Head of Data Centers / CTO Office"}
Best contact: ${seeker.contactPhone}
Duration: 10–15 minutes

OPENING (30 sec):
"Hi ${contactName}, this is [Your Name] from ${BROKER_NAME}.
I'm calling because your ${seeker.neededMW} MW power need — specifically ${seeker.keyPain.split(";")[0].toLowerCase()} — is something we can address immediately with a menu of ${suppliers.length} off-market assets.
Do you have 5 minutes?"

VALUE HOOK (75 sec):
"We have brokerage access to ${suppliers.length} operational or near-operational power sites:

${topThree}
${suppliers.length > 3 ? `...and ${suppliers.length - 3} more. Total: ${totalAvailMW} MW available.` : `Total: ${totalAvailMW} MW across all sites.`}

Price range: ${priceRange}/kWh all-in — ${profile.tier === "miner" ? "within your post-halving AI co-location target" : "competitive with what hyperscalers are paying for fast-track renewable capacity"}.
All sites: 12–18 months to energization. No grid queue. Motivated sellers — urgency works in your favor on price."

PAIN ACKNOWLEDGMENT (45 sec):
"I understand your constraint: ${seeker.keyPain.split(";")[0]}.
Traditional utility paths are 3-5 years minimum. What I'm offering is a menu of existing permitted assets with motivated sellers — you pick the site that fits your engineering and commercial criteria."

ASK (30 sec):
"Can I send you a confidential two-page teaser for each of the ${suppliers.length} sites under a single NCND today?
One agreement, ${suppliers.length} options — takes 15 minutes to review."

OBJECTIONS:
Q: "We have an existing pipeline"
A: "These are off-market — almost certainly not in your pipeline. One NCND to access ${suppliers.length} sites is low friction. Worst case: you rule them out. Best case: one fills your 2026 deployment gap."

Q: "We need more than ${totalAvailMW} MW total"
A: "The ${suppliers.length} sites listed are the initial tranche. We have additional assets in diligence — let's discuss the full capacity roadmap on a call."

Q: "What's your fee?"
A: "Success-based, paid by the power provider when the deal closes. Zero cost to your team until a transaction closes."

CLOSE:
"I'll send the NCND and site teasers to [email] today.
When would you have 45 minutes to walk through the site menu with our commercial team?"
[Write down: name, email, callback date/time]

---
DISCLAIMER: Script is a guidance tool. Verify all representations. Engage legal counsel before commitments.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY 1:1 functions (kept for backward compatibility / single selection)
// ─────────────────────────────────────────────────────────────────────────────
export function generateOutreachToSupplier(
  supplier: Supplier,
  seeker: Seeker,
  template: OutreachTemplate
): string {
  return generateOutreachToSupplierMulti(supplier, [seeker], template);
}

export function generateOutreachToSeeker(
  supplier: Supplier,
  seeker: Seeker,
  template: OutreachTemplate
): string {
  return generateOutreachToSeekerMulti([supplier], seeker, template);
}

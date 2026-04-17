import { Supplier, Seeker, OutreachTemplate, BUYER_PRICING } from "./types";

const BROKER_NAME = "PowerMatch Advisors";
const BROKER_EMAIL = "deals@powermatch.io";

// --- Urgency triggers mapped to supplier type / region (dynamic, not hardcoded) ---
function urgencyTrigger(supplier: Supplier): string {
  if (supplier.type.includes("BTM") && supplier.region.includes("Permian"))
    return "EPA flaring cap enforcement beginning Q3 2026 creates a narrow window before regulatory fines and potential well shut-ins";
  if (supplier.type.includes("BTM") && supplier.region.includes("Bakken"))
    return "NDIC flaring regulations with production shut-in threats make Q2 2026 a critical monetization window";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Paraguay"))
    return "Paraguay's Law 6.207 data-center tariff window is active — first-mover advantage before competing allocations are committed";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Ethiopia"))
    return "GERD reservoir surplus peaks in 2026 — USD-denominated off-take agreements are being prioritized by EEP before domestic demand absorbs the capacity";
  if (supplier.type.includes("Hydro") && supplier.region.includes("Iceland"))
    return "Aluminum smelter offtake contracts expiring 2027 — replacement industrial load must be contracted by Q4 2026 to maintain project economics";
  if (supplier.type.includes("Curtailment"))
    return "Curtailment penalties and congestion pricing are at record levels — a committed industrial load eliminates negative pricing exposure immediately";
  if (supplier.type.includes("Substation"))
    return "Stranded substation carrying costs increase every quarter without an anchor tenant — each month without offtake erodes asset book value";
  return "Grid interconnection queues are running 36-60 months — existing permitted infrastructure is the only fast-track path available to buyers in 2026";
}

// Dynamic pricing context based on buyer tier
function pricingContext(seeker: Seeker, supplier: Supplier): string {
  const profile = BUYER_PRICING[seeker.type] ?? BUYER_PRICING["Hybrid Compute"];
  if (profile.tier === "hyperscaler")
    return `${supplier.estimatedAllInCents}¢/kWh all-in — competitive vs. the 4-8¢ range hyperscalers are currently paying for fast-deployment renewable capacity globally`;
  if (profile.tier === "miner")
    return `${supplier.estimatedAllInCents}¢/kWh all-in — within the 2.5-4¢ band required for post-halving AI co-location economics`;
  return `${supplier.estimatedAllInCents}¢/kWh all-in — aligned with HPC market comps of 3.5-5¢ seen in Applied Digital, TeraWulf, and CoreWeave deals`;
}

// What the seeker's AI/mining pivot means in revenue terms — makes it tangible
function seekerRevenueContext(seeker: Seeker, supplier: Supplier): string {
  const mw = Math.min(supplier.availableMW, seeker.neededMW);
  if (seeker.type === "AI Hyperscaler")
    return `${mw} MW of dedicated compute capacity, generating the equivalent of ${Math.round(mw * 8)}–${Math.round(mw * 12)} petaFLOP/s of training throughput for your AI workloads`;
  if (seeker.type.includes("Miner"))
    return `${mw} MW powering AI GPU co-location at $${(mw * 2.5).toFixed(0)}–$${(mw * 4).toFixed(0)}M annual revenue — versus $${(mw * 0.06).toFixed(0)}–$${(mw * 0.08).toFixed(0)}M from BTC mining at current prices`;
  return `${mw} MW of HPC capacity generating $${(mw * 2.5).toFixed(0)}–$${(mw * 3.5).toFixed(0)}M annually at market GPU co-location rates`;
}

// ─────────────────────────────────────────────
// OUTREACH TO SUPPLIER
// ─────────────────────────────────────────────
export function generateOutreachToSupplier(
  supplier: Supplier,
  seeker: Seeker,
  template: OutreachTemplate
): string {
  const urgency = urgencyTrigger(supplier);
  const pricing = pricingContext(seeker, supplier);
  const mw = Math.min(supplier.availableMW, seeker.neededMW);
  const contactName = supplier.keyContact?.split("–")[0].trim() ?? "Team";

  if (template === "cold-email") {
    return `Subject: ${mw} MW Offtake Ready – ${seeker.name} | ${supplier.region} | 90-Day Close

Hi ${contactName},

${urgency}.

We represent ${seeker.name} (${seeker.type}), a creditworthy operator with board-approved capex actively seeking ${seeker.neededMW} MW in ${seeker.preferredRegions.slice(0, 2).join(" / ")}. Your ${supplier.name} position is a direct match.

What we're bringing to your table:
• Committed offtaker: ${seeker.name} — ${seeker.notes.split(".")[0]}
• Pricing: ${pricing}
• Term: 10-year take-or-pay PPA (or gas supply agreement for BTM assets)
• Load profile: Flexible/interruptible with demand response — adds grid value and curtailment protection
• Timeline: Offtaker targets energization within 18 months of NCND — they have the capex, you provide the asset

Your current situation — ${supplier.keyPain.split(";")[0]} — is exactly what this structure resolves: stable long-term offtake revenue without heavy new capex on your side.

Next step: We can send a one-page deal summary and NCND within 24 hours. No obligation until you've reviewed the counterparty details.

Worth a 15-minute call this week?

Best,
${BROKER_NAME}
${BROKER_EMAIL}

---
DISCLAIMER: Guidance tool only. All data, contacts, pricing, and counterparty details must be independently verified. Engage licensed attorneys and engineers before any commitment. PowerMatch Advisors earns a success-based fee upon closing, disclosed in our MFPA.`;
  }

  if (template === "linkedin") {
    return `Hi ${contactName},

I'm reaching out specifically because of your position in ${supplier.region} — ${urgency.split("—")[0].trim()}.

We represent ${seeker.name}, a ${seeker.type} with board approval for ${seeker.neededMW} MW. Their requirement matches your asset almost exactly:
→ ${mw} MW | ${supplier.estimatedAllInCents}¢/kWh | 10-year take-or-pay | 18-month energization

Not a cold inquiry — we have the NCND and deal summary ready to send today.

Worth a quick 15 min to see if the economics work for your team?

${BROKER_NAME} | ${BROKER_EMAIL}

[Note: All data subject to independent verification.]`;
  }

  // call-script
  return `CALL SCRIPT — Outreach to ${supplier.name}
Target: ${supplier.keyContact ?? "Business Development / CEO / CFO"}
Best contact: ${supplier.contactPhone}
Duration: 10–15 minutes

OPENING (30 sec):
"Hi ${contactName}, this is [Your Name] from ${BROKER_NAME}.
I'm calling specifically about your ${supplier.region} operations — ${urgency.split("—")[0].trim()}.
Do you have 5 minutes?"

[If hesitant:] "I'll be brief — just want to see if a deal structure we have is relevant to you. If not, I'll let you go."

VALUE HOOK (45 sec):
"We represent ${seeker.name} — ${seeker.type}, board-approved capex, actively seeking ${seeker.neededMW} MW.

They want: ${mw} MW from an asset like yours, 10-year take-or-pay, ${pricing}.
They bring: All generation capex. You just provide the asset/gas stream.
Timeline: 18 months to first MW. NCND this week, LOI within 60 days."

PAIN ACKNOWLEDGMENT (45 sec):
"I understand your challenge: ${supplier.keyPain.split(";")[0]}.
This deal structure solves that directly — ${seeker.name} absorbs your surplus,
takes on generation capex, and signs long-term. Your revenue stabilizes without a new build."

ASK (30 sec):
"Two asks:
1) Can I send you a one-page deal summary under NCND today?
2) Who on your commercial/legal team should review it alongside you?"

OBJECTIONS:
Q: "We're not looking for power offtake right now"
A: "Understood. This isn't requiring any investment from you — it's a buyer taking your existing surplus/gas stream at better economics than your current alternative. Just worth reviewing the one-pager."

Q: "What's your fee?"
A: "Success-based only. We earn a disclosed fee per MW upon closing — paid by the transaction, not upfront from you. Zero cost to your team until a deal closes."

Q: "Send an email first"
A: "Absolutely. What's the best email for your VP Commercial or CEO? I'll have NCND + summary over within 2 hours."

CLOSE:
"I'll send the NCND and one-pager to [email] by [time today].
Assuming it passes your first look — when would you have 30 minutes for a deeper dive?"
[Write down: name, email, call-back time]

---
DISCLAIMER: Script is a guidance tool. Verify all representations. Engage legal counsel before commitments.`;
}

// ─────────────────────────────────────────────
// OUTREACH TO SEEKER
// ─────────────────────────────────────────────
export function generateOutreachToSeeker(
  supplier: Supplier,
  seeker: Seeker,
  template: OutreachTemplate
): string {
  const mw = Math.min(supplier.availableMW, seeker.neededMW);
  const pricing = pricingContext(seeker, supplier);
  const revenue = seekerRevenueContext(seeker, supplier);
  const contactName = seeker.keyContact?.split("–")[0].trim() ?? "Team";
  const profile = BUYER_PRICING[seeker.type] ?? BUYER_PRICING["Hybrid Compute"];

  if (template === "cold-email") {
    // Different angle by buyer type
    const subjectLine = profile.tier === "hyperscaler"
      ? `${supplier.availableMW} MW ${supplier.type} | ${supplier.region} | Bypasses Grid Queue | ${supplier.estimatedAllInCents}¢/kWh`
      : profile.tier === "miner"
      ? `${supplier.availableMW} MW @ ${supplier.estimatedAllInCents}¢ | ${supplier.region} | BTM Structure | AI Co-lo Ready`
      : `Off-Market: ${mw} MW ${supplier.type} | ${supplier.region} | ${supplier.estimatedAllInCents}¢ All-In`;

    return `Subject: ${subjectLine}

Hi ${contactName},

Your team's challenge is clear: ${seeker.keyPain.split(";")[0]}.

We have exclusive brokerage access to an off-market power opportunity that addresses this directly:

Asset: ${supplier.name}
Region: ${supplier.region}
Available: ${supplier.availableMW} MW (${supplier.type})
Pricing: ${pricing}
Deployment: Existing permitted infrastructure — energization in 12–18 months
Grid queue: None. BTM or direct interconnect to existing substation.

Why this is different from what you've already reviewed:
The asset is operational or near-operational — not a 3-year development project. The power provider is motivated: ${supplier.keyPain.split(";")[0]}. That urgency gives you pricing leverage and execution certainty.

What this delivers for your operations: ${revenue}.

We can provide a full confidential site teaser (non-circumventing) and execute NCND within 48 hours. The supplier is holding exclusivity discussions for the next 60 days.

Are you the right contact for power infrastructure partnerships, or should I connect with your facilities/infrastructure lead directly?

${BROKER_NAME}
${BROKER_EMAIL}

---
DISCLAIMER: Guidance tool only. All pricing, capacity, and contacts must be independently verified. This is not a solicitation or binding offer. Engage licensed engineers and legal counsel before any commitment.`;
  }

  if (template === "linkedin") {
    return `Hi ${contactName},

Your ${seeker.neededMW} MW requirement and ${seeker.keyPain.split(";")[0].toLowerCase()} — we may have a direct solution.

We have access to ${supplier.availableMW} MW in ${supplier.region}:
→ ${pricing}
→ ${supplier.type} — existing infrastructure, no grid queue
→ 12–18 month energization vs. 36–60 months via traditional interconnection

${profile.tier === "hyperscaler" ? "100% renewable hydro — aligns with your CFE mandate." : profile.tier === "miner" ? "BTM structure: no ERCOT exposure, flexible load capability — ideal for your AI co-location model." : "Modular deployment-ready: your team can be operational within 18 months."}

Not speculative — the supplier is actively seeking offtake and can move to NCND this week.

Worth a 20-minute intro call?

${BROKER_NAME} | ${BROKER_EMAIL}

[Data subject to independent verification.]`;
  }

  // call-script
  return `CALL SCRIPT — Outreach to ${seeker.name}
Target: ${seeker.keyContact ?? "VP Infrastructure / Head of Data Centers / CTO Office"}
Best contact: ${seeker.contactPhone}
Duration: 10–15 minutes

OPENING (30 sec):
"Hi ${contactName}, this is [Your Name] from ${BROKER_NAME}.
I'm reaching out because your team's power infrastructure expansion — specifically ${seeker.keyPain.split(";")[0].toLowerCase()} — is something we can help solve with an off-market asset.
Do you have 5 minutes?"

VALUE HOOK (60 sec):
"We have brokerage access to ${supplier.availableMW} MW of ${supplier.type} in ${supplier.region}.

The numbers: ${pricing}.
The advantage: Existing infrastructure, no 36-month grid queue. Energization in 12–18 months.
The seller situation: ${supplier.keyPain.split(";")[0]} — which gives you pricing leverage and execution certainty.

For your operations: ${revenue}."

PAIN ACKNOWLEDGMENT (45 sec):
"I know the constraint you're navigating: ${seeker.keyPain.split(";")[0]}.
Traditional utility paths are 3-5 years minimum. This is different — existing permitted asset, motivated seller, structured deal.
${profile.tier === "hyperscaler" ? "And it's renewable — aligns with your 24/7 CFE reporting requirements." : profile.tier === "miner" ? "BTM structure means no ERCOT spot exposure — your AI co-location margins stay protected." : "Modular deployment means your GPU fleet is live before your competition finishes their grid application."}"

ASK (30 sec):
"Can I send you a two-page confidential site teaser today?
It's non-circumventing, takes 10 minutes to review, and will tell you immediately whether this fits your criteria."

OBJECTIONS:
Q: "We have a process / existing pipeline"
A: "Understood — this would go through your normal diligence. I want to get the teaser in your pipeline so your team can evaluate. Worst case, you have one more option. Best case, it fills a gap in your 2026 deployment roadmap."

Q: "We need more than ${supplier.availableMW} MW"
A: "The site is expandable — let's discuss the full capacity roadmap on a call. The initial block is ${supplier.availableMW} MW but the operator has adjacent capacity under discussion."

Q: "What's your fee?"
A: "Success-based, paid by the power provider when the deal closes. Zero cost to your team — you get best-efforts brokerage access at no charge."

Q: "Send an email first"
A: "Absolutely. Who on your legal team handles NDAs? I'll send the NCND and site teaser within 2 hours."

CLOSE:
"I'll send the NCND and teaser to [email] today.
If your team sees fit — when would you have 45 minutes to discuss terms with our commercial team and the seller?"
[Write down: name, email, call-back commitment with date/time]

---
DISCLAIMER: Script is a guidance tool. Verify all representations. Engage legal counsel before commitments.`;
}

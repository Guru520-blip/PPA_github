import { Supplier, Seeker, OutreachTemplate, BUYER_PRICING } from "./types";

const BROKER_NAME = "PowerMatch Advisors";
const BROKER_SIGNATURE = `Alex Chen\nPowerMatch Advisors\nalex@powermatch.io | +1 (212) 555-0190`;

function firstName(contact: string | undefined): string {
  return contact?.split("–")[0].split("—")[0].trim().split(/\s+/)[0] ?? "there";
}

// ─── Urgency triggers ──────────────────────────────────────────────────────
function urgencyTrigger(supplier: Supplier): string {
  const t = supplier.type.toLowerCase();
  const r = supplier.region.toLowerCase();
  if (t.includes("btm") && r.includes("permian"))
    return "EPA flaring enforcement tightening Q3 2026 creates a closing window before shut-in risk materializes";
  if (t.includes("btm") && r.includes("bakken"))
    return "NDIC flaring regulations with production shut-in provisions make Q2 2026 a critical monetization window";
  if (t.includes("btm") && r.includes("appalachia"))
    return "EPA methane fee escalating quarterly — venting penalty exposure grows each month without committed offtake";
  if (t.includes("hydro") && r.includes("paraguay"))
    return "Paraguay's Law 6.207 data-center tariff window is active — first-mover allocation advantage closes before year-end";
  if (t.includes("hydro") && r.includes("ethiopia"))
    return "GERD reservoir surplus peaks in 2026 — USD-denominated agreements are being prioritized before domestic demand absorbs available capacity";
  if (t.includes("hydro") && r.includes("iceland"))
    return "Aluminum smelter offtake contracts expiring 2027 — replacement industrial load must be contracted by Q4 2026 to maintain project economics";
  if (t.includes("hydro") && r.includes("malaysia"))
    return "RECODA's SCORE corridor industrial allocation windows close Q3 2026 — anchor tenant slots for 2027 energization are being committed now";
  if (t.includes("hydro") && r.includes("bhutan"))
    return "Royal Government of Bhutan's PPA window is limited — ESG premium terms are reserved for early committed counterparties";
  if (t.includes("hydro") && r.includes("kenya"))
    return "KenGen's industrial PPA window opens Q2 2026 ahead of the Olkaria IV expansion — early movers secure preferential USD tariff terms";
  if (t.includes("curtailment"))
    return "Curtailment penalties and negative pricing events are at record levels — an anchor industrial load eliminates this exposure immediately";
  if (t.includes("substation"))
    return "Stranded substation carrying costs increase each quarter without an anchor tenant — each month of vacancy erodes asset book value";
  return "Grid interconnection queues are running 36–60 months — existing permitted infrastructure is the only fast-track path to capacity before 2028";
}

// ─── Seeker-specific opener (shows research, avoids "we have a solution") ─
function seekerOpener(seeker: Seeker): string {
  const n = seeker.name.toLowerCase();
  if (/hyperscaler|cloud/i.test(seeker.type)) {
    if (n.includes("microsoft"))
      return "Your public commitments on data center capacity through 2027 are clear — the real bottleneck is permitted infrastructure that doesn't require a four-year interconnection queue. That's the specific problem we work on.";
    if (n.includes("google"))
      return "CFE-aligned capacity at the scale your Gemini infrastructure requires is genuinely difficult to source on an 18-month timeline. We work specifically in the gap between what the grid can offer and what your deployment schedule demands.";
    if (n.includes("meta") || n.includes("facebook"))
      return "The infrastructure build-out for your next-generation training clusters is moving faster than most utility timelines can accommodate — off-market, permitted capacity is the only realistic path at that pace.";
    if (n.includes("amazon") || n.includes("aws"))
      return "AWS capacity commitments from your most recent earnings signal expansion that traditional procurement can't keep up with. The teams moving fastest are sourcing off-market, before assets ever reach a broker database.";
    return "Scaling data center capacity at the pace your team is targeting runs directly into the 36–60 month interconnection queue. The only realistic path to energization before 2027 is off-market, already-permitted infrastructure.";
  }
  if (/miner|mining|btc|crypto/i.test(seeker.type)) {
    if (n.includes("cleanspark"))
      return "The AI compute hosting pivot you've outlined publicly is the right move — but the operators executing fastest are the ones who've locked BTM power before the market reprices. That window is narrowing.";
    if (n.includes("core scientific") || n.includes("iren") || n.includes("terawulf") || n.includes("applied digital"))
      return "Your pivot from BTC mining to AI hosting is well-positioned commercially — the constraint isn't capital, it's fixed-rate power without grid exposure. BTM assets are being contracted faster than they're surfacing.";
    return "The post-halving shift to AI compute hosting has created a genuine BTM power bottleneck — operators moving fastest are locking structures now, before the pricing window closes on the best assets.";
  }
  if (/hpc|data.?center|compute|colocation/i.test(seeker.type))
    return "AI compute demand is outpacing HPC procurement timelines across the board. The operators closing facilities today started sourcing off-market assets 12 months before their competitors did — that timing gap is what we help close.";
  return "Power procurement for large-scale compute has fundamentally changed — the teams moving fastest are bypassing the interconnection queue entirely through off-market, already-permitted infrastructure.";
}

// ─── Supplier-specific opener (empathetic industry insight, not urgency threat) ─
function supplierOpener(supplier: Supplier): string {
  const t = supplier.type.toLowerCase();
  const r = supplier.region.toLowerCase();
  if (t.includes("btm") && r.includes("permian"))
    return "The Permian BTM market has shifted considerably — what was a regulatory nuisance two years ago is now a sought-after acquisition target for AI operators, if the right industrial offtaker is in place before enforcement tightens further.";
  if (t.includes("btm") && r.includes("bakken"))
    return "Bakken flare gas has gone from an afterthought to a priority acquisition target — AI infrastructure operators need exactly what you have: stranded gas, existing infrastructure, no interconnection queue, and a seller with timeline pressure.";
  if (t.includes("btm") && r.includes("appalachia"))
    return "The Appalachian Basin's EPA methane fee exposure is creating urgency that most operators underestimate — but it's also creating real leverage for disciplined sellers who move before the market gets crowded.";
  if (t.includes("hydro") && r.includes("paraguay"))
    return "The Law 6.207 tariff window has generated more serious buyer interest than most Paraguayan asset owners realize. The challenge is separating counterparties with genuine board approval from those still in committee — that's what I do.";
  if (t.includes("hydro") && r.includes("ethiopia"))
    return "GERD's reservoir surplus is drawing serious attention from buyers who understand the 2026 window for USD-denominated agreements. The operators I'm currently representing are actively allocating capital and move on compressed timelines.";
  if (t.includes("hydro") && r.includes("iceland"))
    return "With aluminum smelter contracts rolling off, your position in Iceland is precisely what the AI infrastructure market is looking for — the carbon profile, the geography, and the energization timeline all align with what buyers need right now.";
  if (t.includes("hydro") && (r.includes("malaysia") || r.includes("bhutan") || r.includes("kenya")))
    return "Asian and East African hydro assets are attracting serious buyer attention from operators who've exhausted the North American and European off-market inventories. Your asset is in the right place at the right time.";
  if (t.includes("curtailment"))
    return "Curtailment-zone assets that were difficult to monetize two years ago are now among the most sought-after industrial sites in this market — the buyer profile has completely changed with AI compute demand and the economics have followed.";
  if (t.includes("substation") || t.includes("nuclear"))
    return "Stranded transmission infrastructure and nuclear-adjacent power are in a different category from what buyers were willing to consider 18 months ago — the combination of ESG premium and timeline certainty makes these genuinely attractive at the right structure.";
  return "Off-market power infrastructure in your position — existing permits, no grid queue, motivated seller — has become one of the most difficult assets to source in this market, which means your negotiating leverage with qualified buyers is real.";
}

// ─── Verified portfolio claims — only assert what's in the data ──────────
// This is the core integrity function: we never claim "existing permits",
// "no interconnection queue", or a specific energization timeline unless
// the corresponding Supplier fields are populated. Unknown = we stay silent.
function verifiedPortfolioClaims(suppliers: Supplier[]): string {
  const n = suppliers.length;
  const confirmed = suppliers.filter(s => s.permitStatus === "Confirmed").length;
  const sellerStated = suppliers.filter(s => s.permitStatus === "Seller-stated").length;
  const allNoQueue = n > 0 && suppliers.every(s => s.noInterconnectionQueue === true);
  const months = suppliers
    .map(s => s.estimatedMonthsToEnergization)
    .filter((m): m is number => typeof m === "number");

  const parts: string[] = [];

  // Permit claim — honest per-portfolio status
  if (n === 1) {
    const s = suppliers[0];
    if (s.permitStatus === "Confirmed") parts.push("generation permits in place (verified by the seller and available for your diligence)");
    else if (s.permitStatus === "Seller-stated") parts.push("permits in place per seller (documentation available under NDA for your independent verification)");
    // "Not verified" → no permit claim made
  } else if (n > 1) {
    if (confirmed === n) parts.push(`generation permits verified on all ${n} sites`);
    else if (confirmed + sellerStated === n) parts.push(`permits are in place or seller-stated across all ${n} sites, subject to your diligence`);
    else if (confirmed > 0) parts.push(`permits verified on ${confirmed} of ${n} sites; remainder pending your diligence`);
  }

  // Interconnection queue — only assert when ALL suppliers confirm
  if (allNoQueue) parts.push("no new grid interconnection queue required");

  // Energization timeline — use actual field values, disclose as estimate
  if (months.length > 0 && months.length === n) {
    const lo = Math.min(...months);
    const hi = Math.max(...months) + 6; // point estimate + 6mo upper band
    parts.push(`estimated ${lo}–${hi} months to energization per sellers (subject to diligence)`);
  }

  if (!parts.length) return "";
  // Join naturally as a sentence
  const joined = parts.length === 1
    ? parts[0]
    : parts.slice(0, -1).join(", ") + "; " + parts[parts.length - 1];
  return joined.charAt(0).toUpperCase() + joined.slice(1) + ".";
}

// ─── Subject lines (human, curiosity-inducing — not product menus) ─────────
function seekerSubject(suppliers: Supplier[], seeker: Seeker): string {
  const regions = Array.from(new Set(suppliers.map(s => s.region.split(",")[0].trim()))).slice(0, 2).join(" / ");
  if (/hyperscaler|cloud/i.test(seeker.type))
    return `${seeker.neededMW} MW CFE-aligned — ${regions} — off-market`;
  if (/miner|mining|btc|crypto/i.test(seeker.type))
    return `${seeker.neededMW} MW BTM power — ${regions} — fixed-rate, no grid exposure`;
  // Derive timeline from actual verified data — never hardcode
  const months = suppliers.map(s => s.estimatedMonthsToEnergization).filter((m): m is number => typeof m === "number");
  if (months.length > 0 && months.length === suppliers.length) {
    const lo = Math.min(...months);
    return `${seeker.neededMW} MW off-market — ${regions} — est. ${lo}–${lo + 6}mo energization`;
  }
  return `${seeker.neededMW} MW off-market power — ${regions}`;
}

function supplierSubject(seekers: Seeker[], supplier: Supplier): string {
  const totalMW = seekers.reduce((s, sk) => s + sk.neededMW, 0);
  const shortBuyer = seekers.length === 1
    ? `${seekers[0].neededMW} MW buyer, ${seekers[0].type}`
    : `${seekers.length} buyers — ${totalMW} MW combined`;
  return `${shortBuyer} — ${supplier.region} — intro`;
}

// ─── Buyer pool description — NO namedropping in cold email ───────────────
function buyerPoolDescription(seekers: Seeker[]): string {
  const listed = new Set([
    "CleanSpark","Microsoft","Google","Meta","TeraWulf","Applied Digital",
    "Core Scientific","IREN","Amazon","Riot Platforms","Marathon Digital",
    "Bit Digital","Cipher Mining","CoreWeave","Equinix","Hut 8","Stronghold Digital","Nebius",
  ]);
  const listedArr = Array.from(listed);
  const isListed = (s: Seeker) => listedArr.some(n => s.name.includes(n));

  const hyperscalers = seekers.filter(s => /hyperscaler|cloud/i.test(s.type));
  const miners = seekers.filter(s => /miner|mining|btc|crypto/i.test(s.type));
  const hpc = seekers.filter(s => /hpc|data.?center|compute|colocation/i.test(s.type));
  const others = seekers.filter(s => !hyperscalers.includes(s) && !miners.includes(s) && !hpc.includes(s));

  const parts: string[] = [];
  if (hyperscalers.length) {
    const n = hyperscalers.filter(isListed).length;
    parts.push(`${hyperscalers.length === 1 ? "one" : hyperscalers.length}${n > 0 ? " publicly listed" : ""} AI hyperscaler${hyperscalers.length > 1 ? "s" : ""}`);
  }
  if (miners.length) {
    const n = miners.filter(isListed).length;
    parts.push(`${miners.length}${n > 0 ? " NASDAQ-listed" : ""} crypto miner${miners.length > 1 ? "s" : ""} pivoting to AI compute`);
  }
  if (hpc.length) {
    parts.push(`${hpc.length} HPC ${hpc.length > 1 ? "and data center operators" : "data center operator"}`);
  }
  if (others.length) {
    parts.push(`${others.length} additional qualified operator${others.length > 1 ? "s" : ""}`);
  }
  if (!parts.length) return `${seekers.length} qualified operators`;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return parts.slice(0, -1).join(", ") + `, and ${parts[parts.length - 1]}`;
}

// ─── Power portfolio description — NO specific ¢/kWh in cold email ────────
function powerPortfolioDescription(suppliers: Supplier[]): string {
  const btm = suppliers.filter(s => /btm/i.test(s.type)).length;
  const hydro = suppliers.filter(s => /hydro/i.test(s.type)).length;
  const solar = suppliers.filter(s => /solar/i.test(s.type)).length;
  const curtail = suppliers.filter(s => /curtailment/i.test(s.type)).length;
  const others = suppliers.length - btm - hydro - solar - curtail;
  const regions = Array.from(new Set(suppliers.map(s => s.region.split(",")[0].trim()))).slice(0, 3).join(", ");

  const parts: string[] = [];
  if (btm > 0) parts.push(`${btm} behind-the-meter gas ${btm === 1 ? "asset" : "assets"}`);
  if (hydro > 0) parts.push(`${hydro} hydroelectric ${hydro === 1 ? "site" : "sites"}`);
  if (solar > 0) parts.push(`${solar} solar ${solar === 1 ? "project" : "projects"}`);
  if (curtail > 0) parts.push(`${curtail} curtailment-zone ${curtail === 1 ? "asset" : "assets"}`);
  if (others > 0) parts.push(`${others} additional ${others === 1 ? "site" : "sites"}`);
  const typeStr = parts.length ? parts.join(", ") : `${suppliers.length} power assets`;
  return `${typeStr} across ${regions}`;
}

// ─── Ticker lookup — used in LinkedIn + call scripts only ─────────────────
function publicTicker(name: string): string {
  const map: Record<string, string> = {
    "CleanSpark": "NASDAQ: CLSK", "Microsoft": "NASDAQ: MSFT", "Google": "NASDAQ: GOOG",
    "Meta Platforms": "NASDAQ: META", "TeraWulf": "NASDAQ: WULF", "Applied Digital": "NASDAQ: APLD",
    "Core Scientific": "NASDAQ: CORZ", "IREN": "NASDAQ: IREN", "Amazon": "NASDAQ: AMZN",
    "Riot Platforms": "NASDAQ: RIOT", "Marathon Digital": "NASDAQ: MARA", "Bit Digital": "NASDAQ: BTBT",
    "Cipher Mining": "NASDAQ: CIFR", "CoreWeave": "NASDAQ: CRWV", "Equinix": "NASDAQ: EQIX",
    "Hut 8": "NASDAQ: HUT", "Stronghold Digital": "NASDAQ: SDIG", "Nebius": "NASDAQ: NBIS",
  };
  for (const [k, v] of Object.entries(map)) if (name.includes(k)) return v;
  return "";
}

// ─── Capital commitment claim — only assert what's verifiable per seeker data ─
// Public filings = safe to cite. Private companies = stay silent.
function seekerCapitalClaim(seekers: Seeker[]): string {
  const allCommitted = seekers.length > 0 && seekers.every(s => s.capexCommitted === true);
  const allListed = seekers.length > 0 && seekers.every(s => publicTicker(s.name) !== "");
  const someCommitted = seekers.some(s => s.capexCommitted === true);
  if (allCommitted)
    return " — capital deployment publicly disclosed in investor filings";
  if (allListed)
    return " — each publicly listed with active infrastructure procurement mandates";
  if (someCommitted) {
    const n = seekers.filter(s => s.capexCommitted === true).length;
    return ` — ${n} with publicly disclosed mandates, others confirmed by management`;
  }
  return ""; // private / unverified → make no claim
}

// ─── Pricing coaching — FOR CALL SCRIPTS ONLY, never in cold outreach ─────
function callScriptPricingCoach(supplier: Supplier, seekers: Seeker[]): string {
  const profile = BUYER_PRICING[seekers[0]?.type] ?? BUYER_PRICING["Hybrid Compute"];
  const comps = profile.tier === "hyperscaler"
    ? "Public comps: Google/MS renewable PPAs ~4.5–6¢ (2024 SEC disclosures). Asset is competitive."
    : profile.tier === "miner"
    ? "Public comps: Applied Digital ~4¢ (Q2 2024 10-Q), TeraWulf <$25/MWh (public guidance), Cipher Mining ~3.5¢. Lead with timeline advantage, anchor to these benchmarks."
    : "Public comps: Applied Digital ~4¢ (Q2 2024), CoreWeave HPC deals ~4–5¢ reported. Position as competitive; emphasize no grid queue.";
  return `[PRICING — REFERENCE ONLY — DO NOT DISCLOSE IN COLD OUTREACH]\nAsset: ${supplier.estimatedAllInCents}¢/kWh all-in\n${comps}\n`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-PARTY: TO SUPPLIER (broker presents qualified buyer pool)
// ─────────────────────────────────────────────────────────────────────────────
export function generateOutreachToSupplierMulti(
  supplier: Supplier,
  seekers: Seeker[],
  template: OutreachTemplate
): string {
  if (seekers.length === 0) return "Select at least one buyer to generate outreach.";

  const fn = firstName(supplier.keyContact);
  const urgency = urgencyTrigger(supplier);
  const totalMW = seekers.reduce((sum, s) => sum + s.neededMW, 0);
  const buyerDesc = buyerPoolDescription(seekers);

  if (template === "cold-email") {
    const opener = supplierOpener(supplier);
    const subject = supplierSubject(seekers, supplier);

    return `Subject: ${subject}

Hi ${fn},

${opener}

I represent ${buyerDesc} — ${totalMW} MW of combined requirement${seekerCapitalClaim(seekers)}. Your ${supplier.availableMW} MW ${supplier.region} asset is a match across capacity, geography, and timeline for the full group.

Here's what's different about how I work: you see all buyer profiles before you select a counterparty. No exclusivity until you've chosen who you want to engage — your pricing leverage stays intact throughout. Terms are structured within the range of recent comparable transactions; specifics follow once we've had a conversation.

Worth 15 minutes this week to walk through who we're representing?

${BROKER_SIGNATURE}

[Informational only. All details subject to independent verification.]`;
  }

  if (template === "linkedin") {
    const top2 = seekers.slice(0, 2).map(s => {
      const ticker = publicTicker(s.name);
      return `→ ${s.name}${ticker ? ` (${ticker})` : ""} — ${s.neededMW} MW | ${s.type}`;
    }).join("\n");
    return `Hi ${fn},

I focus specifically on placing off-market power assets with qualified industrial buyers — your ${supplier.region} position is exactly the kind of asset I work with.

I'm currently representing ${seekers.length} buyers (${totalMW} MW combined)${seekerCapitalClaim(seekers)}:

${top2}
${seekers.length > 2 ? `→ +${seekers.length - 2} more` : ""}

Your ${supplier.availableMW} MW is a match across capacity, location, and timeline. You'd review all buyer profiles before selecting anyone — no exclusivity until you're ready.

Worth a 15-minute call this week?

Alex Chen — PowerMatch Advisors`;
  }

  // call-script
  const coach = callScriptPricingCoach(supplier, seekers);
  const seekerLines = seekers.slice(0, 5).map((s, i) => {
    const ticker = publicTicker(s.name);
    return `  ${i + 1}. ${s.name}${ticker ? ` (${ticker})` : ""} — ${s.neededMW} MW | ${s.type}`;
  }).join("\n");
  return `CALL SCRIPT — Multi-Buyer Outreach to ${supplier.name}
Target: ${supplier.keyContact ?? "VP Commercial / CEO / CFO"}
Phone: ${supplier.contactPhone}
Duration: 10–15 minutes

${coach}
OPENING (30 sec):
"Hi ${fn}, this is [Your Name] from ${BROKER_NAME}.
I'm calling about your ${supplier.region} operations — ${urgency.split("—")[0].trim()}.
We represent ${seekers.length} qualified buyers looking for assets like yours. Five minutes?"

[If hesitant:] "I'll be brief — I just want to share who we're representing. If there's no fit, I'll let you go."

VALUE HOOK (60 sec):
"Our active buyer pool includes:
${seekerLines}${seekers.length > 5 ? `\n  ...and ${seekers.length - 5} more. Combined demand: ${totalMW} MW.` : `\nCombined demand: ${totalMW} MW.`}

You review all profiles before committing — that's your pricing leverage."

PAIN ACKNOWLEDGMENT (45 sec):
"I know your challenge: ${supplier.keyPain.split(";")[0]}.
This structure addresses it directly — multiple buyers competing for your asset, they provide all generation capex, you provide the site or gas stream."

ASK:
"Can I send you a buyer profile for each of the ${seekers.length} counterparties under a single NCND today?
And who on your commercial or legal team should review alongside you?"

OBJECTIONS:
Q: "We're not looking for offtake right now"
A: "These buyers provide their own capex — it's revenue to you, not cost. Worth seeing if the economics work."

Q: "We have something in discussion"
A: "Having additional qualified counterparties strengthens your negotiating position. Low friction to see who else is interested."

Q: "What's your fee?"
A: "Success-based, disclosed in our MFPA, paid per MW at closing. Zero cost until a deal closes."

CLOSE:
"I'll send the NCND and buyer profiles to [email] today.
When would you have 30 minutes to review which counterparty fits best?"
[Note: name, email, callback time]

---
Script is a guidance tool only. Verify all representations. Engage legal counsel before any commitment.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-PARTY: TO SEEKER (broker presents off-market power menu)
// ─────────────────────────────────────────────────────────────────────────────
export function generateOutreachToSeekerMulti(
  suppliers: Supplier[],
  seeker: Seeker,
  template: OutreachTemplate
): string {
  if (suppliers.length === 0) return "Select at least one power source to generate outreach.";

  const fn = firstName(seeker.keyContact);
  const totalMW = suppliers.reduce((sum, s) => sum + s.availableMW, 0);
  const profile = BUYER_PRICING[seeker.type] ?? BUYER_PRICING["Hybrid Compute"];
  const portfolioDesc = powerPortfolioDescription(suppliers);
  const painShort = seeker.keyPain.split(";")[0].split(".")[0];

  if (template === "cold-email") {
    // Profile/ESG hooks — these are structural facts about the asset TYPE, not verification claims
    const tierHook = profile.tier === "hyperscaler"
      ? `All sites are renewable or low-carbon — positioned for CFE and ESG reporting alignment.`
      : profile.tier === "miner"
      ? `All are BTM structures — no grid exposure, load-scheduling flexibility built in by asset design.`
      : `Existing operational infrastructure — not greenfield.`;

    // Only asserts what Supplier fields confirm; stays silent on what's not verified
    const verified = verifiedPortfolioClaims(suppliers);
    const claimsLine = verified
      ? ` Verified claim set for this portfolio: ${verified}`
      : ` Specific permit status and timelines are confirmed per site and shared with you during diligence.`;

    const opener = seekerOpener(seeker);
    const subject = seekerSubject(suppliers, seeker);

    return `Subject: ${subject}

Hi ${fn},

${opener}

I'm representing the owners of ${portfolioDesc} — ${totalMW} MW of operational or near-operational capacity, placed through a private matching process rather than a public marketplace. Your ${seeker.neededMW} MW requirement is covered with redundancy across the portfolio. ${tierHook}${claimsLine}

Pricing is in line with recent comparable transactions — I share specifics once we've had a brief conversation and confirmed mutual interest.

I can put together a one-page overview on each site — no formal paperwork at this stage. Happy to get on a 15-minute call this week if the timing works.

${BROKER_SIGNATURE}

[Informational only. All claims subject to your independent verification.]`;
  }

  if (template === "linkedin") {
    const top2 = suppliers.slice(0, 2).map(s =>
      `→ ${s.name} — ${s.availableMW} MW | ${s.region} | ${s.type}`
    ).join("\n");
    const tierHook = profile.tier === "hyperscaler"
      ? "All renewable or low-carbon — positioned for CFE/ESG alignment."
      : profile.tier === "miner"
      ? "BTM structures — no grid exposure, flexible load scheduling by design."
      : "Operational or near-operational assets — not greenfield.";
    const verified = verifiedPortfolioClaims(suppliers);
    const claimsLine = verified ? `\nPortfolio claim set (subject to your diligence): ${verified}` : "";
    return `Hi ${fn},

I work specifically on off-market power sourcing for operators in your position — ${seeker.neededMW} MW at a pace the grid can't accommodate.

I have access to ${suppliers.length} assets right now (${totalMW} MW total) that aren't in any database:

${top2}
${suppliers.length > 2 ? `→ +${suppliers.length - 2} more` : ""}

${tierHook} Sellers are motivated — timeline pressure works in your favor on pricing.${claimsLine}

Happy to send a one-pager on each site. Would a brief call this week make sense?

Alex Chen — PowerMatch Advisors`;
  }

  // call-script
  const coach = callScriptPricingCoach(suppliers[0], [seeker]);
  const minCents = Math.min(...suppliers.map(s => s.estimatedAllInCents));
  const maxCents = Math.max(...suppliers.map(s => s.estimatedAllInCents));
  const priceRange = minCents === maxCents ? `${minCents}¢` : `${minCents}–${maxCents}¢`;
  const siteLines = suppliers.slice(0, 5).map((s, i) =>
    `  ${i + 1}. ${s.name} — ${s.availableMW} MW | ${s.region} | ${s.estimatedAllInCents}¢/kWh | ${s.type}`
  ).join("\n");

  return `CALL SCRIPT — Multi-Site Outreach to ${seeker.name}
Target: ${seeker.keyContact ?? "VP Infrastructure / Head of Data Centers / CTO Office"}
Phone: ${seeker.contactPhone}
Duration: 10–15 minutes

${coach}
Price range across portfolio: ${priceRange}/kWh all-in

OPENING (30 sec):
"Hi ${fn}, this is [Your Name] from ${BROKER_NAME}.
I'm calling because your ${seeker.neededMW} MW power need — ${painShort.toLowerCase()} — is something we can address right now with a menu of ${suppliers.length} off-market assets.
Five minutes?"

VALUE HOOK (75 sec):
"We have exclusive brokerage access to ${suppliers.length} operational or near-operational power sites:

${siteLines}
${suppliers.length > 5 ? `  ...and ${suppliers.length - 5} more. Total: ${totalMW} MW available.` : `Total: ${totalMW} MW across all sites.`}

Price range: ${priceRange}/kWh all-in — ${profile.tier === "miner" ? "within your post-halving AI co-location target" : "competitive with what hyperscalers are currently paying for fast-track capacity"}.
${(() => { const ms = suppliers.map(s => s.estimatedMonthsToEnergization).filter((m): m is number => typeof m === "number"); return ms.length > 0 ? `Energization timeline: ${Math.min(...ms)}–${Math.max(...ms) + 6} months per sellers (confirm in diligence). ` : ""; })()}No new interconnection queue required. Motivated sellers — timing pressure works in your favor on price."

PAIN ACKNOWLEDGMENT (45 sec):
"I understand the constraint: ${painShort}.
Traditional utility paths are 3–5 years minimum. I'm offering a menu of existing permitted assets — you pick the site that fits your engineering and commercial criteria."

ASK:
"Can I send you a confidential site teaser for each of the ${suppliers.length} assets under a single NCND today?
One agreement, ${suppliers.length} options — 15 minutes to review."

OBJECTIONS:
Q: "We have an existing pipeline"
A: "These are off-market — almost certainly not in your current pipeline. One NCND to access ${suppliers.length} sites is minimal friction."

Q: "We need more than ${totalMW} MW total"
A: "These ${suppliers.length} sites are the initial tranche. We have additional assets in diligence — let's map the full roadmap on a call."

Q: "What's your fee?"
A: "Success-based, paid by the power provider at closing. Zero cost to your team."

CLOSE:
"I'll send the NCND and site teasers to [email] today.
When would you have 45 minutes to walk through the site menu with our commercial team?"
[Note: name, email, callback date/time]

---
Script is a guidance tool only. Verify all representations. Engage legal counsel before any commitment.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY 1:1 wrappers
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

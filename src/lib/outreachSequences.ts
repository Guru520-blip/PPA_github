import { Supplier, Seeker } from "./types";

const PLATFORM = "PowerMatch Advisors";
const EMAIL = "deals@powermatch.io";

export type SeekerPersona = "S1" | "S2" | "S3";
export type SupplierPersona = "P1" | "P2" | "P3";
export type SequenceTouch =
  | "email1" | "email2" | "linkedin-note" | "linkedin-dm"
  | "email3" | "email4" | "voicemail";

export const SEEKER_PERSONAS: Record<SeekerPersona, { label: string; focus: string }> = {
  S1: { label: "Sustainability / ESG Lead",  focus: "Additionality, Scope 2 integrity, CFE targets, reporting credibility" },
  S2: { label: "Energy Procurement Lead",    focus: "Standardized bids, vendor management, shape risk, cycle time" },
  S3: { label: "Finance / CFO / Treasury",   focus: "MTM valuation, hedge accounting, downside control, board approval" },
};

export const SUPPLIER_PERSONAS: Record<SupplierPersona, { label: string; focus: string }> = {
  P1: { label: "Head of Origination",        focus: "Pre-vetted demand, offtaker creditworthiness, origination cost" },
  P2: { label: "Commercial / BD",            focus: "Deal flow, pricing benchmarks, pipeline visibility" },
  P3: { label: "Asset Owner / Storage",      focus: "Bankability, NDA-gated disclosure, term sheet standardization" },
};

export const TOUCH_LABELS: Record<SequenceTouch, string> = {
  "email1":        "Touch 1 — Cold Email (Day 1)",
  "email2":        "Touch 2 — Follow-up (Day 4)",
  "linkedin-note": "Touch 3 — LinkedIn Connection (Day 7)",
  "linkedin-dm":   "Touch 4 — LinkedIn Follow-up (Day 10)",
  "email3":        "Touch 5 — Value Drop (Day 14)",
  "email4":        "Touch 6 — Breakup (Day 18)",
  "voicemail":     "Voicemail Script (30 sec)",
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function fn(contact: string | undefined): string {
  return contact?.split(/[–—]/)[0].trim().split(/\s+/)[0] ?? "there";
}
function region(seeker: Seeker): string {
  return seeker.preferredRegions?.slice(0, 2).join(" / ") || "your market";
}
function supplierRegion(supplier: Supplier): string {
  return supplier.region.split(",")[0].trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// SEEKER SEQUENCES — outreach to corporate power buyers/offtakers
// ─────────────────────────────────────────────────────────────────────────────
export function generateSeekerSequence(
  suppliers: Supplier[],
  seeker: Seeker,
  persona: SeekerPersona,
  touch: SequenceTouch
): string {
  const name = fn(seeker.keyContact);
  const co = seeker.name;
  const mw = seeker.neededMW;
  const mkt = region(seeker);
  const totalMW = suppliers.reduce((s, x) => s + x.availableMW, 0);
  const n = suppliers.length;

  // ── S1: Sustainability / ESG Lead ────────────────────────────────────────
  if (persona === "S1") {
    if (touch === "email1") return `Subject options (pick one):
1. ${co} Scope 2 procurement — additionality-verified supply in ${mkt}
2. CFE-aligned PPA supply for ${co}'s net-zero pathway
3. ${mw} MW — off-market supply that clears RE100 additionality bar
4. Structured PPA discovery for ${co}'s sustainability team
5. Price discovery for ${co}'s next renewable procurement

---

Hi ${name},

Corporate PPAs that count for Scope 2 market-based claims need to clear three bars: additionality, temporal matching, and geographic relevance. Getting that right while running a competitive process internally is where most sustainability teams lose time.

We run a structured sourcing process — ${co}'s ${mw} MW requirement goes simultaneously to ${n} pre-vetted generators in ${mkt}. Bids return in a standardized format your legal and sustainability teams can compare directly. No bespoke RFP drafts, no sequential calls.

We currently hold mandates on ${totalMW} MW of off-market supply, including assets that qualify on additionality.

Worth 10 minutes to see what's available — and what comparable transactions look like right now?

${PLATFORM}
${EMAIL}`;

    if (touch === "email2") return `Hi ${name},

Following up briefly on my note from a few days ago.

We have ${n} generation assets in ${mkt} that could cover ${co}'s ${mw} MW need — all additionality-eligible, none in the public market. If the timing isn't right, I understand. If your team is actively looking, a 10-minute call this week is worth it.

Reply and I'll send a one-page market snapshot.

${PLATFORM} | ${EMAIL}`;

    if (touch === "linkedin-note") return `Hi ${name} — I work with corporate sustainability teams running PPA procurement in ${mkt}. Have ${n} off-market generators covering ${mw} MW — additionality-eligible. Thought it might be relevant to ${co}'s RE procurement work. Happy to share a market snapshot if useful.`;

    if (touch === "linkedin-dm") return `${name}, thanks for connecting.

The reason I reached out: we're seeing active buyer competition for additionality-verified generation in ${mkt} right now. Pricing has moved and supply windows are closing.

I work with corporate sustainability and procurement leads to run a structured, simultaneous bid process — standardized format, comparable term sheets, Scope 2-defensible supply.

If ${co}'s procurement cycle is open in the next 6 months, even a brief look at current pricing is worth doing. Can I send a 1-page snapshot of what's transacting?`;

    if (touch === "email3") return `Hi ${name},

Last note from me on this.

We publish a quarterly PPA market snapshot — pricing ranges by technology, ISO, and contract structure, compiled from live transactions we're involved in. No fluff, no forecasts, just what buyers are actually paying.

I can share the version for ${mkt} right now — no call required. Reply with "yes" and I'll send it over.

${PLATFORM} | ${EMAIL}`;

    if (touch === "email4") return `Hi ${name},

I'll stop reaching out after this.

If ${co}'s renewable procurement is active and you'd like a second-opinion market view, or a structured bid process that takes 10 business days instead of 10 months — reply anytime. The offer stands.

${PLATFORM} | ${EMAIL}`;

    if (touch === "voicemail") return `VOICEMAIL SCRIPT (30 sec):

"Hi ${name}, [Your Name] from ${PLATFORM}. Quick message — I've been reaching out about ${co}'s renewable procurement in ${mkt}. We have ${n} off-market generators in that market — additionality-eligible, covering your ${mw} MW need. I can share current pricing in a 1-page snapshot, no call required. Number is [your number]. Alternatively, reply to the email I sent. Thanks."`;

    return "";
  }

  // ── S2: Energy Procurement Lead ──────────────────────────────────────────
  if (persona === "S2") {
    if (touch === "email1") return `Subject options (pick one):
1. PPA bids for ${co} — standardized, comparable, in ${mkt}
2. Cut 6 months from ${co}'s next PPA procurement cycle
3. ${mw} MW procurement — simultaneous bids, common term sheet format
4. ${co} power procurement — reducing RFP friction in ${mkt}
5. Comparable PPA offers in ${mkt} — your timeline, not theirs

---

Hi ${name},

PPA procurement cycles run 12-18 months internally — not because the market is slow, but because bids come back in incomparable formats that require manual normalization before your legal and commercial teams can evaluate them.

We fix the format problem. ${co}'s ${mw} MW requirement goes simultaneously to ${n} qualified generators in ${mkt}. Bids return in a standardized structure — fixed price vs. indexed, shape, tenor, credit terms — so your team spends time on decisions, not spreadsheet work.

Current supply in your market covers your MW requirement. We can have first-round pricing on your desk within 10 business days of kickoff.

10 minutes to see whether the timing fits your procurement cycle?

${PLATFORM}
${EMAIL}`;

    if (touch === "email2") return `Hi ${name},

Following up. One specific thing worth knowing: we're currently running active procurement processes in ${mkt} for buyers in the same load profile range as ${co}.

Market pricing and available structures in 10 minutes — or I can send a summary without a call. Which works better?

${PLATFORM} | ${EMAIL}`;

    if (touch === "linkedin-note") return `Hi ${name} — I help energy procurement teams at corporates run structured PPA processes in ${mkt}. Currently have ${n} pre-vetted generators covering ${mw} MW. Standardized bid format, 10-business-day turnaround. Thought it might be relevant to ${co}'s procurement work.`;

    if (touch === "linkedin-dm") return `${name}, thanks for connecting.

The specific thing I wanted to flag: we're seeing shape risk become a bigger issue for buyers in ${mkt} right now — generators are pushing as-generated structure, and buyers need to model what that means for their actual energy bills.

We require standardized bids that explicitly price fixed-shape vs. as-generated, with basis risk quantified. That alone saves most procurement teams 3-4 weeks of back-and-forth.

If ${co}'s next procurement is in the planning stage, worth a 10-minute call on how other buyers in your ISO are structuring terms right now?`;

    if (touch === "email3") return `Hi ${name},

One concrete offer: I can share what buyers in ${mkt} are paying for PPAs in the same MW range as ${co} right now — technology type, term, price range, and structure. Compiled from live transactions, not forecasts.

No call needed. Reply "send it" and I'll have it in your inbox today.

${PLATFORM} | ${EMAIL}`;

    if (touch === "email4") return `Hi ${name},

Last one from me.

If ${co}'s PPA procurement moves to active phase and you want a process that delivers comparable bids in 10 business days — we're here. Reply anytime.

${PLATFORM} | ${EMAIL}`;

    if (touch === "voicemail") return `VOICEMAIL SCRIPT (30 sec):

"Hi ${name}, [Your Name] calling from ${PLATFORM}. I've sent a couple of notes about ${co}'s PPA procurement in ${mkt}. Short version: we can deliver standardized, comparable bids from ${n} qualified generators in 10 business days. I can share a snapshot of current market pricing without a call — just reply to my email and I'll send it over. Number is [your number]. Thanks."`;

    return "";
  }

  // ── S3: Finance / CFO / Treasury ─────────────────────────────────────────
  if (persona === "S3") {
    if (touch === "email1") return `Subject options (pick one):
1. PPA MTM risk for ${co} — CFO-ready framework for ${mkt}
2. Downside scenario analysis before ${co}'s next PPA
3. Hedge accounting treatment for ${co}'s renewable structure
4. ${mw} MW PPA — board-level risk framework included
5. ${co} power procurement — price transparency and downside control

---

Hi ${name},

Two questions worth framing before ${co}'s next PPA commitment: What's the mark-to-market exposure if merchant prices move 30% against you? Does your structure survive hedge accounting scrutiny?

We provide a structured bid process designed for a board-level investment decision — not just a procurement outcome. Deliverables include: standardized pricing from multiple generators, shape risk quantified in $M/year terms, and a downside scenario that works as a CFO presentation exhibit.

We currently hold mandates on ${totalMW} MW of off-market supply in ${mkt}. Comparable transactions are available for benchmarking.

Can I share a 1-page market-to-market risk framework for ${mkt} — no call required?

${PLATFORM}
${EMAIL}`;

    if (touch === "email2") return `Hi ${name},

Quick follow-up. For context: the 1-page framework I mentioned quantifies basis risk, shape risk, and MTM downside for a ${mw} MW PPA in ${mkt} — sized for a board slide, not an energy analyst deep-dive.

I can send it today without a call. Would that be useful?

${PLATFORM} | ${EMAIL}`;

    if (touch === "linkedin-note") return `Hi ${name} — I work with finance and treasury teams on PPA risk frameworks — MTM valuation, hedge accounting treatment, downside scenarios for board sign-off. Have a 1-page benchmark for ${mkt} (${mw} MW range). Thought it might be relevant to ${co}'s renewable strategy.`;

    if (touch === "linkedin-dm") return `${name}, thanks for connecting.

The specific context: PPAs are increasingly showing up on corporate balance sheets as right-of-use assets under IFRS 16, and virtual PPAs carry MTM exposure that CFOs are scrutinizing more closely.

The framework I offer covers: how MTM exposure changes across a 10-year tenor at different merchant curves, what shape risk costs in $/MWh terms, and how to structure credit terms to survive a counterparty downgrade scenario.

For ${co}'s scale — ${mw} MW in ${mkt} — the downside numbers are material enough to warrant a 10-minute look before the deal progresses to LOI.

Happy to share the 1-pager. Useful?`;

    if (touch === "email3") return `Hi ${name},

Last concrete offer before I stop: our quarterly benchmark for ${mkt} covers PPA pricing ranges by technology, prevailing tenor and credit terms, and a simple MTM scenario model. Finance teams use it to frame board discussions before entering negotiations.

Reply "send it" and it's in your inbox today.

${PLATFORM} | ${EMAIL}`;

    if (touch === "email4") return `Hi ${name},

I'll leave it here.

If ${co}'s PPA risk framework work moves forward and you'd like a structured process with CFO-ready analytics built in — reply anytime. No pressure.

${PLATFORM} | ${EMAIL}`;

    if (touch === "voicemail") return `VOICEMAIL SCRIPT (30 sec):

"Hi ${name}, [Your Name] from ${PLATFORM}. I've been in touch about ${co}'s renewable procurement — specifically the mark-to-market and hedge accounting angle for a ${mw} MW position in ${mkt}. I have a 1-page risk framework sized for a CFO slide — I can send it today, no call needed. Just reply to my email and I'll send it over. [your number]. Thanks."`;

    return "";
  }

  return "Select a persona to generate sequence content.";
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIER SEQUENCES — outreach to power sellers (developers, asset owners)
// ─────────────────────────────────────────────────────────────────────────────
export function generateSupplierSequence(
  supplier: Supplier,
  seekers: Seeker[],
  persona: SupplierPersona,
  touch: SequenceTouch
): string {
  const name = fn(supplier.keyContact);
  const co = supplier.name;
  const mw = supplier.availableMW;
  const mkt = supplierRegion(supplier);
  const type = supplier.type;
  const n = seekers.length;
  const totalDemand = seekers.reduce((s, x) => s + x.neededMW, 0);

  // ── P1: Head of Origination ───────────────────────────────────────────────
  if (persona === "P1") {
    if (touch === "email1") return `Subject options (pick one):
1. ${n} pre-vetted offtakers for ${co}'s ${mw} MW in ${mkt}
2. Reducing origination time for ${co}'s ${type} position
3. Qualified demand — ${totalDemand} MW actively seeking ${mkt} supply
4. ${co} origination: creditworthiness-screened offtaker pipeline
5. Pre-vetted buyers for ${co}'s ${mkt} asset — reduced soft costs

---

Hi ${name},

Every unqualified buyer conversation your origination team engages costs 2-4 weeks of commercial and legal resource before you know whether their credit is bankable or their timeline is real.

We pre-screen offtakers on creditworthiness, board mandate, deployment timeline, and MW requirement before any introduction. ${co}'s ${mw} MW ${type} position in ${mkt} matches ${n} currently active buyers — combined demand ${totalDemand} MW.

Introductions are made under NCND. You review buyer profiles before deciding whether to engage. No exclusivity required until you select a preferred counterparty.

Worth 10 minutes to see the qualified buyer profiles in your market?

${PLATFORM}
${EMAIL}`;

    if (touch === "email2") return `Hi ${name},

Quick follow-up on the ${n} buyer profiles I mentioned for ${mkt}.

These are board-approved operators — pre-screened for credit, MW requirement, and deployment timeline. Your team reviews profiles under NCND before any direct contact. Zero commitment until you decide to proceed.

Does 10 minutes this week work?

${PLATFORM} | ${EMAIL}`;

    if (touch === "linkedin-note") return `Hi ${name} — I work with origination teams to reduce soft costs by pre-screening offtakers before introductions. Have ${n} creditworthiness-verified buyers for ${co}'s ${mw} MW ${type} position in ${mkt}. Happy to share profiles under NCND.`;

    if (touch === "linkedin-dm") return `${name}, thanks for connecting.

To be concrete: we have ${n} active offtakers in ${mkt} — ${totalDemand} MW combined demand — who've cleared our creditworthiness and mandate screening. Each has confirmed board authorization and deployment timeline.

Your team reviews profiles under NCND before any direct contact. No exclusivity required until ${co} selects a preferred counterparty. If none fit, you've lost nothing except 10 minutes.

Worth a quick call to review the buyer list?`;

    if (touch === "email3") return `Hi ${name},

Concrete offer: I can share a 1-page summary of what offtakers are paying for ${type} supply in ${mkt} right now — pricing ranges, tenor preferences, and credit structures. Compiled from live mandates, not market forecasts.

Useful for your origination team's pricing strategy regardless of whether we work together.

Reply "send it" and it's in your inbox today.

${PLATFORM} | ${EMAIL}`;

    if (touch === "email4") return `Hi ${name},

Last note. If ${co}'s origination priorities change and you're looking for a pre-screened buyer pipeline in ${mkt} — we're here.

${PLATFORM} | ${EMAIL}`;

    if (touch === "voicemail") return `VOICEMAIL SCRIPT (30 sec):

"Hi ${name}, [Your Name] from ${PLATFORM}. Calling about ${co}'s ${mw} MW ${type} position in ${mkt}. We have ${n} pre-screened buyers — creditworthiness verified, board-approved, ${totalDemand} MW combined demand. Introductions made under NCND, no exclusivity until you choose. Worth 10 minutes to review the list. [your number] — or reply to my email. Thanks."`;

    return "";
  }

  // ── P2: Commercial / BD at Developer ─────────────────────────────────────
  if (persona === "P2") {
    if (touch === "email1") return `Subject options (pick one):
1. ${co} ${mkt} deal flow — ${n} active buyers in your market
2. PPA pricing benchmark for ${type} in ${mkt}
3. Active buyer demand for ${co}'s ${mw} MW — ${mkt}
4. ${co} commercial pipeline — qualified demand available
5. What buyers are paying for ${type} in ${mkt} right now

---

Hi ${name},

We're currently running active procurement mandates for ${n} buyers in ${mkt} — combined ${totalDemand} MW of demand specifically looking for ${type} supply.

${co}'s ${mw} MW position is a structural match. Beyond the introduction, I can share what comparable transactions are pricing at in your market right now — useful for your internal pricing strategy and board submissions regardless of whether we proceed.

Introductions are controlled and NCND-protected. You see buyer profiles before any contact.

10 minutes to run through the current demand picture in ${mkt}?

${PLATFORM}
${EMAIL}`;

    if (touch === "email2") return `Hi ${name},

One specific data point worth knowing: for ${type} assets in ${mkt}, we're currently seeing buyers accept tenors of 10-15 years at pricing that has moved meaningfully in the last quarter.

Worth a 10-minute call to walk through what comparable deals look like right now?

${PLATFORM} | ${EMAIL}`;

    if (touch === "linkedin-note") return `Hi ${name} — we run structured PPA origination for developers in ${mkt}. Currently have ${n} active buyers — ${totalDemand} MW — for ${type} assets. Can share a pricing benchmark for your market. Thought it might be relevant to ${co}'s pipeline.`;

    if (touch === "linkedin-dm") return `${name}, thanks for connecting.

Specific to ${co}'s position in ${mkt}: we're seeing the strongest buyer demand for ${type} we've tracked in the past 18 months — and the gap between what buyers will pay and what sellers are asking has compressed significantly.

I can share a 1-page pricing benchmark for ${mkt} — what buyers in your deal-size range are accepting on price, tenor, and shape structure. No call required; just useful market intelligence.

Want me to send it over?`;

    if (touch === "email3") return `Hi ${name},

I can send a 1-page deal-flow summary for ${type} assets in ${mkt}: pricing ranges from current buyer mandates, preferred tenor and structure, and what's moved in the last 90 days. No forecasts — live transaction data.

Reply "yes" and I'll send it today.

${PLATFORM} | ${EMAIL}`;

    if (touch === "email4") return `Hi ${name},

I'll stop following up here.

When ${co}'s commercial pipeline in ${mkt} is active, or if the pricing benchmark would be useful for a board discussion — reach out anytime.

${PLATFORM} | ${EMAIL}`;

    if (touch === "voicemail") return `VOICEMAIL SCRIPT (30 sec):

"Hi ${name}, [Your Name] from ${PLATFORM}. Calling about ${co}'s pipeline in ${mkt}. We have ${n} active buyers — ${totalDemand} MW — for ${type} assets, and a pricing benchmark showing what's transacting right now. I can send the benchmark today, no call needed. Just reply to my email. [your number]. Thanks."`;

    return "";
  }

  // ── P3: Asset Owner / Storage Developer ──────────────────────────────────
  if (persona === "P3") {
    if (touch === "email1") return `Subject options (pick one):
1. ${co} ${mkt}: controlled disclosure to ${n} bankable offtakers
2. NDA-gated buyer process for ${co}'s ${type} asset
3. Bankable offtakers for ${co}'s ${mw} MW — ${mkt}
4. Project finance-grade term sheet process for ${co}
5. Confidential PPA origination — ${mkt} — ${mw} MW ${type}

---

Hi ${name},

Monetizing a ${type} asset requires disclosing project details before you know whether a buyer is creditworthy, serious, or constrained in ways that waste months of your commercial team's time.

We invert that process. ${co}'s project information stays behind an NDA gate. Buyers are screened for bankability and project-finance-grade creditworthiness before any disclosure. You see a buyer profile before we introduce them.

We currently have ${n} screened offtakers — ${totalDemand} MW combined demand — for ${type} assets in ${mkt}. Introductions are structured under NCND with standardized term sheets to minimize legal friction.

Worth 10 minutes to review our disclosure protocol before we discuss your project specifics?

${PLATFORM}
${EMAIL}`;

    if (touch === "email2") return `Hi ${name},

Following up briefly. The disclosure protocol I mentioned is specifically designed for asset owners who need to protect project economics before term-sheet stage.

Brief overview: NDA signed first → anonymized project teaser to buyer → creditworthiness verified → full disclosure only to qualified counterparties.

10 minutes to walk through it?

${PLATFORM} | ${EMAIL}`;

    if (touch === "linkedin-note") return `Hi ${name} — I work with asset owners on NDA-gated PPA origination in ${mkt}. Controlled disclosure, project-finance-grade buyer screening, standardized term sheets. Have ${n} screened buyers for ${type} assets. Thought it might be relevant to ${co}'s portfolio.`;

    if (touch === "linkedin-dm") return `${name}, thanks for connecting.

The specific issue I see with ${type} asset origination in ${mkt}: buyers ask for project details before they've committed to anything, and asset owners end up in month-long discussions with counterparties who turn out to lack financing, board authority, or viable credit.

Our process puts the NDA and creditworthiness check before disclosure. ${co}'s project details don't leave the room until a qualified buyer is on the other side.

Currently have ${n} screened offtakers — ${totalDemand} MW combined demand. Worth a 10-minute call to see whether any of them are a fit?`;

    if (touch === "email3") return `Hi ${name},

One concrete offer: I can share a 1-page summary of what project-finance-grade buyers are paying for ${type} assets in ${mkt} right now — pricing, tenor, credit structures, and what terms are deal-breakers. Useful for your legal and commercial team's internal benchmarking.

No call required. Reply "send it" and it's in your inbox today.

${PLATFORM} | ${EMAIL}`;

    if (touch === "email4") return `Hi ${name},

Last note from me.

When ${co}'s ${type} monetization moves to active phase — reach out. We can run a confidential, NDA-gated process that protects your project economics throughout.

${PLATFORM} | ${EMAIL}`;

    if (touch === "voicemail") return `VOICEMAIL SCRIPT (30 sec):

"Hi ${name}, [Your Name] from ${PLATFORM}. Calling about ${co}'s ${type} position in ${mkt}. We run an NDA-gated origination process — buyers are credit-screened before your project details are shared. Have ${n} screened offtakers right now. I can walk through the disclosure protocol in 10 minutes — [your number], or reply to my email. Thanks."`;

    return "";
  }

  return "Select a persona to generate sequence content.";
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSONALIZATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export interface PersonalizationToken {
  token: string; label: string; source: string; example: string;
}

export const PERSONALIZATION_TOKENS: PersonalizationToken[] = [
  { token: "{{ISO_REGION}}", label: "ISO / power market", source: "seeker.preferredRegions or supplier.region", example: "ERCOT, PJM, MISO" },
  { token: "{{NET_ZERO_YEAR}}", label: "Public net-zero target year", source: "Company press release / CDP / RE100", example: "2030, 2035, 2040" },
  { token: "{{MW_NEED}}", label: "MW requirement", source: "seeker.neededMW or supplier.availableMW", example: "200 MW, 500 MW" },
  { token: "{{PPA_TYPE}}", label: "Preferred PPA structure", source: "seeker.notes / supplier.type", example: "physical, VPPA, sleeved" },
  { token: "{{TENOR}}", label: "Preferred contract term (years)", source: "seeker.notes / supplier.notes", example: "10, 12, 15 years" },
  { token: "{{COD_WINDOW}}", label: "Target commercial operation date", source: "seeker.urgencyScore inference / supplier.notes", example: "Q4 2026, H1 2027" },
  { token: "{{TECH_TYPE}}", label: "Technology type", source: "supplier.type or seeker preference", example: "solar, wind, BTM gas, hydro" },
  { token: "{{RECENT_EVENT}}", label: "Recent press release / announcement", source: "Google News, LinkedIn, IR page", example: "net-zero pledge, data center announcement, funding round" },
  { token: "{{HIRING_SIGNAL}}", label: "Energy/procurement hiring signal", source: "LinkedIn jobs (filter: energy procurement)", example: "Hiring Energy Procurement Manager" },
  { token: "{{DEAL_SIZE}}", label: "Typical deal size ($M or MW)", source: "seeker.neededMW × price estimate", example: "$30M contract, 150 MW" },
  { token: "{{CREDIT_PROFILE}}", label: "Counterparty credit tier", source: "Public ticker / rating / balance sheet", example: "investment-grade, NASDAQ-listed, private" },
  { token: "{{SHAPE_PREF}}", label: "Buyer's load shape preference", source: "seeker.notes / industry type", example: "fixed-shape, as-generated, baseload" },
];

export interface Objection { objection: string; rebuttal1: string; rebuttal2: string; }

export const BUYER_OBJECTIONS: Objection[] = [
  {
    objection: "We already have an energy advisor / broker",
    rebuttal1: "Your advisor advises; we run the standardized bid process that gives them and you market-clearing price data. They're compatible.",
    rebuttal2: "Are they running a simultaneous competitive process, or working one developer at a time? We can run in parallel for a second opinion on pricing.",
  },
  {
    objection: "We're not actively looking for PPAs right now",
    rebuttal1: "Understood. The market snapshot I offered is useful whether you're 6 months or 2 years out — it sets a pricing baseline before the RFP.",
    rebuttal2: "Most procurement cycles that close on time started market intelligence 18 months before. I'm just offering the intelligence part, no commitment.",
  },
  {
    objection: "Our legal team needs to review any new vendor",
    rebuttal1: "The 1-page market snapshot I'm offering doesn't require any vendor relationship — it's just data. Legal review applies when we get to the NCND.",
    rebuttal2: "Our NCND is a 2-page standard form. Most legal teams turn it in 24 hours. I can send it alongside the market snapshot if useful.",
  },
  {
    objection: "Pricing is too volatile for us to commit to a PPA now",
    rebuttal1: "Volatility is exactly why locking in a structured hedge now makes sense. The benchmark shows what ranges buyers in your market are accepting.",
    rebuttal2: "We can show you a downside scenario that quantifies what 'too volatile' actually costs vs. the PPA alternative. That's the CFO conversation worth having.",
  },
  {
    objection: "We prefer to run our own RFP process",
    rebuttal1: "Completely reasonable. We standardize what you'd build anyway — the bid format, term sheet, and evaluation matrix — and save your team 6 months of setup.",
    rebuttal2: "If you're running your own process, I can at least share what pricing cleared in the last 90 days so your RFP benchmark is current.",
  },
];

export const SUPPLIER_OBJECTIONS: Objection[] = [
  {
    objection: "We have an in-house origination team",
    rebuttal1: "We're not replacing your team — we surface pre-screened opportunities so they spend time on qualified conversations, not cold leads.",
    rebuttal2: "Your origination team closes deals. We reduce the cost of finding the deals. Most teams use both.",
  },
  {
    objection: "We're already in discussions with potential offtakers",
    rebuttal1: "Having additional qualified counterparties only strengthens your negotiating position on price and terms. No harm in knowing who else is interested.",
    rebuttal2: "We can hold your project in our system without active marketing — so when your current discussions stall, the pipeline is ready.",
  },
  {
    objection: "We don't want our project details shared without control",
    rebuttal1: "Our process puts the NDA before any disclosure. Buyers are credit-screened before they see anything. You approve each introduction.",
    rebuttal2: "Your project name and details aren't shared until after the NCND is signed and the buyer clears our creditworthiness check.",
  },
  {
    objection: "What's your fee? We can't afford another cost center",
    rebuttal1: "Success-based only — paid on close, disclosed in our MFPA. Zero cost until a deal closes. It's not a cost center; it's a closing tool.",
    rebuttal2: "Think of it as a cost per qualified introduction vs. your origination team's cost per qualified conversation. The math usually works out.",
  },
  {
    objection: "We've tried brokers before and they wasted our time",
    rebuttal1: "Our introductions are pre-screened: creditworthiness, board mandate, MW requirement, and timeline all verified before you see a profile.",
    rebuttal2: "The difference is our NDA-first, disclosure-controlled protocol. You're not sending a deck to an unscreened prospect — you're reviewing a vetted profile.",
  },
];


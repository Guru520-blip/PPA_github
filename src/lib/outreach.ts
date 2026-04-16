import { Supplier, Seeker, OutreachTemplate } from "./types";

const BROKER_NAME = "PowerMatch Advisors";
const BROKER_EMAIL = "deals@powermatch.io";

export function generateOutreachToSupplier(
  supplier: Supplier,
  seeker: Seeker,
  template: OutreachTemplate
): string {
  const firstName = supplier.name.split("–")[0].trim().split(" ")[0];

  if (template === "cold-email") {
    return `Subject: Long-Term Power Offtake Partnership – ${seeker.neededMW} MW Flexible Load for ${supplier.region}

Dear ${firstName} Team,

I hope this message finds you well. I am reaching out on behalf of ${BROKER_NAME} regarding a potential long-term power offtake arrangement that may directly address your current situation in ${supplier.region}.

We represent a controlled high-density compute client — ${seeker.name} (${seeker.type}) — seeking ${seeker.neededMW} MW of firm or flexible power capacity with all-in pricing at or below ${supplier.estimatedAllInCents + 1}¢/kWh.

**Why This Partnership Makes Sense for You:**
Your current situation — ${supplier.keyPain} — presents a clear monetization opportunity through a structured Power Purchase Agreement (PPA). Our client offers:
• Long-term offtake: 7–15 year agreement with price stability
• Flexible/interruptible load profile: demand response capability adds grid value
• Rapid deployment: modular compute infrastructure deployable within 12–18 months
• No heavy capex requirement from your side

**About Our Client:**
${seeker.notes}

We are prepared to execute an NCND and proceed to a Site Teaser / LOI within 2 weeks of initial dialogue.

Would you be available for a 30-minute call this week to explore fit?

Best regards,
${BROKER_NAME} Team
${BROKER_EMAIL}

---
DISCLAIMER: This is a guidance and introductory communication tool. All data, contacts, and tariff information should be independently verified. Engage licensed attorneys and engineers before executing any agreement.`;
  }

  if (template === "linkedin") {
    return `Hi [Contact Name],

I lead infrastructure partnerships at ${BROKER_NAME} and am reaching out because of your team's position in ${supplier.region}.

Given ${supplier.keyPain.toLowerCase()}, I believe we have a highly relevant opportunity: a ${seeker.neededMW} MW flexible compute load client (${seeker.name}) actively seeking a long-term PPA in your region at competitive all-in pricing.

This isn't speculative — our client has board-approved capital and a 12-month deployment mandate.

Would a brief call make sense? Happy to share a one-page deal summary under NDA.

— ${BROKER_NAME} | ${BROKER_EMAIL}

[DISCLAIMER: Verify all details independently. Guidance tool only.]`;
  }

  // call-script
  return `CALL SCRIPT – Outreach to ${supplier.name}
Target Contact: Business Development / CEO / CFO
Duration: 10–15 minutes

OPENING (30 sec):
"Good [morning/afternoon], this is [Your Name] from ${BROKER_NAME}. I'm reaching out specifically because of your operations in ${supplier.region} — I believe we have a time-sensitive opportunity that directly addresses [${supplier.keyPain.split(";")[0]}]. Do you have 5 minutes?"

VALUE HOOK (1 min):
"We represent ${seeker.name}, a ${seeker.type} actively seeking ${seeker.neededMW} MW of power capacity in your region. They have a board-approved mandate and capital to deploy — they're not waiting on committee approvals. The ask is simple: a 7–15 year PPA at pricing that works for both sides."

PAIN ACKNOWLEDGMENT (1 min):
"I understand your situation: ${supplier.keyPain}. This deal solves that — stable long-term offtake revenue, no heavy capex on your end, and a credible counterparty with real deployment experience."

ASK:
"Can we schedule a 30-minute call with your BD/legal team this week? I'll send over an NCND and one-page deal summary today."

OBJECTION HANDLING:
- "We already have customers": "Understood — our client can absorb surplus beyond existing commitments."
- "What's your fee?": "Success-based only. We earn a fee per MW closed, disclosed in our MFPA. No upfront cost to you."
- "Send email first": "Absolutely — what's the best email for your BD lead?"

CLOSE:
"Great. Expect our NCND and deal summary within the hour. Looking forward to connecting your team with ours."

---
DISCLAIMER: This script is a guidance tool. Verify all representations. Engage legal counsel before commitments.`;
}

export function generateOutreachToSeeker(
  supplier: Supplier,
  seeker: Seeker,
  template: OutreachTemplate
): string {
  const firstName = seeker.name.split("–")[0].trim().split(" ")[0];

  if (template === "cold-email") {
    return `Subject: Exclusive Power Access – ${supplier.availableMW} MW at ${supplier.estimatedAllInCents}¢/kWh | ${supplier.region} | <12 Month Deployment

Dear ${firstName} Infrastructure Team,

I am writing from ${BROKER_NAME} with an opportunity that may directly address your stated challenge: ${seeker.keyPain}.

We have exclusive brokerage access to a ${supplier.type} power opportunity in ${supplier.region} — ${supplier.name} — offering:
• ${supplier.availableMW} MW of available capacity (expandable)
• All-in pricing: ${supplier.estimatedAllInCents}¢/kWh (below your 5¢ target)
• Type: ${supplier.type}
• Deployment timeline: Under 12–18 months (bypasses interconnection queue)
• Infrastructure: Existing substation/generation assets — no greenfield queue

**Why Now:**
${supplier.keyPain} — this creates a seller's urgency that gives you negotiating leverage for long-term pricing. This window won't last.

**About You:**
We understand ${seeker.notes.split(".")[0]}. This opportunity aligns directly with that mandate.

We can provide a full Site Teaser (non-circumventing) and execute NCND within days.

Are you the right contact for power infrastructure partnerships, or should I reach your facilities/infrastructure team directly?

Best,
${BROKER_NAME}
${BROKER_EMAIL}

---
DISCLAIMER: Guidance tool only. All pricing, capacity, and contact details must be independently verified. Engage licensed engineers and legal counsel before any commitment.`;
  }

  if (template === "linkedin") {
    return `Hi [Contact Name],

${BROKER_NAME} here — I'm reaching out because your team's power infrastructure challenge is one I think we can help solve.

We have access to ${supplier.availableMW} MW in ${supplier.region} at ${supplier.estimatedAllInCents}¢/kWh all-in — ${supplier.type}. Existing infrastructure, no grid queue, 12–18 month deployment path.

Given ${seeker.keyPain.toLowerCase()}, the timing makes sense to explore this now.

Would a brief intro call work? I can share a site teaser under NDA within 24 hours.

— ${BROKER_NAME} | ${BROKER_EMAIL}

[DISCLAIMER: All data subject to independent verification. Guidance tool only.]`;
  }

  // call-script
  return `CALL SCRIPT – Outreach to ${seeker.name}
Target Contact: VP Infrastructure / Head of Data Centers / CTO Office
Duration: 10–15 minutes

OPENING (30 sec):
"Hi, this is [Your Name] from ${BROKER_NAME}. I'm reaching out specifically about your power infrastructure expansion — we have an exclusive opportunity that bypasses the interconnection queue entirely. Do you have 5 minutes?"

VALUE HOOK (1 min):
"We have ${supplier.availableMW} MW of ${supplier.type} capacity in ${supplier.region} at ${supplier.estimatedAllInCents}¢/kWh all-in. Existing infrastructure — no 3-year grid queue. Timeline: 12–18 months to energize. Given your stated need for rapid deployment at scale, this could be exactly what you're looking for."

PAIN ACKNOWLEDGMENT (1 min):
"I know the challenge you're facing: ${seeker.keyPain}. The traditional utility queue path takes 3–5 years. This is different — existing assets, existing permits, motivated seller."

ASK:
"Can I send over a brief site teaser under NCND? It takes 10 minutes to review and will tell you quickly if this is worth a deeper conversation."

OBJECTION HANDLING:
- "We have a process": "Of course — this would go through your normal diligence. I just want to get you the teaser so your team can evaluate."
- "We need X MW, you only have Y": "The site is expandable — let's discuss the full capacity roadmap on a call."
- "What's your fee?": "Success-based, paid by the power provider. Zero cost to you."

CLOSE:
"I'll send the NCND and teaser within the hour. Who on your legal team handles NDAs?"

---
DISCLAIMER: Script is a guidance tool only. Verify all representations independently.`;
}

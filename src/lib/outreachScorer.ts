// ─────────────────────────────────────────────────────────────────────────────
// Outreach Email Scorer
// Evaluates cold emails against 6 professional dimensions (100 pts total).
// Based on: cold email best practices (Lemkin, Hormozi), B2B energy sector
// communication standards, and compliance/misrepresentation risk criteria.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreDimension {
  name: string;
  weight: number;   // max points for this dimension
  score: number;    // actual score achieved
  checks: ScoreCheck[];
}

export interface ScoreCheck {
  label: string;
  passed: boolean;
  points: number;   // points awarded (positive) or deducted (negative)
  tip?: string;     // improvement suggestion when failed
}

export interface OutreachScore {
  total: number;       // 0-100
  grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F";
  label: string;       // "Market-ready" | "Strong" | "Good" | etc.
  dimensions: ScoreDimension[];
  topIssues: string[]; // top 3 actionable issues
  passCount: number;
  failCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function paragraphCount(text: string): number {
  return text.split(/\n{2,}/).filter(p => p.trim().length > 20).length;
}

function bodyOnly(email: string): string {
  // Strip subject line and signature block
  return email
    .replace(/^Subject:.*$/m, "")
    .replace(/Alex Chen[\s\S]*$/m, "")
    .replace(/\[Informational.*?\]/gi, "")
    .trim();
}

// ─── Dimension 1: Factual Integrity (25 pts) ─────────────────────────────────
// Every claim must be sourced from data or explicitly hedged.
// Unverified boilerplate is the #1 legal and credibility risk.

function scoreFacts(email: string): ScoreDimension {
  const checks: ScoreCheck[] = [
    {
      label: "No blanket 'board approval / committed capital' claim",
      passed: !/board.approv|committed (deployment )?capital|board-approved with committed/i.test(email),
      points: 5,
      tip: "Only assert capital commitment if seeker.capexCommitted === true (NASDAQ filings). Private companies: stay silent.",
    },
    {
      label: "No 'exclusive brokerage mandates' language",
      passed: !/exclusive brokerage mandate/i.test(email),
      points: 4,
      tip: "Replace with 'representing the owners of' — factual, not boastful.",
    },
    {
      label: "No 'None of it is in a broker database'",
      passed: !/none of it is in.*database|not in any.*database/i.test(email),
      points: 4,
      tip: "Cannot verify exclusivity for all 25 suppliers. Use 'placed through a private matching process' instead.",
    },
    {
      label: "No hardcoded '12–18 months to energization' as fact",
      passed: !/(?<!est\.|estimated|approx\.)\s*12[–-]18 months? to energi/i.test(email),
      points: 4,
      tip: "Derive from estimatedMonthsToEnergization field. If unknown, omit or say 'subject to diligence'.",
    },
    {
      label: "No blanket 'existing permits' for all sites",
      passed: !/each site has existing permits|all sites.*existing permits/i.test(email),
      points: 4,
      tip: "Only assert permits if permitStatus === 'Confirmed' or 'Seller-stated' with hedge. BTM gas = gas rights only.",
    },
    {
      label: "No 'we have a direct solution' opener",
      passed: !/we have a direct solution|—\s*we have a direct/i.test(email),
      points: 4,
      tip: "Replace with a specific market insight about the recipient's situation.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  return { name: "Factual Integrity", weight: 25, score, checks };
}

// ─── Dimension 2: Personalization (20 pts) ───────────────────────────────────
// Cold emails fail when they read as mass-broadcast. Specificity signals effort.

function scorePersonalization(email: string): ScoreDimension {
  const body = bodyOnly(email);

  const checks: ScoreCheck[] = [
    {
      label: "Opens with recipient's first name",
      passed: /^Hi\s+[A-Z][a-z]+,/m.test(email) && !/^Hi\s+(there|team|all|folks),/im.test(email),
      points: 4,
      tip: "Use firstName(contact) — never 'Hi there' or 'Hi Team'.",
    },
    {
      label: "Opener contains company/industry-specific insight (not generic pitch)",
      passed: (() => {
        // First paragraph after "Hi Name," — should reference THEIR world, not open with "We have..."
        const paragraphs = body.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
        const opener = paragraphs[0]?.startsWith("Hi ") ? paragraphs[1] : paragraphs[0];
        if (!opener) return false;
        if (wordCount(opener) < 15) return false;
        return !/^(we |our |i'm calling about your.*—\s*we have|power procurement.*—\s*we have)/i.test(opener);
      })(),
      points: 6,
      tip: "First paragraph should reference something specific to their company/sector (earnings signal, regulatory window, strategic pivot) — not start with what you have.",
    },
    {
      label: "References recipient's specific MW requirement",
      passed: /\b\d{2,4}\s*MW\b.*(need|require|cover|redundanc)|your\s+\d{2,4}\s*MW/i.test(email),
      points: 4,
      tip: "Always echo back their specific MW need — shows you've done your homework.",
    },
    {
      label: "References specific geography relevant to recipient",
      passed: /permian|bakken|appalachia|paraguay|iceland|ethiopia|norway|kenya|malaysia|bhutan|chile|montana|nevada|ercot|pjm|miso|alberta|quebec/i.test(email),
      points: 3,
      tip: "Include the asset region — 'BTM gas in Texas Permian' is more credible than 'BTM assets'.",
    },
    {
      label: "Avoids 'your company' — uses recipient's actual company name or asset name",
      passed: !/your company(?!'s site|'s asset)/i.test(email),
      points: 3,
      tip: "Use the supplier/seeker's actual name, not a placeholder.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  return { name: "Personalization", weight: 20, score, checks };
}

// ─── Dimension 3: Subject Line (15 pts) ──────────────────────────────────────
// Subject is the gatekeeper. 47% of recipients open based on subject alone.

function scoreSubject(email: string): ScoreDimension {
  const match = email.match(/^Subject:\s*(.+)$/m);
  const subject = match?.[1] ?? "";

  const spamWords = /urgent|exclusive|solution|no cost|free|guaranteed|limited time|act now|open immediately/i;
  const catalogWords = /power menu|site menu|brokerage menu|off-market menu/i;

  const checks: ScoreCheck[] = [
    {
      label: `Subject line present (${subject.length} chars)`,
      passed: subject.length > 5,
      points: 2,
      tip: "Always include a subject line.",
    },
    {
      label: "Subject ≤ 70 characters (preview-friendly)",
      passed: subject.length > 0 && subject.length <= 70,
      points: 4,
      tip: `Currently ${subject.length} chars. Trim to ≤70 for Gmail/Outlook preview.`,
    },
    {
      label: "Subject is specific (MW, asset type, or region)",
      passed: /\d+\s*MW|BTM|CFE|off-market|hydro|geotherm|curtail|nuclear/i.test(subject),
      points: 5,
      tip: "Generic subjects get deleted. Include the asset type and MW amount.",
    },
    {
      label: "No spam trigger words in subject",
      passed: !spamWords.test(subject),
      points: 2,
      tip: "Avoid: urgent, exclusive, solution, free, guaranteed.",
    },
    {
      label: "No catalog/menu language in subject",
      passed: !catalogWords.test(subject),
      points: 2,
      tip: "'Off-Market Power Menu' reads like a product listing. Use '[X] MW [region] — question' format.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  return { name: "Subject Line", weight: 15, score, checks };
}

// ─── Dimension 4: Length & Structure (15 pts) ────────────────────────────────
// Busy executives read 3 paragraphs max. Anything longer = instant delete.

function scoreStructure(email: string): ScoreDimension {
  const body = bodyOnly(email);
  const wc = wordCount(body);
  const pc = paragraphCount(body);

  // Count CTAs
  const ctaMatches = (email.match(/15.minute|quick call|brief call|\bcall this week\b|one-page|one-pager|send you|happy to send/gi) ?? []).length;

  const checks: ScoreCheck[] = [
    {
      label: `Body ≤ 180 words (currently ${wc})`,
      passed: wc <= 180,
      points: wc <= 150 ? 6 : wc <= 180 ? 5 : 0,
      tip: "Cut to ≤180 words. Every sentence must earn its place. Remove hedging/disclaimer language from body.",
    },
    {
      label: `≤ 4 paragraphs (currently ${pc})`,
      passed: pc <= 4,
      points: 4,
      tip: "Structure: (1) specific insight, (2) what you have, (3) why now, (4) one CTA.",
    },
    {
      label: "Single clear CTA — not two or more asks",
      passed: ctaMatches === 1,
      points: 5,
      tip: ctaMatches === 0
        ? "Missing CTA. End with one specific ask: '15-minute call this week?'"
        : "Multiple CTAs split attention. Pick one: call OR one-pager, not both.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  return { name: "Length & Structure", weight: 15, score, checks };
}

// ─── Dimension 5: Professional Tone (15 pts) ─────────────────────────────────
// Energy bankers and asset owners respond to peer-level language, not salesperson.

function scoreTone(email: string): ScoreDimension {
  const checks: ScoreCheck[] = [
    {
      label: "Signed by a named person (not company alias)",
      passed: /Alex Chen|[A-Z][a-z]+ [A-Z][a-z]+\nPowerMatch/m.test(email) && !/deals@|info@|contact@/i.test(email),
      points: 5,
      tip: "Sign as 'Alex Chen / PowerMatch Advisors' with direct email. Never 'deals@powermatch.io' — nobody replies to aliases.",
    },
    {
      label: "No cliché sales phrases ('direct solution', 'perfect fit', 'game-changer')",
      passed: !/direct solution|perfect fit|game.changer|world-class|cutting.edge|leverage synerg/i.test(email),
      points: 4,
      tip: "Replace with specific, concrete language. 'We've matched 3 similar assets in this region' beats 'we have a direct solution'.",
    },
    {
      label: "No brochure language ('We hold exclusive...', 'Our portfolio...')",
      passed: !/we hold exclusive|our portfolio of|our platform|our proprietary/i.test(email),
      points: 3,
      tip: "Write as a person, not a company. 'I'm representing' not 'We hold exclusive mandates'.",
    },
    {
      label: "Closing ask is collegial, not presumptuous",
      passed: /worth.*minutes|happy to|if.*timing works|if.*makes sense|would.*make sense/i.test(email),
      points: 3,
      tip: "Close with 'Worth 15 minutes?' not 'Schedule a call on my calendar'. Leave the power with them.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  return { name: "Professional Tone", weight: 15, score, checks };
}

// ─── Dimension 6: Value Clarity (10 pts) ─────────────────────────────────────
// The reader must instantly understand WHAT you have and WHY it matters to them.

function scoreValue(email: string): ScoreDimension {
  const checks: ScoreCheck[] = [
    {
      label: "States asset MW capacity clearly",
      passed: /\d{2,4}\s*MW.*(available|capacity|existing|operational|total)|representing.*\d{2,4}\s*MW/i.test(email),
      points: 4,
      tip: "Always say the MW number. Vague 'significant capacity' means nothing.",
    },
    {
      label: "Pricing handled correctly (benchmarked, not specific ¢/kWh in cold email)",
      passed: (
        /pricing.*comparable|competitive.*transaction|comparable.*transaction|in line with.*market|range of.*transaction/i.test(email) &&
        !/^\d+\.?\d*¢\/kWh|at \d+\.?\d* cents/im.test(email)
      ),
      points: 3,
      tip: "Cold email: 'pricing in line with recent comparable transactions'. Never quote ¢/kWh — anchors negotiation against you.",
    },
    {
      label: "States the process clearly (how this works, what happens next)",
      passed: /one.page|site overview|one.pager|no formal paperwork|no.*NDA at this stage|brief conversation/i.test(email),
      points: 3,
      tip: "Explain the low-friction next step: 'I can send a one-page overview — no paperwork at this stage'.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  return { name: "Value Clarity", weight: 10, score, checks };
}

// ─── Main Scorer ─────────────────────────────────────────────────────────────

export function scoreOutreachEmail(email: string): OutreachScore {
  if (!email || email.length < 50) {
    return {
      total: 0, grade: "F", label: "No email generated",
      dimensions: [], topIssues: ["Generate an email first"], passCount: 0, failCount: 0,
    };
  }

  const dimensions = [
    scoreFacts(email),
    scorePersonalization(email),
    scoreSubject(email),
    scoreStructure(email),
    scoreTone(email),
    scoreValue(email),
  ];

  const total = Math.min(100, dimensions.reduce((sum, d) => sum + d.score, 0));

  const grade: OutreachScore["grade"] =
    total >= 95 ? "A+" : total >= 90 ? "A" : total >= 85 ? "B+" :
    total >= 80 ? "B" : total >= 70 ? "C" : total >= 60 ? "D" : "F";

  const label =
    total >= 95 ? "Send-ready" : total >= 90 ? "Market-ready" :
    total >= 85 ? "Strong — minor polish" : total >= 80 ? "Good — a few issues" :
    total >= 70 ? "Needs work" : total >= 60 ? "Significant issues" : "Not ready";

  const allFailed = dimensions.flatMap(d =>
    d.checks.filter(c => !c.passed && c.tip).map(c => c.tip!)
  );
  const topIssues = allFailed.slice(0, 3);

  const passCount = dimensions.flatMap(d => d.checks).filter(c => c.passed).length;
  const failCount = dimensions.flatMap(d => d.checks).filter(c => !c.passed).length;

  return { total, grade, label, dimensions, topIssues, passCount, failCount };
}

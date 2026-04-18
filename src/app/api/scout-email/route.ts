import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "";
  const domain = searchParams.get("domain") ?? "";
  const company = searchParams.get("company") ?? "";

  if (!name || !domain) {
    return NextResponse.json({ error: "name and domain are required" }, { status: 400 });
  }

  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  // ── 1. Try Hunter.io ──────────────────────────────────────────────────────
  const hunterKey = process.env.HUNTER_API_KEY;
  if (hunterKey) {
    try {
      const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${hunterKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.data?.email) {
        return NextResponse.json({
          email: data.data.email,
          confidence: data.data.score ?? null,
          verified: data.data.verification?.status === "valid",
          source: "Hunter.io",
        });
      }
    } catch {
      // fall through
    }
  }

  // ── 2. Try Apollo.io ──────────────────────────────────────────────────────
  const apolloKey = process.env.APOLLO_API_KEY;
  if (apolloKey) {
    try {
      const res = await fetch("https://api.apollo.io/v1/people/match", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apolloKey },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          organization_name: company,
          domain,
        }),
      });
      const data = await res.json();
      if (data?.person?.email) {
        return NextResponse.json({
          email: data.person.email,
          confidence: data.person.email_status === "verified" ? 95 : 70,
          verified: data.person.email_status === "verified",
          source: "Apollo.io",
          linkedIn: data.person.linkedin_url ?? null,
        });
      }
    } catch {
      // fall through
    }
  }

  // ── 3. Fallback: curated search links ────────────────────────────────────
  return NextResponse.json({
    email: null,
    source: "manual",
    searchUrls: {
      hunter: `https://hunter.io/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}`,
      apollo: `https://app.apollo.io/#/people?contactName=${encodeURIComponent(name)}&organizationName=${encodeURIComponent(company)}`,
      linkedin: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name + " " + company)}`,
      google: `https://www.google.com/search?q=%22${encodeURIComponent(name)}%22+%22${encodeURIComponent(domain)}%22+email`,
      rocketreach: `https://rocketreach.co/search?name=${encodeURIComponent(name)}&current_employer=${encodeURIComponent(company)}`,
    },
  });
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, GitMerge, ArrowRight, TrendingUp, Globe, AlertTriangle, BarChart2 } from "lucide-react";
import { loadPipeline } from "@/lib/pipeline";
import { PipelineDeal } from "@/lib/types";
import suppliersData from "@/data/suppliers.json";
import seekersData from "@/data/seekers.json";

export default function HomePage() {
  const [pipeline, setPipeline] = useState<PipelineDeal[]>([]);

  useEffect(() => {
    setPipeline(loadPipeline());
  }, []);

  const statusCounts = {
    active: pipeline.filter((d) => ["Matched", "Outreach Sent", "NDA", "Closing"].includes(d.status)).length,
    totalMW: pipeline.reduce((s, d) => s + d.mw, 0),
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">PowerMatch PPA Broker</h1>
        <p className="text-gray-400 mt-1">
          Matching stranded power capacity to high-density AI/HPC compute demand — 2026 AI boom context.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Guidance tool only. Verify all data/contacts/tariffs. Engage licensed attorneys & engineers.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600/20 p-2"><Users className="h-6 w-6 text-blue-400" /></div>
            <div>
              <h2 className="font-semibold text-white">Scout Seekers First</h2>
              <p className="text-sm text-gray-400">Start with demand, find matching suppliers</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">Browse hyperscalers & miners pivoting to AI, understand their MW needs and pain points, then auto-match to relevant suppliers.</p>
          <div className="flex gap-2">
            <Link href="/seekers"><Button className="gap-2"><Users className="h-4 w-4" />Browse Seekers<ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/matches?mode=seekers"><Button variant="outline" className="text-sm">Find Matches</Button></Link>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-600/20 p-2"><Zap className="h-6 w-6 text-yellow-400" /></div>
            <div>
              <h2 className="font-semibold text-white">Scout Suppliers First</h2>
              <p className="text-sm text-gray-400">Start with assets, find matching offtakers</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">Browse BTM gas, hydro, and curtailment suppliers with surplus capacity, understand monetization challenges, then match to seekers.</p>
          <div className="flex gap-2">
            <Link href="/suppliers"><Button variant="secondary" className="gap-2"><Zap className="h-4 w-4" />Browse Suppliers<ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/matches?mode=suppliers"><Button variant="outline" className="text-sm">Find Matches</Button></Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Zap className="h-5 w-5 text-yellow-400" />} label="Suppliers" value={suppliersData.length.toString()} sub={`${(suppliersData as {availableMW:number}[]).reduce((s,x)=>s+x.availableMW,0).toLocaleString()} MW tracked`} />
        <StatCard icon={<Users className="h-5 w-5 text-blue-400" />} label="Seekers" value={seekersData.length.toString()} sub={`${(seekersData as {neededMW:number}[]).reduce((s,x)=>s+x.neededMW,0).toLocaleString()} MW demand`} />
        <StatCard icon={<GitMerge className="h-5 w-5 text-green-400" />} label="Active Deals" value={statusCounts.active.toString()} sub="in pipeline" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-purple-400" />} label="Pipeline MW" value={statusCounts.totalMW > 0 ? `${statusCounts.totalMW} MW` : "—"} sub="total contracted" />
      </div>

      <div className="rounded-xl border border-blue-800/30 bg-blue-950/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white flex items-center gap-2"><BarChart2 className="h-4 w-4 text-blue-400" />Market Intelligence Available</p>
          <p className="text-xs text-gray-400 mt-0.5">PPA price index by region · public reference transactions · regulatory alert calendar · market thesis</p>
        </div>
        <Link href="/market"><Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">View Market Intel <ArrowRight className="h-3 w-3" /></Button></Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">2026 Market Context</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ContextCard icon={<Globe className="h-4 w-4 text-green-400" />} title="Paraguay / Ethiopia Hydro" body="Surplus hydro with AI/data center tariffs. ANDE (Paraguay) ~3.5¢, EEP Ethiopia ~3.2¢ off-peak. Fast licensing emerging." />
          <ContextCard icon={<Zap className="h-4 w-4 text-yellow-400" />} title="Permian & Bakken BTM Gas" body="EPA flaring regs tightening. BTM gas 2.8–4.5¢ effective. No ERCOT queue. Best fit for modular AI data centers co-located at wellhead." />
          <ContextCard icon={<TrendingUp className="h-4 w-4 text-blue-400" />} title="AI Power Demand Surge" body="Hyperscalers need 5–10 GW by 2027. MISO/PJM/ERCOT queues: 3–5 years. Miners pivoting to AI have existing infrastructure advantage." />
        </div>
      </div>

      {pipeline.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Recent Pipeline</h2>
            <Link href="/pipeline"><Button variant="ghost" size="sm" className="text-xs gap-1">View All<ArrowRight className="h-3 w-3" /></Button></Link>
          </div>
          <div className="space-y-2">
            {pipeline.slice(-3).reverse().map((deal) => (
              <div key={deal.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{deal.supplierName} → {deal.seekerName}</p>
                  <p className="text-xs text-gray-400">{deal.mw} MW @ {deal.centsPerKwh}¢/kWh</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(deal.status)}`}>{deal.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="rounded-lg bg-gray-800 p-2">{icon}</div>
        <div>
          <p className="text-xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label} · {sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ContextCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">{icon}{title}</CardTitle></CardHeader>
      <CardContent><p className="text-xs text-gray-400 leading-relaxed">{body}</p></CardContent>
    </Card>
  );
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    Sourced: "bg-gray-700 text-gray-300", Matched: "bg-blue-900 text-blue-300",
    "Outreach Sent": "bg-yellow-900 text-yellow-300", NDA: "bg-purple-900 text-purple-300",
    Closing: "bg-green-900 text-green-300",
  };
  return map[status] ?? "bg-gray-700 text-gray-300";
}

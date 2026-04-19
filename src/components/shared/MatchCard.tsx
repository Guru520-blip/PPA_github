"use client";
import { MatchResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, TrendingUp, DollarSign, Info } from "lucide-react";
import { addDeal, dealValueM, brokerFeeM } from "@/lib/pipeline";

interface Props {
  match: MatchResult;
  onDealCreated?: (dealId: string) => void;
  onOutreach?: () => void;
}

function scoreColor(score: number) {
  if (score >= 75) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function scoreBg(score: number) {
  if (score >= 75) return "border-green-700/40 bg-green-950/20";
  if (score >= 50) return "border-yellow-700/40 bg-yellow-950/20";
  return "border-red-700/30 bg-red-950/10";
}

export function MatchCard({ match, onDealCreated, onOutreach }: Props) {
  const { supplier, seeker, score, regionMatch, mwFit, priceAlignment, reasons, suggestedPriceCents, priceRationale } = match;

  const handleCreateDeal = () => {
    const deal = addDeal({
      supplierId: supplier.id,
      seekerId: seeker.id,
      supplierName: supplier.name,
      seekerName: seeker.name,
      status: "Matched",
      notes: `Auto-matched. Score: ${score}/100. Suggested price: ${suggestedPriceCents}¢/kWh. ${reasons[0] ?? ""}`,
      mw: Math.min(supplier.availableMW, seeker.neededMW),
      centsPerKwh: suggestedPriceCents,
    });
    onDealCreated?.(deal.id);
  };

  return (
    <Card className={`border ${scoreBg(score)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm leading-tight truncate">{supplier.name}</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5 truncate">→ {seeker.name}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
            <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Asset summary */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{supplier.availableMW} MW</span>
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{supplier.estimatedAllInCents}¢ base</span>
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{supplier.region}</span>
          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{supplier.type}</span>
        </div>

        {/* Dynamic price recommendation + deal value */}
        <div className="rounded-md bg-blue-950/30 border border-blue-800/40 p-2.5 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-blue-300">
                {suggestedPriceCents}¢/kWh — {seeker.type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-purple-300 font-mono">${dealValueM(Math.min(supplier.availableMW, seeker.neededMW), suggestedPriceCents, 10).toFixed(0)}M deal</span>
              <span className="text-yellow-400 font-mono">${brokerFeeM(Math.min(supplier.availableMW, seeker.neededMW), suggestedPriceCents, 10).toFixed(1)}M fee</span>
            </div>
          </div>
          <p className="text-[10px] text-blue-400/80 leading-relaxed">{priceRationale}</p>
        </div>

        {/* Match criteria */}
        <div className="flex gap-3 text-xs">
          <Criterion label="Region" ok={regionMatch} />
          <Criterion label="MW Fit" ok={mwFit} />
          <Criterion label="Price OK" ok={priceAlignment} />
        </div>

        {/* Reasons */}
        {reasons.length > 0 && (
          <ul className="space-y-0.5">
            {reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                <Info className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />{r}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={handleCreateDeal} variant="success" className="text-xs flex-1">
            Create Deal
          </Button>
          {onOutreach && (
            <Button size="sm" variant="outline" onClick={onOutreach} className="text-xs flex-1">
              Outreach
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Criterion({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${ok ? "text-green-400" : "text-gray-500"}`}>
      {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

"use client";
import { MatchResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { addDeal } from "@/lib/pipeline";

interface Props {
  match: MatchResult;
  onDealCreated?: (dealId: string) => void;
  onOutreach?: () => void;
}

function scoreColor(score: number) {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-500";
}

export function MatchCard({ match, onDealCreated, onOutreach }: Props) {
  const { supplier, seeker, score, regionMatch, mwFit, priceAlignment, reasons } = match;

  const handleCreateDeal = () => {
    const deal = addDeal({
      supplierId: supplier.id,
      seekerId: seeker.id,
      supplierName: supplier.name,
      seekerName: seeker.name,
      status: "Matched",
      notes: `Auto-matched. Score: ${score}. ${reasons[0] ?? ""}`,
      mw: Math.min(supplier.availableMW, seeker.neededMW),
      centsPerKwh: supplier.estimatedAllInCents,
    });
    onDealCreated?.(deal.id);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm">{supplier.name}</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">→ {seeker.name}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className={`text-xl font-bold ${scoreColor(score)}`}>{score}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {supplier.availableMW} MW @ {supplier.estimatedAllInCents}¢/kWh
          </span>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {supplier.region}
          </span>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {supplier.type}
          </span>
        </div>
        <div className="flex gap-3 text-xs">
          <Criterion label="Region" ok={regionMatch} />
          <Criterion label="MW Fit" ok={mwFit} />
          <Criterion label="Price ≤5¢" ok={priceAlignment} />
        </div>
        {reasons.length > 0 && (
          <ul className="space-y-0.5">
            {reasons.map((r, i) => (
              <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                <span className="text-green-500 shrink-0">✓</span>{r}
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
              Generate Outreach
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Criterion({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`flex items-center gap-1 ${ok ? "text-green-600" : "text-gray-400"}`}>
      {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

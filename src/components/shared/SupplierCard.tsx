"use client";
import { Supplier } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, DollarSign, Mail, Phone, Globe, AlertTriangle, UserCircle, ExternalLink, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopMatch { id: number; name: string; score: number; type: string }

interface Props {
  supplier: Supplier;
  onGenerateOutreach?: () => void;
  onMatch?: () => void;
  compact?: boolean;
  topMatches?: TopMatch[];
}

function typeBadgeVariant(type: string) {
  if (type.includes("Hydro")) return "success" as const;
  if (type.includes("BTM") || type.includes("Gas")) return "warning" as const;
  if (type.includes("Curtailment")) return "secondary" as const;
  return "default" as const;
}

function urgencyLabel(score: number) {
  if (score >= 9) return { label: "Critical Urgency", cls: "text-red-400 border-red-800/60 bg-red-950/30" };
  if (score >= 7) return { label: "High Urgency", cls: "text-orange-400 border-orange-800/60 bg-orange-950/30" };
  if (score >= 5) return { label: "Moderate", cls: "text-yellow-400 border-yellow-800/60 bg-yellow-950/30" };
  return { label: "Low Urgency", cls: "text-gray-500 border-gray-700/50 bg-gray-900/30" };
}

export function SupplierCard({ supplier, onGenerateOutreach, onMatch, compact, topMatches }: Props) {
  const router = useRouter();
  const urgency = urgencyLabel(supplier.urgencyScore);
  const engagementPct = Math.round((supplier.urgencyScore * 0.6 + supplier.startupFriendly * 0.4) * 10);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{supplier.name}</CardTitle>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={typeBadgeVariant(supplier.type)} className="text-[10px]">
              {supplier.type}
            </Badge>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${urgency.cls}`}>
              <Flame className="h-2.5 w-2.5 inline mr-0.5" />{urgency.label} · {engagementPct}%
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{supplier.region}</span>
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{supplier.availableMW} MW</span>
          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{supplier.estimatedAllInCents}¢/kWh</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{supplier.keyPain.split(";")[0]}</p>
        </div>

        {!compact && supplier.keyContact && (
          <div className="flex items-start gap-2 rounded-md bg-gray-800/50 p-2">
            <UserCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-white leading-tight">{supplier.keyContact}</p>
              {supplier.keyContactLinkedIn && (
                <a href={supplier.keyContactLinkedIn} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5">
                  LinkedIn <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {!compact && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{supplier.notes}</p>
        )}

        {!compact && (supplier.permitStatus || supplier.noInterconnectionQueue || supplier.estimatedMonthsToEnergization) && (
          <div className="flex flex-wrap gap-1 text-[10px]">
            {supplier.permitStatus === "Confirmed" && (
              <span className="px-1.5 py-0.5 rounded border border-green-700/50 bg-green-950/30 text-green-400">Permits verified</span>
            )}
            {supplier.permitStatus === "Seller-stated" && (
              <span className="px-1.5 py-0.5 rounded border border-yellow-700/50 bg-yellow-950/30 text-yellow-400">Permits: seller-stated</span>
            )}
            {supplier.permitStatus === "Not verified" && (
              <span className="px-1.5 py-0.5 rounded border border-gray-700/50 bg-gray-900 text-gray-500">Permits: not verified</span>
            )}
            {supplier.noInterconnectionQueue && (
              <span className="px-1.5 py-0.5 rounded border border-blue-700/50 bg-blue-950/30 text-blue-400">No queue</span>
            )}
            {supplier.estimatedMonthsToEnergization && (
              <span className="px-1.5 py-0.5 rounded border border-orange-700/50 bg-orange-950/30 text-orange-400">
                ~{supplier.estimatedMonthsToEnergization}–{supplier.estimatedMonthsToEnergization + 6}mo
              </span>
            )}
          </div>
        )}

        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 shrink-0" />
            <a href={`mailto:${supplier.contactEmail}`} className="hover:text-blue-400 truncate">{supplier.contactEmail}</a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 shrink-0" />{supplier.contactPhone}
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3 shrink-0" />
            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
              {supplier.website}
            </a>
          </div>
          {supplier.contactForm && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3 w-3 shrink-0" />
              <a href={supplier.contactForm} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate text-[10px]">
                Official Contact Form
              </a>
            </div>
          )}
        </div>

        {topMatches && topMatches.length > 0 && (
          <div className="border-t border-gray-700/40 pt-2 mt-auto">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5 font-medium">Probable Buyers (Match Score)</p>
            <div className="space-y-1">
              {topMatches.slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 truncate pr-2">{m.name}</span>
                  <span className={`font-bold shrink-0 tabular-nums ${m.score >= 75 ? "text-green-400" : m.score >= 50 ? "text-yellow-400" : "text-orange-400"}`}>
                    {m.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {onMatch && (
            <Button size="sm" variant="outline" onClick={onMatch} className="flex-1 text-xs">Find Seekers</Button>
          )}
          {onGenerateOutreach && (
            <Button size="sm" onClick={onGenerateOutreach} className="flex-1 text-xs">Outreach</Button>
          )}
          {!onMatch && !onGenerateOutreach && (
            <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/matches?supplierId=${supplier.id}`)}>
              Match Engine
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";
import { Seeker, BUYER_PRICING } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, Mail, Phone, Globe, AlertTriangle, UserCircle, ExternalLink, DollarSign, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopMatch { id: number; name: string; score: number; type: string }

interface Props {
  seeker: Seeker;
  onGenerateOutreach?: () => void;
  onMatch?: () => void;
  compact?: boolean;
  topMatches?: TopMatch[];
}

function typeBadgeVariant(type: string) {
  if (type.includes("Hyperscaler")) return "default" as const;
  if (type.includes("Miner")) return "warning" as const;
  if (type.includes("Hybrid")) return "secondary" as const;
  return "secondary" as const;
}

function urgencyLabel(score: number) {
  if (score >= 9) return { label: "Critical Urgency", cls: "text-red-400 border-red-800/60 bg-red-950/30" };
  if (score >= 7) return { label: "High Urgency", cls: "text-orange-400 border-orange-800/60 bg-orange-950/30" };
  if (score >= 5) return { label: "Moderate", cls: "text-yellow-400 border-yellow-800/60 bg-yellow-950/30" };
  return { label: "Low Urgency", cls: "text-gray-500 border-gray-700/50 bg-gray-900/30" };
}

export function SeekerCard({ seeker, onGenerateOutreach, onMatch, compact, topMatches }: Props) {
  const router = useRouter();
  const profile = BUYER_PRICING[seeker.type];
  const urgency = urgencyLabel(seeker.urgencyScore);
  const engagementPct = Math.round((seeker.urgencyScore * 0.6 + seeker.startupFriendly * 0.4) * 10);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{seeker.name}</CardTitle>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={typeBadgeVariant(seeker.type)} className="text-[10px]">
              {seeker.type}
            </Badge>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${urgency.cls}`}>
              <Flame className="h-2.5 w-2.5 inline mr-0.5" />{urgency.label} · {engagementPct}%
            </span>
            {seeker.newBrokerFit !== undefined && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${
                seeker.newBrokerFit >= 8 ? "text-green-400 border-green-700/50 bg-green-950/30"
                : seeker.newBrokerFit >= 6 ? "text-yellow-400 border-yellow-700/50 bg-yellow-950/30"
                : "text-gray-500 border-gray-700/50 bg-gray-900/30"
              }`} title="Likelihood this company engages a new/boutique broker (1-10)">
                Broker fit: {seeker.newBrokerFit}/10
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{seeker.neededMW} MW needed</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{seeker.preferredRegions.slice(0, 2).join(", ")}{seeker.preferredRegions.length > 2 ? ` +${seeker.preferredRegions.length - 2}` : ""}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-900/20 p-2">
          <AlertTriangle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{seeker.keyPain.split(";")[0]}</p>
        </div>

        {profile && (
          <div className="flex items-center gap-2 rounded-md bg-gray-800/50 p-2">
            <DollarSign className="h-3.5 w-3.5 text-green-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-300 font-medium">{profile.label}: {profile.minCents}–{profile.maxCents}¢/kWh range</p>
              <p className="text-[10px] text-gray-500">{profile.rationale.split(".")[0]}.</p>
            </div>
          </div>
        )}

        {!compact && seeker.keyContact && (
          <div className="flex items-start gap-2 rounded-md bg-gray-800/50 p-2">
            <UserCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-white leading-tight">{seeker.keyContact}</p>
              {seeker.keyContactLinkedIn && (
                <a href={seeker.keyContactLinkedIn} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5">
                  LinkedIn <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {seeker.keyContact2 && (
                <p className="text-[10px] text-gray-400 mt-0.5">{seeker.keyContact2}</p>
              )}
            </div>
          </div>
        )}

        {!compact && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{seeker.notes}</p>
        )}

        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 shrink-0" />
            <a href={`mailto:${seeker.contactEmail}`} className="hover:text-blue-400 truncate">{seeker.contactEmail}</a>
          </div>
          {seeker.contactEmailBD && seeker.contactEmailBD !== seeker.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 shrink-0 opacity-50" />
              <a href={`mailto:${seeker.contactEmailBD}`} className="hover:text-blue-400 truncate text-[10px]">{seeker.contactEmailBD} (BD)</a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 shrink-0" />{seeker.contactPhone}
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3 shrink-0" />
            <a href={seeker.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
              {seeker.website}
            </a>
          </div>
          {seeker.contactForm && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3 w-3 shrink-0" />
              <a href={seeker.contactForm} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate text-[10px]">
                Partnership Inquiry Form
              </a>
            </div>
          )}
        </div>

        {topMatches && topMatches.length > 0 && (
          <div className="border-t border-gray-700/40 pt-2 mt-auto">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5 font-medium">Probable Power Sources (Match Score)</p>
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
            <Button size="sm" variant="outline" onClick={onMatch} className="flex-1 text-xs">Find Suppliers</Button>
          )}
          {onGenerateOutreach && (
            <Button size="sm" onClick={onGenerateOutreach} className="flex-1 text-xs">Outreach</Button>
          )}
          {!onMatch && !onGenerateOutreach && (
            <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/matches?seekerId=${seeker.id}`)}>
              Match Engine
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";
import { Seeker } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, Mail, Phone, Globe, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  seeker: Seeker;
  onGenerateOutreach?: () => void;
  onMatch?: () => void;
  compact?: boolean;
}

function typeBadgeVariant(type: string) {
  if (type.includes("Hyperscaler")) return "default" as const;
  if (type.includes("Miner")) return "warning" as const;
  if (type.includes("Hybrid")) return "secondary" as const;
  return "secondary" as const;
}

export function SeekerCard({ seeker, onGenerateOutreach, onMatch, compact }: Props) {
  const router = useRouter();
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{seeker.name}</CardTitle>
          <Badge variant={typeBadgeVariant(seeker.type)} className="shrink-0 text-[10px]">
            {seeker.type}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{seeker.neededMW} MW needed</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{seeker.preferredRegions.slice(0, 2).join(", ")}{seeker.preferredRegions.length > 2 ? ` +${seeker.preferredRegions.length - 2}` : ""}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-900/20 p-2">
          <AlertTriangle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300">{seeker.keyPain}</p>
        </div>
        {!compact && (
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{seeker.notes}</p>
        )}
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{seeker.contactEmail}</div>
          <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{seeker.contactPhone}</div>
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            <a href={seeker.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
              {seeker.website}
            </a>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          {onMatch && (
            <Button size="sm" variant="outline" onClick={onMatch} className="flex-1 text-xs">
              Find Suppliers
            </Button>
          )}
          {onGenerateOutreach && (
            <Button size="sm" onClick={onGenerateOutreach} className="flex-1 text-xs">
              Outreach
            </Button>
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

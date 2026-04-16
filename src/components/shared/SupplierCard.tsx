"use client";
import { Supplier } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, DollarSign, Mail, Phone, Globe, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  supplier: Supplier;
  onGenerateOutreach?: () => void;
  onMatch?: () => void;
  compact?: boolean;
}

function typeBadgeVariant(type: string) {
  if (type.includes("Hydro")) return "success" as const;
  if (type.includes("BTM") || type.includes("Gas")) return "warning" as const;
  if (type.includes("Curtailment")) return "secondary" as const;
  return "default" as const;
}

export function SupplierCard({ supplier, onGenerateOutreach, onMatch, compact }: Props) {
  const router = useRouter();
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{supplier.name}</CardTitle>
          <Badge variant={typeBadgeVariant(supplier.type)} className="shrink-0 text-[10px]">
            {supplier.type}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{supplier.region}</span>
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{supplier.availableMW} MW</span>
          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{supplier.estimatedAllInCents}¢/kWh</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">{supplier.keyPain}</p>
        </div>
        {!compact && (
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{supplier.notes}</p>
        )}
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{supplier.contactEmail}</div>
          <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{supplier.contactPhone}</div>
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
              {supplier.website}
            </a>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          {onMatch && (
            <Button size="sm" variant="outline" onClick={onMatch} className="flex-1 text-xs">
              Find Seekers
            </Button>
          )}
          {onGenerateOutreach && (
            <Button size="sm" onClick={onGenerateOutreach} className="flex-1 text-xs">
              Outreach
            </Button>
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

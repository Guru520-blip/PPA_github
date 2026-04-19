"use client";
import { useState, useEffect } from "react";
import { CheckSquare, Square, ChevronDown, ChevronRight, ClipboardList } from "lucide-react";
import { DILIGENCE_CHECKLIST, toggleItem, getDealDiligence, diligenceProgress } from "@/lib/diligence";

export function DiligenceChecklist({ dealId }: { dealId: string }) {
  const [state, setState] = useState<Record<string, boolean>>({});
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({ Legal: true, Commercial: true });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setState(getDealDiligence(dealId)); }, [dealId]);

  function toggle(itemId: string) {
    const next = toggleItem(dealId, itemId);
    setState({ ...next });
  }

  const { done, total, pct } = diligenceProgress(dealId);
  const categories = Array.from(new Set(DILIGENCE_CHECKLIST.map(i => i.category)));

  return (
    <div className="mt-2 border-t border-orange-800/30 pt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-[10px] text-orange-400 hover:text-orange-300 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <ClipboardList className="h-3 w-3" />
          Due Diligence — {done}/{total} complete
        </span>
        <span className="flex items-center gap-1">
          <span className={`font-mono ${pct === 100 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-orange-400"}`}>{pct}%</span>
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </span>
      </button>

      <div className="mt-1.5 h-1 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-orange-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {expanded && (
        <div className="mt-2 space-y-2">
          {categories.map(cat => {
            const items = DILIGENCE_CHECKLIST.filter(i => i.category === cat);
            const catDone = items.filter(i => state[i.id]).length;
            const catOpen = openCats[cat] ?? false;
            return (
              <div key={cat}>
                <button
                  onClick={() => setOpenCats(prev => ({ ...prev, [cat]: !catOpen }))}
                  className="flex items-center gap-1 text-[9px] font-semibold text-gray-400 uppercase tracking-wider w-full hover:text-gray-300"
                >
                  {catOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                  {cat} · {catDone}/{items.length}
                </button>
                {catOpen && (
                  <div className="mt-0.5 space-y-0.5 pl-3">
                    {items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        className="flex items-start gap-1.5 w-full text-left group"
                      >
                        {state[item.id]
                          ? <CheckSquare className="h-3 w-3 text-green-400 shrink-0 mt-0.5" />
                          : <Square className="h-3 w-3 text-gray-600 shrink-0 mt-0.5 group-hover:text-gray-400 transition-colors" />}
                        <span className={`text-[10px] leading-tight ${state[item.id] ? "text-gray-600 line-through" : "text-gray-300"}`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

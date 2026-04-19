"use client";
import { useState, useEffect } from "react";
import { PipelineDeal, DealStatus } from "@/lib/types";
import { loadPipeline, updateDeal, removeDeal, DEAL_STATUSES, STAGE_PROBABILITY, dealValueM, brokerFeeM } from "@/lib/pipeline";
import { exportPipelineCSV } from "@/lib/diligence";
import { DiligenceChecklist } from "@/components/shared/DiligenceChecklist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Trash2, StickyNote, ChevronRight, TrendingUp, DollarSign, Download } from "lucide-react";
import { Toast, useToast } from "@/components/ui/toast";

const STATUS_COLORS: Record<DealStatus, string> = {
  Sourced: "border-gray-600 bg-gray-900",
  Matched: "border-blue-600/50 bg-blue-950/20",
  "Outreach Sent": "border-yellow-600/50 bg-yellow-950/20",
  NDA: "border-purple-600/50 bg-purple-950/20",
  Diligence: "border-orange-600/50 bg-orange-950/20",
  Closing: "border-green-600/50 bg-green-950/20",
};

const STATUS_HEADER_COLORS: Record<DealStatus, string> = {
  Sourced: "bg-gray-800 text-gray-300",
  Matched: "bg-blue-900/60 text-blue-300",
  "Outreach Sent": "bg-yellow-900/60 text-yellow-300",
  NDA: "bg-purple-900/60 text-purple-300",
  Diligence: "bg-orange-900/60 text-orange-300",
  Closing: "bg-green-900/60 text-green-300",
};

export default function PipelinePage() {
  const [deals, setDeals] = useState<PipelineDeal[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const { toast, show, dismiss } = useToast();

  useEffect(() => { setDeals(loadPipeline()); }, []);

  function refresh() { setDeals(loadPipeline()); }

  function handleStatusChange(id: string, status: DealStatus) {
    updateDeal(id, { status });
    refresh();
    show(`Status updated to "${status}"`, "success");
  }

  function handleRemove(id: string) {
    if (!confirm("Remove this deal from pipeline?")) return;
    removeDeal(id);
    refresh();
    show("Deal removed", "info");
  }

  function handleSaveNote(id: string) {
    updateDeal(id, { notes: noteText });
    setEditingNote(null);
    refresh();
    show("Note saved", "success");
  }

  const byStatus = DEAL_STATUSES.reduce((acc, s) => {
    acc[s] = deals.filter((d) => d.status === s);
    return acc;
  }, {} as Record<DealStatus, PipelineDeal[]>);

  const totalMW = deals.reduce((s, d) => s + d.mw, 0);
  const closingMW = deals.filter((d) => d.status === "Closing").reduce((s, d) => s + d.mw, 0);
  const totalPipelineValueM = deals.reduce((s, d) => s + dealValueM(d.mw, d.centsPerKwh, d.contractYears ?? 10), 0);
  const weightedForecastM = deals.reduce((s, d) => {
    const prob = d.probability ?? STAGE_PROBABILITY[d.status] ?? 10;
    return s + (brokerFeeM(d.mw, d.centsPerKwh, d.contractYears ?? 10, d.brokerFeePct ?? 2) * prob) / 100;
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Briefcase className="h-6 w-6" />Pipeline Tracker</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track deals from sourced to closing. Stored locally in your browser.</p>
        </div>
        {deals.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => exportPipelineCSV(deals, dealValueM, brokerFeeM, (s) => STAGE_PROBABILITY[s as DealStatus] ?? 10)} className="gap-1.5 text-xs shrink-0">
            <Download className="h-3.5 w-3.5" />Export CSV
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {DEAL_STATUSES.map((status) => (
          <div key={status} className={`rounded-lg border p-3 ${STATUS_COLORS[status]}`}>
            <p className="text-xs text-gray-400">{status}</p>
            <p className="text-2xl font-bold text-white">{byStatus[status].length}</p>
            <p className="text-xs text-gray-500">{byStatus[status].reduce((s, d) => s + d.mw, 0)} MW</p>
          </div>
        ))}
      </div>

      {deals.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
          <Briefcase className="h-12 w-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No deals in pipeline yet.</p>
          <p className="text-gray-600 text-xs mt-1">Use the Match Engine to create deals, or go to Suppliers/Seekers to start matching.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-t border-gray-800 pt-4">
            <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-blue-400" />{deals.length} deals · {totalMW} MW</span>
            <span className="flex items-center gap-1.5 text-green-400"><TrendingUp className="h-4 w-4" />{closingMW} MW in closing</span>
            <span className="flex items-center gap-1.5 text-purple-300"><DollarSign className="h-4 w-4" />Pipeline value: ${totalPipelineValueM.toFixed(0)}M (10-yr contracts)</span>
            <span className="flex items-center gap-1.5 text-yellow-400"><DollarSign className="h-4 w-4" />Probability-wtd broker forecast: ${weightedForecastM.toFixed(1)}M</span>
          </div>

          {/* Kanban */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {DEAL_STATUSES.map((status) => (
              <div key={status} className="space-y-2">
                <div className={`rounded-md px-3 py-1.5 text-xs font-semibold ${STATUS_HEADER_COLORS[status]}`}>
                  {status} ({byStatus[status].length})
                </div>
                {byStatus[status].map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isEditingNote={editingNote === deal.id}
                    noteText={noteText}
                    onStatusChange={(s) => handleStatusChange(deal.id, s)}
                    onRemove={() => handleRemove(deal.id)}
                    onEditNote={() => { setEditingNote(deal.id); setNoteText(deal.notes); }}
                    onSaveNote={() => handleSaveNote(deal.id)}
                    onNoteChange={setNoteText}
                    onCancelNote={() => setEditingNote(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface DealCardProps {
  deal: PipelineDeal;
  isEditingNote: boolean;
  noteText: string;
  onStatusChange: (s: DealStatus) => void;
  onRemove: () => void;
  onEditNote: () => void;
  onSaveNote: () => void;
  onNoteChange: (v: string) => void;
  onCancelNote: () => void;
}

function DealCard({ deal, isEditingNote, noteText, onStatusChange, onRemove, onEditNote, onSaveNote, onNoteChange, onCancelNote }: DealCardProps) {
  const currentIdx = DEAL_STATUSES.indexOf(deal.status);
  const nextStatus = DEAL_STATUSES[currentIdx + 1] as DealStatus | undefined;

  return (
    <Card className={`border ${STATUS_COLORS[deal.status]}`}>
      <CardContent className="p-3 space-y-2">
        <div>
          <p className="text-xs font-semibold text-white leading-tight">{deal.supplierName.split("–")[0].trim()}</p>
          <p className="text-[10px] text-gray-400">→ {deal.seekerName.split("–")[0].trim()}</p>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-gray-400">
          <span>{deal.mw} MW · {deal.centsPerKwh}¢/kWh</span>
          <span className="text-purple-400">${dealValueM(deal.mw, deal.centsPerKwh, deal.contractYears ?? 10).toFixed(0)}M</span>
          <span className={`font-semibold ${(deal.probability ?? STAGE_PROBABILITY[deal.status]) >= 70 ? "text-green-400" : (deal.probability ?? STAGE_PROBABILITY[deal.status]) >= 40 ? "text-yellow-400" : "text-gray-500"}`}>
            {deal.probability ?? STAGE_PROBABILITY[deal.status]}% close
          </span>
        </div>
        {deal.nextAction && (
          <p className="text-[9px] text-blue-400 flex items-center gap-1">
            <ChevronRight className="h-2.5 w-2.5 shrink-0" />Next: {deal.nextAction}
          </p>
        )}

        {isEditingNote ? (
          <div className="space-y-1">
            <textarea
              value={noteText}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full h-20 bg-gray-800 text-xs text-white rounded p-1.5 border border-gray-700 resize-none outline-none"
              placeholder="Add notes..."
            />
            <div className="flex gap-1">
              <Button size="sm" className="text-[10px] h-6 flex-1" onClick={onSaveNote}>Save</Button>
              <Button size="sm" variant="ghost" className="text-[10px] h-6" onClick={onCancelNote}>Cancel</Button>
            </div>
          </div>
        ) : (
          deal.notes && <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{deal.notes}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1">
            <button onClick={onEditNote} className="text-gray-600 hover:text-gray-300 transition-colors" title="Edit note">
              <StickyNote className="h-3.5 w-3.5" />
            </button>
            <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors" title="Remove deal">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {nextStatus && (
            <button
              onClick={() => onStatusChange(nextStatus)}
              className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-white transition-colors"
              title={`Move to ${nextStatus}`}
            >
              {nextStatus} <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {deal.status === "Diligence" && <DiligenceChecklist dealId={deal.id} />}

        <select
          value={deal.status}
          onChange={(e) => onStatusChange(e.target.value as DealStatus)}
          className="w-full bg-gray-800 text-[10px] text-white rounded px-1.5 py-1 border border-gray-700 outline-none"
        >
          {DEAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </CardContent>
    </Card>
  );
}

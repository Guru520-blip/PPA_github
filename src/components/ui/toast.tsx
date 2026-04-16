"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-lg px-5 py-3 shadow-xl text-sm font-medium text-white transition-all animate-in slide-in-from-bottom-2",
        type === "success" && "bg-green-600",
        type === "error" && "bg-red-600",
        type === "info" && "bg-blue-600"
      )}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const show = React.useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  }, []);
  const dismiss = React.useCallback(() => setToast(null), []);
  return { toast, show, dismiss };
}

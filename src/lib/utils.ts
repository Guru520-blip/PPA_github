import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMW(mw: number): string {
  return mw >= 1000 ? `${(mw / 1000).toFixed(1)} GW` : `${mw} MW`;
}

export function formatCents(cents: number): string {
  return `${cents}¢/kWh`;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

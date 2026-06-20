import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    active: "bg-success-bg text-success",
    pending: "bg-warning-bg text-warning",
    suspended: "bg-danger-bg text-danger",
    PLACED: "bg-warning-bg text-warning",
    CONFIRMED: "bg-info-bg text-info",
    SHIPPED: "bg-info-bg text-info",
    DELIVERED: "bg-success-bg text-success",
    CANCELLED: "bg-danger-bg text-danger",
    open: "bg-warning-bg text-warning",
    in_progress: "bg-info-bg text-info",
    resolved: "bg-success-bg text-success",
    draft: "bg-paper-2 text-slate",
    low: "bg-paper-2 text-slate",
    medium: "bg-warning-bg text-warning",
    high: "bg-danger-bg text-danger",
  };
  return map[status] ?? "bg-paper-2 text-slate";
}

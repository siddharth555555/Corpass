import { cn } from "@/lib/admin-utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, subtext, accent, className }: StatCardProps) {
  return (
    <div className={cn("bg-paper border border-border rounded py-5 px-6 relative overflow-hidden card-hover", className)}>
      <h3 className="section-label mb-2">{label}</h3>
      <p className="text-3xl font-semibold text-ink">{value}</p>
      {subtext && <p className="text-xs text-slate mt-1">{subtext}</p>}
      {accent && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand" />}
    </div>
  );
}

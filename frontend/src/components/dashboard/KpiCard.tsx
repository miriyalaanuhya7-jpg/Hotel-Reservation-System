import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type KpiCardProps = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: LucideIcon;
  accent: string;
};

export function KpiCard({
  label,
  value,
  helper,
  trend,
  icon: Icon,
  accent,
}: KpiCardProps) {
  const positive = !trend.startsWith("-");
  return (
    <div className="kpi-card">
      <div className="kpi-topline">
        <span className="kpi-label">{label}</span>
        <span
          className="kpi-icon"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon size={17} />
        </span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-meta">
        <span className={positive ? "trend-up" : "trend-down"}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </span>
        <span>{helper}</span>
      </div>
    </div>
  );
}

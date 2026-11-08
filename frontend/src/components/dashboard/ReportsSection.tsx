import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DashboardSummary } from "@/types/hotel";
import { currency } from "@/types/hotel";

export type ReportsSectionProps = {
  summary: DashboardSummary;
  onToast: (message: string) => void;
};

const revenueBars = [
  { height: 48, label: "Sep 1" },
  { height: 62, label: "" },
  { height: 58, label: "" },
  { height: 74, label: "Sep 4" },
  { height: 69, label: "" },
  { height: 87, label: "" },
  { height: 79, label: "Sep 7" },
  { height: 94, label: "" },
  { height: 82, label: "" },
  { height: 100, label: "Sep 10" },
  { height: 91, label: "" },
  { height: 96, label: "Today" },
];

export function ReportsSection({ summary, onToast }: ReportsSectionProps) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("September 2026");

  const periods = [
    { label: "September 2026", trend: "+16.1%" },
    { label: "August 2026", trend: "+12.4%" },
    { label: "Q3 2026", trend: "+14.8%" },
    { label: "Year to date", trend: "+18.2%" },
  ];

  return (
    <section className="section-page">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Business intelligence</p>
          <h2>Performance reports</h2>
          <p className="muted">
            A calm, clear view of the numbers that matter.
          </p>
        </div>
        <div className="action-menu-wrap">
          <button
            className="filter-button"
            onClick={() => setPeriodOpen(open => !open)}
            aria-label="Select report period"
          >
            {selectedPeriod} <ChevronDown size={14} />
          </button>
          {periodOpen && (
            <div className="action-menu">
              <strong>Report timeframe</strong>
              {periods.map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSelectedPeriod(item.label);
                    setPeriodOpen(false);
                    onToast(`Report updated to ${item.label}`);
                  }}
                  style={{
                    fontWeight: selectedPeriod === item.label ? 700 : 500,
                    background:
                      selectedPeriod === item.label ? "#f0f4ee" : "transparent",
                  }}
                >
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <small style={{ color: "#427658", fontWeight: 700 }}>
                    {item.trend}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="report-grid">
        <div className="panel report-chart">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Revenue trend</p>
              <h3>
                {currency(summary.revenue)}{" "}
                <span className="chart-trend">+16.1%</span>
              </h3>
            </div>
          </div>
          <div className="bars">
            {revenueBars.map((bar, index) => (
              <div className="bar-col" key={index}>
                <span style={{ height: `${bar.height}%` }} />
                <small>{bar.label}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="panel channel-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Booking mix</p>
              <h3>Channel performance</h3>
            </div>
          </div>
          <div className="channel-list">
            <div>
              <span>
                <i className="channel-direct" />
                Direct
              </span>
              <strong>46%</strong>
            </div>
            <div>
              <span>
                <i className="channel-booking" />
                Booking.com
              </span>
              <strong>29%</strong>
            </div>
            <div>
              <span>
                <i className="channel-expedia" />
                Expedia
              </span>
              <strong>17%</strong>
            </div>
            <div>
              <span>
                <i className="channel-other" />
                Other
              </span>
              <strong>8%</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

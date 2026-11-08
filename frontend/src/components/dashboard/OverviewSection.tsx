import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  MoreHorizontal,
  Plus,
  Sparkles,
  Wrench,
} from "lucide-react";
import type {
  DashboardSummary,
  Reservation,
  ReservationStatus,
  Section,
} from "@/types/hotel";
import { currency } from "@/types/hotel";
import { KpiCard } from "./KpiCard";
import { ReservationTable } from "./ReservationTable";

export type OverviewSectionProps = {
  summary: DashboardSummary;
  reservations: Reservation[];
  onOpenNewReservation: () => void;
  onEditReservation: (reservation: Reservation) => void;
  onStatusChange: (reservation: Reservation, status: ReservationStatus) => void;
  onSelectSection: (section: Section) => void;
  onToast: (message: string) => void;
};

export function OverviewSection({
  summary,
  reservations,
  onOpenNewReservation,
  onEditReservation,
  onStatusChange,
  onSelectSection,
  onToast,
}: OverviewSectionProps) {
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState("This month");

  const rangeOptions = ["This month", "This week", "Today"];

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow accent-eyebrow">Saturday rhythm</p>
          <h2>Your property at a glance.</h2>
          <p className="muted">
            A clear view of today's arrivals, room flow, and guest experience.
          </p>
        </div>
        <button className="button-primary" onClick={onOpenNewReservation}>
          <Plus size={16} />
          New reservation
        </button>
      </section>

      <section className="kpi-grid">
        <KpiCard
          label="Occupancy"
          value={`${summary.occupancy}%`}
          helper="vs. 74% last week"
          trend="4.2%"
          icon={BedDouble}
          accent="#bf7558"
        />
        <KpiCard
          label="Today's arrivals"
          value={String(summary.arrivals).padStart(2, "0")}
          helper="3 VIP guests"
          trend="2"
          icon={CalendarDays}
          accent="#5e877e"
        />
        <KpiCard
          label="Today's departures"
          value={String(summary.departures).padStart(2, "0")}
          helper="Rooms to turn"
          trend="-1"
          icon={ArrowDownRight}
          accent="#c49a56"
        />
        <KpiCard
          label="Revenue this month"
          value={currency(summary.revenue)}
          helper={`vs. ${currency(21440)} last month`}
          trend="16.1%"
          icon={CircleDollarSign}
          accent="#706c9f"
        />
      </section>

      <section className="overview-grid">
        <div className="panel occupancy-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Performance</p>
              <h3>Occupancy overview</h3>
            </div>
            <div className="action-menu-wrap">
              <button
                className="select-button"
                onClick={() => setRangeOpen(open => !open)}
                aria-label="Select occupancy date range"
              >
                {selectedRange} <ChevronDown size={14} />
              </button>
              {rangeOpen && (
                <div className="action-menu">
                  <strong>Select period</strong>
                  {rangeOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedRange(option);
                        setRangeOpen(false);
                        onToast(`Occupancy period set to ${option}`);
                      }}
                      style={{
                        fontWeight: selectedRange === option ? 700 : 500,
                        background:
                          selectedRange === option ? "#f0f4ee" : "transparent",
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="occupancy-body">
            <div className="ring-wrap">
              <div
                className="occupancy-ring"
                style={
                  {
                    "--occupancy": `${summary.occupancy * 3.6}deg`,
                  } as React.CSSProperties
                }
              >
                <div>
                  <strong>{summary.occupancy}%</strong>
                  <span>occupied</span>
                </div>
              </div>
              <div className="ring-caption">
                <span className="legend-dot occupied-dot" />
                Occupied
                <span className="legend-dot available-dot" />
                Available
              </div>
            </div>
            <div className="occupancy-details">
              <div className="big-number">
                {summary.occupiedRooms ?? (summary.totalRooms - summary.availableRooms)}{" "}
                <span>/ {summary.totalRooms} rooms</span>
              </div>
              <p>
                Live dynamic occupancy: <strong>{summary.occupancy}%</strong> across {summary.totalRooms} rooms.
              </p>
              <div className="progress-line">
                <span style={{ width: `${summary.occupancy}%` }} />
              </div>
              <div className="detail-foot">
                <span>
                  <b>{summary.availableRooms}</b> available today
                </span>
                <button onClick={() => onSelectSection("Rooms")}>
                  View rooms <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="panel pulse-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">On the floor</p>
              <h3>Today's pulse</h3>
            </div>
          </div>
          <div className="pulse-list">
            <div className="pulse-item">
              <span className="pulse-icon pulse-green">
                <CheckCircle2 size={16} />
              </span>
              <div>
                <strong>Room 504 checked in</strong>
                <small>Amelia Brooks · 12 min ago</small>
              </div>
              <span className="pulse-time">14:12</span>
            </div>
            <div className="pulse-item">
              <span className="pulse-icon pulse-gold">
                <Clock3 size={16} />
              </span>
              <div>
                <strong>3 rooms need attention</strong>
                <small>Housekeeping queue · floor 1</small>
              </div>
              <span className="pulse-time">13:48</span>
            </div>
            <div className="pulse-item">
              <span className="pulse-icon pulse-blue">
                <Sparkles size={16} />
              </span>
              <div>
                <strong>VIP request added</strong>
                <small>Sofia Laurent · terrace suite</small>
              </div>
              <span className="pulse-time">13:21</span>
            </div>
            <div className="pulse-item">
              <span className="pulse-icon pulse-coral">
                <Wrench size={16} />
              </span>
              <div>
                <strong>Room 308 out of service</strong>
                <small>Maintenance · HVAC check</small>
              </div>
              <span className="pulse-time">12:56</span>
            </div>
          </div>
          <button
            className="text-button"
            onClick={() => onSelectSection("Reports")}
            title="View detailed performance reports and analytics"
          >
            View performance reports <ArrowUpRight size={14} />
          </button>
        </div>
      </section>

      <section className="panel reservations-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Stay management</p>
            <h3>Upcoming reservations</h3>
          </div>
          <div className="heading-actions">
            <button
              className="text-button"
              onClick={() => onSelectSection("Reservations")}
            >
              View all ({reservations.length}) <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
        <ReservationTable
          reservations={reservations.slice(0, 5)}
          onEdit={onEditReservation}
          onStatusChange={onStatusChange}
        />
      </section>
    </>
  );
}

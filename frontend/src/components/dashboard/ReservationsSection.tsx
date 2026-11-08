import { useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import type { Reservation, ReservationStatus } from "@/types/hotel";
import { ReservationTable } from "./ReservationTable";

export type ReservationsSectionProps = {
  reservations: Reservation[];
  onOpenNewReservation: () => void;
  onEditReservation: (reservation: Reservation) => void;
  onStatusChange: (reservation: Reservation, status: ReservationStatus) => void;
  onToast: (message: string) => void;
};

export function ReservationsSection({
  reservations,
  onOpenNewReservation,
  onEditReservation,
  onStatusChange,
  onToast,
}: ReservationsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const statusOptions = [
    { label: "All statuses", value: "all" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Checked in", value: "checked_in" },
    { label: "Checked out", value: "checked_out" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const filteredReservations = reservations.filter(r => {
    const matchesSearch =
      !searchQuery ||
      r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="section-page">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Stay management</p>
          <h2>Reservations</h2>
          <p className="muted">
            Track every stay from first touch to checkout.
          </p>
        </div>
        <button className="button-primary" onClick={onOpenNewReservation}>
          <Plus size={16} />
          New reservation
        </button>
      </div>

      <div className="panel reservations-panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={15} />
            <input
              placeholder="Search guest, room, or confirmation…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="icon-button"
                style={{ padding: 2, background: "transparent", border: 0 }}
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="action-menu-wrap">
            <button
              className="filter-button"
              onClick={() => setFilterMenuOpen(open => !open)}
              aria-label="Filter by status"
            >
              <span className={`filter-dot filter-dot-${statusFilter}`} />
              {statusOptions.find(o => o.value === statusFilter)?.label ??
                "All statuses"}{" "}
              <ChevronDown size={13} />
            </button>
            {filterMenuOpen && (
              <div className="action-menu">
                <strong>Filter by status</strong>
                {statusOptions.map(option => {
                  const count =
                    option.value === "all"
                      ? reservations.length
                      : reservations.filter(r => r.status === option.value).length;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setFilterMenuOpen(false);
                        onToast(`Filtered by ${option.label} (${count})`);
                      }}
                      style={{
                        fontWeight: statusFilter === option.value ? 700 : 500,
                        background:
                          statusFilter === option.value ? "#f0f4ee" : "transparent",
                      }}
                    >
                      <span className={`filter-dot filter-dot-${option.value}`} />
                      <span style={{ flex: 1 }}>{option.label}</span>
                      <small style={{ color: "#8a968b" }}>{count}</small>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <ReservationTable
          reservations={filteredReservations}
          onEdit={onEditReservation}
          onStatusChange={onStatusChange}
        />
      </div>
    </section>
  );
}

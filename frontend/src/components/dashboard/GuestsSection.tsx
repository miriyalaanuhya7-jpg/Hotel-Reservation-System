import { useState } from "react";
import { ArrowUpRight, Download, Plus, Search, Sparkles } from "lucide-react";
import type { Guest } from "@/types/hotel";
import { initials } from "@/types/hotel";

export type GuestsSectionProps = {
  guests: Guest[];
  onToast: (message: string) => void;
  onBookGuest?: (guest: Guest) => void;
};

export function GuestsSection({
  guests,
  onToast,
  onBookGuest,
}: GuestsSectionProps) {
  const [search, setSearch] = useState("");

  const filteredGuests = guests.filter(
    g =>
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase())) ||
      (g.phone && g.phone.includes(search))
  );

  const handleExportCsv = () => {
    if (!guests || guests.length === 0) {
      onToast("No guests to export");
      return;
    }
    const headers = ["Name", "Email", "Phone", "Stays", "VIP Status"];
    const csvRows = [
      headers.join(","),
      ...guests.map(g =>
        [
          `"${g.name.replace(/"/g, '""')}"`,
          `"${(g.email || "").replace(/"/g, '""')}"`,
          `"${(g.phone || "").replace(/"/g, '""')}"`,
          g.stayCount,
          g.vip ? "VIP" : "Standard",
        ].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hotel_guests_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast(`Exported ${guests.length} guests to CSV file`);
  };

  return (
    <section className="section-page">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">Guest relations</p>
          <h2>Guest directory</h2>
          <p className="muted">Know the people behind every reservation.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="table-search" style={{ minWidth: 200 }}>
            <Search size={14} />
            <input
              placeholder="Search guests…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            className="button-secondary"
            onClick={handleExportCsv}
            title="Download complete guest directory as a CSV file"
          >
            <Download size={15} />
            Export CSV ({guests.length})
          </button>
        </div>
      </div>

      <div className="guest-grid">
        {filteredGuests.map(guest => (
          <div className="guest-card" key={guest.id}>
            <div className="guest-card-top">
              <div className="guest-avatar">{initials(guest.name)}</div>
              {Boolean(guest.vip) ? (
                <span className="vip-tag">
                  <Sparkles size={12} />
                  VIP
                </span>
              ) : (
                <span className="stay-count">{guest.stayCount} stays</span>
              )}
            </div>
            <h3>{guest.name}</h3>
            <p>{guest.email || "No email on file"}</p>
            <p>{guest.phone || "No phone on file"}</p>
            <div className="guest-card-footer">
              <span>{guest.stayCount} prior stays</span>
              {onBookGuest && (
                <button
                  type="button"
                  className="text-button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    padding: 0,
                    background: "none",
                    border: 0,
                    color: "#3d6451",
                    fontWeight: 600,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                  onClick={() => onBookGuest(guest)}
                  title={`Create new reservation for ${guest.name}`}
                >
                  <Plus size={13} />
                  Book stay
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

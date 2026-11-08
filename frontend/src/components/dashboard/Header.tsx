import { useState } from "react";
import { Bell, Check, CheckCheck, Menu, Search, Sparkles, X } from "lucide-react";
import type { Section } from "@/types/hotel";
import { greetingForHour } from "@/types/hotel";

export type HeaderProps = {
  activeSection: Section;
  now: Date;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenMobileNav: () => void;
  onToast: (message: string) => void;
  onOpenSettings?: () => void;
};

export function Header({
  activeSection,
  now,
  searchQuery = "",
  onSearchChange,
  onOpenMobileNav,
  onToast,
  onOpenSettings,
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    {
      id: "1",
      title: "PhonePe UPI QR Active",
      body: "Dynamic QR prefilled to stay value ready for guest scans",
      time: "Just now",
      badge: "Payment",
    },
    {
      id: "2",
      title: "Housekeeping Update",
      body: "Floor 1 rooms scheduled for afternoon turnover inspection",
      time: "24m ago",
      badge: "Rooms",
    },
    {
      id: "3",
      title: "VIP Reservation Today",
      body: "Sofia Laurent arriving for Terrace Suite",
      time: "1h ago",
      badge: "VIP",
    },
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu icon-button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <p className="eyebrow">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            ·{" "}
            {now.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <h1>
            {activeSection === "Overview"
              ? greetingForHour(now.getHours())
              : activeSection}
          </h1>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search guests, rooms, codes…"
            aria-label="Search"
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
          />
          {searchQuery && (
            <button
              className="icon-button"
              style={{
                padding: 0,
                width: 18,
                height: 18,
                background: "transparent",
                border: 0,
                color: "#7e8d82",
              }}
              onClick={() => onSearchChange?.("")}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="action-menu-wrap">
          <button
            className={`icon-button ${hasUnread ? "has-notice" : ""}`}
            onClick={() => setNotificationsOpen(open => !open)}
            aria-label="Notifications"
            title="View system notifications"
          >
            <Bell size={18} />
            {hasUnread && <span />}
          </button>
          {notificationsOpen && (
            <div
              className="action-menu"
              style={{ width: 280, right: -40, padding: "10px 12px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 8,
                  borderBottom: "1px solid #eef1ec",
                  marginBottom: 6,
                }}
              >
                <strong style={{ padding: 0 }}>System Notifications</strong>
                {hasUnread && (
                  <button
                    style={{
                      width: "auto",
                      padding: "2px 6px",
                      fontSize: 10,
                      color: "#406954",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                    onClick={() => {
                      setHasUnread(false);
                      onToast("All notifications marked as read");
                    }}
                  >
                    <CheckCheck size={12} />
                    Mark read
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      background: "#fbfcfb",
                      border: "1px solid #ebf0e9",
                      borderRadius: 8,
                      padding: "7px 9px",
                      display: "grid",
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#2f4538",
                        }}
                      >
                        {n.title}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          background: "#eaf1e8",
                          color: "#3f6751",
                          padding: "1px 5px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        {n.badge}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 10,
                        color: "#6b7d72",
                        lineHeight: 1.4,
                      }}
                    >
                      {n.body}
                    </p>
                    <small style={{ fontSize: 9, color: "#9ca99f" }}>
                      {n.time}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Popover */}
        <div className="action-menu-wrap">
          <div
            className="top-avatar"
            onClick={() => setProfileOpen(open => !open)}
            style={{ cursor: "pointer" }}
            title="Anuhya Miriyala (Property Manager)"
          >
            AM
          </div>
          {profileOpen && (
            <div className="action-menu" style={{ width: 190, right: 0 }}>
              <div
                style={{
                  padding: "6px 8px 8px",
                  borderBottom: "1px solid #eef1ec",
                  marginBottom: 4,
                }}
              >
                <strong
                  style={{
                    padding: 0,
                    fontSize: 11,
                    color: "#283e32",
                    textTransform: "none",
                  }}
                >
                  Anuhya Miriyala
                </strong>
                <span
                  style={{ fontSize: 10, color: "#798c80", display: "block" }}
                >
                  Property Manager · North House
                </span>
              </div>
              {onOpenSettings && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenSettings();
                  }}
                >
                  Property settings
                </button>
              )}
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onToast("Manager session active · All systems green");
                }}
              >
                <Check size={13} />
                Shift active
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

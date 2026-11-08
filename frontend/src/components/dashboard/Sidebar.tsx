import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  MoreHorizontal,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import type { Section } from "@/types/hotel";
import { navItems } from "@/types/hotel";

export type SidebarProps = {
  activeSection: Section;
  mobileNavOpen: boolean;
  propertyName?: string;
  onSelectSection: (section: Section) => void;
  onCloseMobileNav: () => void;
  onToast: (message: string) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
};

const PROPERTIES = [
  { id: "nh", name: "North House", code: "NH", location: "London · Main property" },
  { id: "wv", name: "West Villa", code: "WV", location: "Mayfair · Boutique" },
  { id: "sm", name: "Seaside Manor", code: "SM", location: "Brighton · Coastal" },
];

export function Sidebar({
  activeSection,
  mobileNavOpen,
  propertyName = "North House",
  onSelectSection,
  onCloseMobileNav,
  onToast,
  onOpenSettings,
  onOpenGuide,
}: SidebarProps) {
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(PROPERTIES[0]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      {mobileNavOpen && (
        <div className="mobile-scrim" onClick={onCloseMobileNav} />
      )}
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <span>A</span>
          </div>
          <div>
            <strong>AURA STAYS</strong>
            <small>Hospitality suite</small>
          </div>
          <button
            className="sidebar-close icon-button"
            onClick={onCloseMobileNav}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Functional Property Switcher */}
        <div className="action-menu-wrap" style={{ display: "block" }}>
          <div
            className="property-switcher"
            onClick={() => setPropertyOpen(open => !open)}
            style={{ cursor: "pointer" }}
            title="Switch managed property"
          >
            <div className="property-avatar">{selectedProperty.code}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                {selectedProperty.name}
              </strong>
              <small>{selectedProperty.location}</small>
            </div>
            <ChevronDown size={15} />
          </div>
          {propertyOpen && (
            <div
              className="action-menu"
              style={{
                left: 0,
                right: 0,
                top: "calc(100% + 4px)",
                background: "#23392e",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#e2ede3",
              }}
            >
              <strong style={{ color: "#8da595" }}>Select Property</strong>
              {PROPERTIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProperty(p);
                    setPropertyOpen(false);
                    onToast(`Switched view to ${p.name}`);
                  }}
                  style={{
                    color: selectedProperty.id === p.id ? "#fff" : "#b0c5b7",
                    background:
                      selectedProperty.id === p.id
                        ? "rgba(255,255,255,0.12)"
                        : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, display: "block" }}>
                      {p.name}
                    </span>
                    <small style={{ fontSize: 9, opacity: 0.7 }}>
                      {p.location}
                    </small>
                  </div>
                  {selectedProperty.id === p.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="nav-caption">Workspace</p>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={
                activeSection === label ? "nav-item active" : "nav-item"
              }
              onClick={() => onSelectSection(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p className="nav-caption">Manage</p>
          <button
            className="nav-item"
            onClick={onOpenSettings}
            title="Configure property identity, policy times, and PhonePe UPI"
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </button>
          <div className="sidebar-tip">
            <div className="tip-icon">
              <Sparkles size={16} />
            </div>
            <strong>Make every stay memorable.</strong>
            <p>Keep your team in sync with one calm workspace.</p>
            <button
              type="button"
              onClick={onOpenGuide}
              title="Open Hospitality Operations Guide"
              style={{ cursor: "pointer" }}
            >
              Explore guide <ArrowUpRight size={13} />
            </button>
          </div>

          <div
            className="user-chip"
            onClick={() => setUserMenuOpen(open => !open)}
            style={{ cursor: "pointer", position: "relative" }}
            title="User Profile"
          >
            <div className="user-avatar">AM</div>
            <div>
              <strong>Anuhya Miriyala</strong>
              <small>Property manager</small>
            </div>
            <MoreHorizontal size={16} />
            {userMenuOpen && (
              <div
                className="action-menu"
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 5px)",
                  right: 0,
                  left: 0,
                  top: "auto",
                  background: "#23392e",
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "#e2ede3",
                }}
                onClick={e => e.stopPropagation()}
              >
                <strong style={{ color: "#8da595" }}>Manager Shift</strong>
                <button
                  style={{ color: "#d8e9dc" }}
                  onClick={() => {
                    setUserMenuOpen(false);
                    onToast("Manager shift active · Signed in as Anuhya Miriyala");
                  }}
                >
                  <Check size={14} /> Active on Duty
                </button>
                <button
                  style={{ color: "#d8e9dc" }}
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenSettings();
                  }}
                >
                  Property settings
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

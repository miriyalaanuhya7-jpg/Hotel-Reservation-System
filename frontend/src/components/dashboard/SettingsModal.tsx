import { useState, type FormEvent } from "react";
import { Check, Settings, X } from "lucide-react";

export type SettingsModalProps = {
  propertyName: string;
  onUpdatePropertyName: (name: string) => void;
  onClose: () => void;
  onToast: (message: string) => void;
};

export function SettingsModal({
  propertyName,
  onUpdatePropertyName,
  onClose,
  onToast,
}: SettingsModalProps) {
  const [name, setName] = useState(propertyName);
  const [phonePeVpa, setPhonePeVpa] = useState(() => {
    return (
      localStorage.getItem("aurastays_phonepe_vpa") ||
      localStorage.getItem("nestera_phonepe_vpa") ||
      "hotelres@ybl"
    );
  });
  const [payeeName, setPayeeName] = useState(() => {
    return (
      localStorage.getItem("aurastays_phonepe_payee") ||
      localStorage.getItem("nestera_phonepe_payee") ||
      "Aura Stays"
    );
  });
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [pricingMode, setPricingMode] = useState("Per Day (₹/day)");

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdatePropertyName(name.trim());
    }
    if (phonePeVpa.trim()) {
      localStorage.setItem("aurastays_phonepe_vpa", phonePeVpa.trim());
      localStorage.setItem("nestera_phonepe_vpa", phonePeVpa.trim());
    }
    if (payeeName.trim()) {
      localStorage.setItem("aurastays_phonepe_payee", payeeName.trim());
      localStorage.setItem("nestera_phonepe_payee", payeeName.trim());
    }
    onToast("Property & payment settings saved successfully");
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Hotel management</p>
            <h2>Property Settings</h2>
            <p className="muted">
              Configure hotel identity, policy times, and default PhonePe UPI payment account.
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-grid">
            <label className="full-span">
              Property Name
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. North House Hotel"
              />
            </label>

            <label>
              Default PhonePe UPI ID (VPA)
              <input
                required
                value={phonePeVpa}
                onChange={e => setPhonePeVpa(e.target.value)}
                placeholder="e.g. 9876543210@ybl or hotel@phonepe"
              />
            </label>

            <label>
              PhonePe Payee Name
              <input
                required
                value={payeeName}
                onChange={e => setPayeeName(e.target.value)}
                placeholder="e.g. Aura Stays"
              />
            </label>

            <label>
              Standard Check-in Time
              <input
                type="time"
                value={checkInTime}
                onChange={e => setCheckInTime(e.target.value)}
              />
            </label>

            <label>
              Standard Check-out Time
              <input
                type="time"
                value={checkOutTime}
                onChange={e => setCheckOutTime(e.target.value)}
              />
            </label>

            <label className="full-span">
              Rate Billing Display
              <select
                value={pricingMode}
                onChange={e => setPricingMode(e.target.value)}
              >
                <option value="Per Day (₹/day)">Per Day (₹/day)</option>
                <option value="Per Night (₹/night)">Per Night (₹/night)</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="button-primary">
              <Check size={16} />
              Save settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

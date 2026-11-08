import { BookOpen, CheckCircle, QrCode, Sparkles, X } from "lucide-react";

export type GuideModalProps = {
  onClose: () => void;
};

export function GuideModal({ onClose }: GuideModalProps) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Front desk knowledge</p>
            <h2>Hospitality Operations Guide</h2>
            <p className="muted">
              Quick reference for team workflows, stay calculations, and payments.
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div
            style={{
              background: "#f7f9f6",
              border: "1px solid #e1e8df",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <strong
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#2e4a3c",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <CheckCircle size={15} color="#45785c" />
              Automatic Stay Status Rules
            </strong>
            <p style={{ margin: 0, fontSize: 11, color: "#5d7366", lineHeight: 1.5 }}>
              • <strong>Confirmed:</strong> Future booking dates relative to today.<br />
              • <strong>Checked In:</strong> When today falls between Check-in and Check-out dates.<br />
              • <strong>Checked Out:</strong> When the reservation Check-out date has passed.
            </p>
          </div>

          <div
            style={{
              background: "#faf6fe",
              border: "1px solid #e9ddf7",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <strong
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#4e1b82",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <QrCode size={15} color="#5f259f" />
              Dynamic PhonePe UPI Payments
            </strong>
            <p style={{ margin: 0, fontSize: 11, color: "#6b5883", lineHeight: 1.5 }}>
              • The embedded QR code recalculates its UPI payload whenever room or stay days change.<br />
              • Guests scanning with PhonePe, Google Pay, or Paytm see the exact stay amount pre-filled.<br />
              • You can edit and save your hotel's PhonePe VPA directly from the modal or Settings.
            </p>
          </div>

          <div
            style={{
              background: "#fbfaf7",
              border: "1px solid #ede7dc",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <strong
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#6b542e",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <Sparkles size={15} color="#a67c37" />
              Room Flow & Housekeeping
            </strong>
            <p style={{ margin: 0, fontSize: 11, color: "#7a6e5a", lineHeight: 1.5 }}>
              • 4 floors with 4 rooms each (101–104, 201–204, 301–304, 401–404).<br />
              • Rates are billed on a <strong>per day (₹/day)</strong> basis.<br />
              • Checkouts automatically mark the room for cleaning until inspected.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="button-primary" onClick={onClose}>
            Got it, close guide
          </button>
        </div>
      </div>
    </div>
  );
}

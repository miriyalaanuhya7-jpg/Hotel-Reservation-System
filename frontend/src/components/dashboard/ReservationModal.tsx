import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Copy, Edit2, Pencil, Plus, QrCode, Smartphone, X } from "lucide-react";
import QRCode from "qrcode";
import { trpc } from "@/lib/trpc";
import type { Reservation, ReservationStatus, Room } from "@/types/hotel";
import { deriveReservationStatus, getLocalDateString } from "@/types/hotel";
import { StatusPill } from "./StatusPill";

function PhonePeBadgeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#5f259f" />
      <path
        d="M29.6 13.5H18.4c-1.1 0-2 .9-2 2v2.4c0 1.1.9 2 2 2h2.8v4.2h-2.8c-1.1 0-2 .9-2 2v2.4c0 1.1.9 2 2 2h2.8v8.6c0 1.1.9 2 2 2h3.2c1.1 0 2-.9 2-2v-8.6h4.5c4.8 0 8.3-3.2 8.3-7.5 0-4.5-3.5-7.3-8.6-7.3zm-.2 8.6h-4.3v-4.6h4.3c2.4 0 3.8 1.1 3.8 2.3 0 1.3-1.4 2.3-3.8 2.3z"
        fill="#ffffff"
      />
      <path
        d="M33 11.2c-.4-1.2-1.5-2.9-3-4.1l-1.8 1.4c1.2 1 2.1 2.4 2.5 3.4l2.3-.7z"
        fill="#ffffff"
      />
    </svg>
  );
}

export type ReservationModalProps = {
  reservation: Reservation | null;
  rooms?: Room[];
  initialRoomNumber?: string;
  initialGuest?: { name?: string; phone?: string; email?: string } | null;
  onClose: () => void;
  onSave: (reservation: Reservation) => void;
};

const DEFAULT_ROOMS: Room[] = [
  { roomNumber: "101", roomType: "Studio", floor: 1, status: "available", rate: 250 },
  { roomNumber: "102", roomType: "Studio", floor: 1, status: "cleaning", rate: 250 },
  { roomNumber: "103", roomType: "King room", floor: 1, status: "available", rate: 320 },
  { roomNumber: "104", roomType: "King room", floor: 1, status: "occupied", rate: 320 },
  { roomNumber: "201", roomType: "King room", floor: 2, status: "available", rate: 340 },
  { roomNumber: "202", roomType: "King room", floor: 2, status: "occupied", rate: 340 },
  { roomNumber: "203", roomType: "Deluxe suite", floor: 2, status: "available", rate: 420 },
  { roomNumber: "204", roomType: "Deluxe suite", floor: 2, status: "occupied", rate: 420 },
  { roomNumber: "301", roomType: "Deluxe suite", floor: 3, status: "available", rate: 450 },
  { roomNumber: "302", roomType: "Deluxe suite", floor: 3, status: "maintenance", rate: 450 },
  { roomNumber: "303", roomType: "Garden suite", floor: 3, status: "occupied", rate: 520 },
  { roomNumber: "304", roomType: "Garden suite", floor: 3, status: "available", rate: 520 },
  { roomNumber: "401", roomType: "Garden suite", floor: 4, status: "available", rate: 550 },
  { roomNumber: "402", roomType: "Garden suite", floor: 4, status: "occupied", rate: 550 },
  { roomNumber: "403", roomType: "Terrace suite", floor: 4, status: "available", rate: 650 },
  { roomNumber: "404", roomType: "Terrace suite", floor: 4, status: "occupied", rate: 650 },
];

function calculateDays(inDateStr: string, outDateStr: string): number {
  if (!inDateStr || !outDateStr) return 1;
  const start = new Date(inDateStr);
  const end = new Date(outDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
}

export function ReservationModal({
  reservation,
  rooms: propRooms,
  initialRoomNumber: propInitialRoom,
  initialGuest,
  onClose,
  onSave,
}: ReservationModalProps) {
  const isEditing = Boolean(reservation);

  const getTodayDateStr = () => getLocalDateString(new Date());
  const getFutureDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return getLocalDateString(d);
  };

  const allRooms: Room[] = useMemo(() => {
    if (propRooms && propRooms.length > 0) return propRooms;
    return DEFAULT_ROOMS;
  }, [propRooms]);

  // In new reservation, show available rooms only.
  // In edit reservation, show available rooms plus the currently booked room.
  const selectableRooms = useMemo(() => {
    return allRooms.filter(room => {
      if (room.status === "available") return true;
      if (isEditing && reservation && room.roomNumber === reservation.roomNumber) {
        return true;
      }
      if (propInitialRoom && room.roomNumber === propInitialRoom) {
        return true;
      }
      return false;
    });
  }, [allRooms, isEditing, reservation, propInitialRoom]);

  const availableFloors = useMemo(() => {
    const floors = Array.from(new Set(selectableRooms.map(r => r.floor)));
    return floors.sort((a, b) => a - b);
  }, [selectableRooms]);

  const initialRoomNumber = useMemo(() => {
    if (reservation?.roomNumber) return reservation.roomNumber;
    if (propInitialRoom) return propInitialRoom;
    return selectableRooms[0]?.roomNumber ?? "101";
  }, [reservation, propInitialRoom, selectableRooms]);

  const initialRoomObj = useMemo(() => {
    return (
      allRooms.find(r => r.roomNumber === initialRoomNumber) ??
      DEFAULT_ROOMS.find(r => r.roomNumber === initialRoomNumber)
    );
  }, [allRooms, initialRoomNumber]);

  const [guestName, setGuestName] = useState(
    () => reservation?.guestName ?? initialGuest?.name ?? ""
  );
  const [guestPhone, setGuestPhone] = useState(
    () => reservation?.guestPhone ?? initialGuest?.phone ?? ""
  );
  const [roomNumber, setRoomNumber] = useState(initialRoomNumber);
  const [roomType, setRoomType] = useState(
    () => reservation?.roomType ?? initialRoomObj?.roomType ?? "Studio"
  );
  const [checkIn, setCheckIn] = useState(() =>
    reservation
      ? getLocalDateString(reservation.checkIn)
      : getTodayDateStr()
  );
  const [checkOut, setCheckOut] = useState(() =>
    reservation
      ? getLocalDateString(reservation.checkOut)
      : getFutureDateStr(3)
  );

  const initialDays = calculateDays(
    reservation
      ? getLocalDateString(reservation.checkIn)
      : getTodayDateStr(),
    reservation
      ? getLocalDateString(reservation.checkOut)
      : getFutureDateStr(3)
  );

  const [amount, setAmount] = useState(() =>
    reservation?.amount
      ? String(reservation.amount)
      : String((initialRoomObj?.rate ?? 250) * initialDays)
  );

  const createMutation = trpc.hotel.createReservation.useMutation();
  const updateMutation = trpc.hotel.updateReservation.useMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const currentRoomObj =
    allRooms.find(r => r.roomNumber === roomNumber) ?? initialRoomObj;
  const currentRate = currentRoomObj?.rate ?? 250;
  const stayDays = calculateDays(checkIn, checkOut);

  const [phonePeUpiId, setPhonePeUpiId] = useState<string>(() => {
    return (
      localStorage.getItem("aurastays_phonepe_vpa") ||
      localStorage.getItem("nestera_phonepe_vpa") ||
      "hotelres@ybl"
    );
  });
  const [payeeName, setPayeeName] = useState<string>(() => {
    return (
      localStorage.getItem("aurastays_phonepe_payee") ||
      localStorage.getItem("nestera_phonepe_payee") ||
      "Aura Stays"
    );
  });
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [customUpiInput, setCustomUpiInput] = useState(phonePeUpiId);
  const [customPayeeInput, setCustomPayeeInput] = useState(payeeName);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Dynamic numeric stay value calculated according to room rate and stay duration
  const currentNumericAmount = Number(amount) || (currentRate * stayDays);
  const upiNote = `Room ${roomNumber} stay - ${guestName ? guestName.trim() : "Guest"}`;

  // Standard UPI URI format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
  // Dynamically adjusted according to the stay value
  const upiPayUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: phonePeUpiId.trim(),
      pn: payeeName.trim(),
      am: String(currentNumericAmount),
      cu: "INR",
      tn: upiNote,
    });
    return `upi://pay?${params.toString()}`;
  }, [phonePeUpiId, payeeName, currentNumericAmount, upiNote]);

  // Dynamically re-generate QR code whenever the stay value or booking details change
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(upiPayUrl, {
      width: 170,
      margin: 1,
      color: {
        dark: "#2a0d45",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then(url => {
        if (active) setQrDataUrl(url);
      })
      .catch(err => {
        console.error("Failed to generate PhonePe QR Code:", err);
      });

    return () => {
      active = false;
    };
  }, [upiPayUrl]);

  const handleSaveUpiConfig = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanUpi = customUpiInput.trim() || "hotelres@ybl";
    const cleanPayee = customPayeeInput.trim() || "Aura Stays";
    setPhonePeUpiId(cleanUpi);
    setPayeeName(cleanPayee);
    localStorage.setItem("aurastays_phonepe_vpa", cleanUpi);
    localStorage.setItem("aurastays_phonepe_payee", cleanPayee);
    localStorage.setItem("nestera_phonepe_vpa", cleanUpi);
    localStorage.setItem("nestera_phonepe_payee", cleanPayee);
    setIsEditingUpi(false);
  };

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(phonePeUpiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyPayLink = async () => {
    try {
      await navigator.clipboard.writeText(upiPayUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  // When room is selected:
  // 1. Update room number
  // 2. Automatically sync room type
  // 3. Automatically calculate total stay value based on room rate and stay duration
  const handleRoomSelect = (newRoom: string) => {
    setRoomNumber(newRoom);
    const selected = allRooms.find(r => r.roomNumber === newRoom);
    if (selected) {
      setRoomType(selected.roomType);
      const days = calculateDays(checkIn, checkOut);
      setAmount(String(selected.rate * days));
    }
  };

  // When check-in date changes:
  // 1. Automatically ensure check-out is after check-in
  // 2. Automatically update total stay value
  const handleCheckInChange = (newCheckIn: string) => {
    setCheckIn(newCheckIn);
    let effectiveOut = checkOut;
    if (newCheckIn && checkOut && newCheckIn >= checkOut) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      effectiveOut = nextDay.toISOString().slice(0, 10);
      setCheckOut(effectiveOut);
    }
    const days = calculateDays(newCheckIn, effectiveOut);
    if (currentRoomObj) {
      setAmount(String(currentRoomObj.rate * days));
    }
  };

  // When check-out date changes:
  // 1. Automatically ensure check-out is after check-in
  // 2. Automatically update total stay value
  const handleCheckOutChange = (newCheckOut: string) => {
    setCheckOut(newCheckOut);
    let effectiveIn = checkIn;
    if (newCheckOut && checkIn && newCheckOut <= checkIn) {
      const prevDay = new Date(newCheckOut);
      prevDay.setDate(prevDay.getDate() - 1);
      effectiveIn = prevDay.toISOString().slice(0, 10);
      setCheckIn(effectiveIn);
    }
    const days = calculateDays(effectiveIn, newCheckOut);
    if (currentRoomObj) {
      setAmount(String(currentRoomObj.rate * days));
    }
  };

  const currentStatus = useMemo(() => {
    if (reservation?.status === "cancelled") return "cancelled";
    return deriveReservationStatus(checkIn, checkOut);
  }, [checkIn, checkOut, reservation?.status]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const input = {
      guestName,
      guestPhone,
      guestEmail: reservation?.guestEmail ?? initialGuest?.email ?? "",
      roomNumber,
      roomType,
      checkIn,
      checkOut,
      amount: Number(amount) || (currentRate * stayDays),
      status: currentStatus,
      source: reservation?.source ?? "Direct",
    };
    try {
      if (reservation) {
        await updateMutation.mutateAsync({ id: reservation.id, ...input });
        onSave({ ...reservation, ...input });
      } else {
        const result = await createMutation.mutateAsync({
          ...input,
          status: currentStatus,
        });
        onSave({
          ...input,
          id: Number(result?.id ?? Date.now()),
          confirmationCode: String(
            result?.confirmationCode ??
              `AS-${Math.floor(1000 + Math.random() * 9000)}`
          ),
        });
      }
    } catch {
      onSave({
        ...input,
        id: reservation?.id ?? Date.now(),
        confirmationCode:
          reservation?.confirmationCode ??
          `AS-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Front desk</p>
            <h2>{isEditing ? "Edit reservation" : "New reservation"}</h2>
            <p className="muted">
              {isEditing
                ? "Update stay details without losing the booking history."
                : "Create a direct booking in a few details."}
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label>
              Guest name
              <input
                required
                value={guestName}
                onChange={event => setGuestName(event.target.value)}
                placeholder="e.g. Evelyn Hart"
              />
            </label>
            <label>
              Mobile number
              <input
                type="tel"
                required
                value={guestPhone}
                onChange={event => setGuestPhone(event.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </label>
            <label>
              <span className="label-with-meta">
                <span>Room</span>
                <span className="count-pill">
                  {selectableRooms.length} available
                </span>
              </span>
              <select
                value={roomNumber}
                onChange={event => handleRoomSelect(event.target.value)}
                required
              >
                {selectableRooms.length === 0 ? (
                  <option value="" disabled>
                    No rooms currently available
                  </option>
                ) : (
                  availableFloors.map(floor => (
                    <optgroup key={floor} label={`Floor ${floor}`}>
                      {selectableRooms
                        .filter(r => r.floor === floor)
                        .map(r => (
                          <option key={r.roomNumber} value={r.roomNumber}>
                            {r.roomNumber} · {r.roomType} (₹{r.rate}/day)
                          </option>
                        ))}
                    </optgroup>
                  ))
                )}
              </select>
            </label>
            <label>
              <span className="label-with-meta">
                <span>Room type</span>
                <span className="auto-pill">Auto</span>
              </span>
              <input
                type="text"
                readOnly
                value={roomType}
                className="readonly-field"
                title="Room type is automatically updated according to the selected room"
              />
            </label>
            <label>
              Check-in
              <input
                type="date"
                required
                value={checkIn}
                onChange={event => handleCheckInChange(event.target.value)}
              />
            </label>
            <label>
              Check-out
              <input
                type="date"
                required
                value={checkOut}
                onChange={event => handleCheckOutChange(event.target.value)}
              />
            </label>
            <label>
              <span className="label-with-meta">
                <span>Stay status</span>
                <span className="auto-pill">Auto</span>
              </span>
              <div className="status-readonly-input readonly-field">
                <StatusPill status={currentStatus} />
              </div>
            </label>
            <label>
              <span className="label-with-meta">
                <span>Total stay value</span>
                <span className="calculation-badge">
                  ₹{currentRate}/day × {stayDays}{" "}
                  {stayDays === 1 ? "day" : "days"} = ₹{currentRate * stayDays}
                </span>
              </span>
              <input
                type="number"
                min="1"
                readOnly
                value={amount}
                className="readonly-field"
                title="Total stay value is calculated automatically based on room rate and stay days"
              />
            </label>

            {/* PhonePe Dynamic UPI Payment Card */}
            <div className="full-span phonepe-container">
              <div className="phonepe-card">
                <div className="phonepe-card-header">
                  <div className="phonepe-brand-title">
                    <PhonePeBadgeIcon />
                    <div>
                      <div className="phonepe-title-row">
                        <strong>PhonePe UPI Pay</strong>
                        <span className="phonepe-sync-tag">Dynamic Stay Value</span>
                      </div>
                      <span className="phonepe-subtitle">
                        Scan with PhonePe to pay exact stay value · Instant confirmation
                      </span>
                    </div>
                  </div>
                  <div className="phonepe-amount-pill">
                    ₹{currentNumericAmount}
                  </div>
                </div>

                <div className="phonepe-body">
                  <div className="phonepe-qr-box">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="PhonePe Dynamic UPI QR Code"
                        className="phonepe-qr-image"
                        width={144}
                        height={144}
                      />
                    ) : (
                      <div className="phonepe-qr-loading">Generating QR…</div>
                    )}
                    <div className="phonepe-qr-footer">
                      <QrCode size={13} />
                      <span>Scan with PhonePe</span>
                    </div>
                  </div>

                  <div className="phonepe-details">
                    <div className="phonepe-price-block">
                      <div className="phonepe-price-headline">
                        <span className="phonepe-currency">₹</span>
                        <span className="phonepe-price-val">{currentNumericAmount}</span>
                        <span className="phonepe-tax-note">stay value auto-synced</span>
                      </div>
                      <div className="phonepe-calc-hint">
                        Room {roomNumber} ({roomType}) · {stayDays} {stayDays === 1 ? "day" : "days"} @ ₹{currentRate}/day
                      </div>
                    </div>

                    {isEditingUpi ? (
                      <div className="phonepe-edit-form">
                        <div className="phonepe-edit-field">
                          <label>Your PhonePe UPI ID (VPA):</label>
                          <input
                            type="text"
                            value={customUpiInput}
                            onChange={e => setCustomUpiInput(e.target.value)}
                            placeholder="e.g. 9876543210@ybl or hotel@phonepe"
                          />
                        </div>
                        <div className="phonepe-edit-field">
                          <label>Payee / Hotel Name:</label>
                          <input
                            type="text"
                            value={customPayeeInput}
                            onChange={e => setCustomPayeeInput(e.target.value)}
                            placeholder="e.g. Aura Stays"
                          />
                        </div>
                        <div className="phonepe-edit-actions">
                          <button
                            type="button"
                            className="phonepe-save-btn"
                            onClick={() => handleSaveUpiConfig()}
                          >
                            Save UPI ID
                          </button>
                          <button
                            type="button"
                            className="phonepe-cancel-btn"
                            onClick={() => {
                              setCustomUpiInput(phonePeUpiId);
                              setCustomPayeeInput(payeeName);
                              setIsEditingUpi(false);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="phonepe-vpa-row">
                        <div className="phonepe-vpa-info">
                          <span className="phonepe-vpa-label">Payee UPI ID</span>
                          <span className="phonepe-vpa-value">{phonePeUpiId}</span>
                        </div>
                        <div className="phonepe-vpa-actions">
                          <button
                            type="button"
                            className="phonepe-action-pill"
                            onClick={handleCopyUpiId}
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? (
                              <>
                                <Check size={12} /> Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} /> Copy
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="phonepe-action-pill"
                            onClick={() => setIsEditingUpi(true)}
                            title="Set your custom PhonePe UPI ID"
                          >
                            <Edit2 size={12} /> Edit ID
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="phonepe-apps-row">
                      <span className="phonepe-apps-label">Accepted:</span>
                      <div className="phonepe-apps-badges">
                        <span className="app-badge phonepe-badge">PhonePe</span>
                        <span className="app-badge">Google Pay</span>
                        <span className="app-badge">Paytm</span>
                        <span className="app-badge">BHIM UPI</span>
                      </div>
                    </div>

                    <div className="phonepe-bottom-actions">
                      <button
                        type="button"
                        className="phonepe-link-button"
                        onClick={handleCopyPayLink}
                        title="Copy dynamic UPI payment link"
                      >
                        {copiedLink ? (
                          <>
                            <Check size={13} /> Link Copied
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy Payment Link
                          </>
                        )}
                      </button>
                      <a
                        href={upiPayUrl}
                        className="phonepe-link-button"
                        target="_blank"
                        rel="noreferrer"
                        title="Open directly in PhonePe / UPI app on mobile devices"
                      >
                        <Smartphone size={13} /> Pay via App
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSaving || selectableRooms.length === 0}
            >
              {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
              {isSaving
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Confirm reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

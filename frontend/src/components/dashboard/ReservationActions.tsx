import { useState } from "react";
import { Ban, LogIn, LogOut, MoreHorizontal, Pencil } from "lucide-react";
import type { Reservation, ReservationStatus } from "@/types/hotel";

export type ReservationActionsProps = {
  reservation: Reservation;
  onEdit: (reservation: Reservation) => void;
  onStatusChange: (reservation: Reservation, status: ReservationStatus) => void;
};

export function ReservationActions({
  reservation,
  onEdit,
  onStatusChange,
}: ReservationActionsProps) {
  const [open, setOpen] = useState(false);
  const canEdit =
    reservation.status !== "checked_out" && reservation.status !== "cancelled";
  const canCheckIn =
    reservation.status === "pending" || reservation.status === "confirmed";
  const canCheckOut = reservation.status === "checked_in";
  const canCancel =
    reservation.status !== "checked_out" && reservation.status !== "cancelled";

  const choose = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div className="action-menu-wrap">
      <button
        className="more-button"
        aria-label={`Actions for ${reservation.guestName}`}
        onClick={() => setOpen(value => !value)}
      >
        <MoreHorizontal size={17} />
      </button>
      {open && (
        <div className="action-menu">
          <strong>Reservation actions</strong>
          {canEdit && (
            <button onClick={() => choose(() => onEdit(reservation))}>
              <Pencil size={14} />
              Edit details
            </button>
          )}
          {canCheckIn && (
            <button
              onClick={() =>
                choose(() => onStatusChange(reservation, "checked_in"))
              }
            >
              <LogIn size={14} />
              Check in
            </button>
          )}
          {canCheckOut && (
            <button
              onClick={() =>
                choose(() => onStatusChange(reservation, "checked_out"))
              }
            >
              <LogOut size={14} />
              Check out
            </button>
          )}
          {canCancel && (
            <button
              className="danger-action"
              onClick={() =>
                choose(() => onStatusChange(reservation, "cancelled"))
              }
            >
              <Ban size={14} />
              Cancel reservation
            </button>
          )}
          {!canEdit && !canCheckIn && !canCheckOut && !canCancel && (
            <span className="action-empty">No actions available</span>
          )}
        </div>
      )}
    </div>
  );
}

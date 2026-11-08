import type { Reservation, ReservationStatus } from "@/types/hotel";
import { currency, dateLabel, initials } from "@/types/hotel";
import { ReservationActions } from "./ReservationActions";
import { StatusPill } from "./StatusPill";

export type ReservationTableProps = {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
  onStatusChange: (reservation: Reservation, status: ReservationStatus) => void;
};

export function ReservationTable({
  reservations,
  onEdit,
  onStatusChange,
}: ReservationTableProps) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Stay dates</th>
            <th>Status</th>
            <th>Value</th>
            <th>Source</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {reservations.map(reservation => (
            <tr key={`${reservation.id}-${reservation.confirmationCode}`}>
              <td>
                <button
                  className="guest-cell"
                  onClick={() => onEdit(reservation)}
                >
                  <span className="table-avatar">
                    {initials(reservation.guestName)}
                  </span>
                  <span>
                    <strong>{reservation.guestName}</strong>
                    <small>
                      {reservation.confirmationCode}
                      {reservation.guestPhone
                        ? ` · ${reservation.guestPhone}`
                        : ""}
                    </small>
                  </span>
                </button>
              </td>
              <td>
                <span className="room-cell">{reservation.roomNumber}</span>
                <small>{reservation.roomType}</small>
              </td>
              <td>
                <strong>{dateLabel(reservation.checkIn)}</strong>
                <span className="date-arrow">→</span>
                <strong>{dateLabel(reservation.checkOut)}</strong>
              </td>
              <td>
                <StatusPill status={reservation.status} />
              </td>
              <td>
                <strong>{currency(reservation.amount)}</strong>
              </td>
              <td>
                <span className="source-label">{reservation.source}</span>
              </td>
              <td>
                <ReservationActions
                  reservation={reservation}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

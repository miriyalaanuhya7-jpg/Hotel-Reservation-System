import type { ReservationStatus } from "@/types/hotel";

export function StatusPill({ status }: { status: ReservationStatus | string }) {
  const label = status.replace("_", " ");
  return (
    <span className={`status-pill status-${status}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}

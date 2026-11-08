import {
  BarChart3,
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";

export type Section =
  | "Overview"
  | "Reservations"
  | "Rooms"
  | "Guests"
  | "Reports";

export type HomeProps = {
  initialSection?: Section;
};

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type Reservation = {
  id: number;
  confirmationCode: string;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  roomNumber: string;
  roomType: string;
  checkIn: string | Date;
  checkOut: string | Date;
  amount: number;
  status: ReservationStatus;
  source: string;
};

export type Room = {
  roomNumber: string;
  roomType: string;
  floor: number;
  rate: number;
  status: "available" | "occupied" | "cleaning" | "maintenance";
};

export type Guest = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  vip: number | boolean;
  stayCount: number;
};

export type DashboardSummary = {
  occupancy: number;
  arrivals: number;
  departures: number;
  revenue: number;
  availableRooms: number;
  totalRooms: number;
  occupiedRooms?: number;
};

export const DEFAULT_ROOMS: Room[] = [
  { roomNumber: "101", roomType: "Studio", floor: 1, rate: 250, status: "available" },
  { roomNumber: "102", roomType: "Studio", floor: 1, rate: 250, status: "cleaning" },
  { roomNumber: "103", roomType: "King room", floor: 1, rate: 320, status: "available" },
  { roomNumber: "104", roomType: "King room", floor: 1, rate: 320, status: "occupied" },
  { roomNumber: "201", roomType: "King room", floor: 2, rate: 340, status: "available" },
  { roomNumber: "202", roomType: "King room", floor: 2, rate: 340, status: "occupied" },
  { roomNumber: "203", roomType: "Deluxe suite", floor: 2, rate: 420, status: "available" },
  { roomNumber: "204", roomType: "Deluxe suite", floor: 2, rate: 420, status: "occupied" },
  { roomNumber: "301", roomType: "Deluxe suite", floor: 3, rate: 450, status: "available" },
  { roomNumber: "302", roomType: "Deluxe suite", floor: 3, rate: 450, status: "occupied" },
  { roomNumber: "303", roomType: "Garden suite", floor: 3, rate: 520, status: "available" },
  { roomNumber: "304", roomType: "Garden suite", floor: 3, rate: 520, status: "cleaning" },
  { roomNumber: "401", roomType: "Garden suite", floor: 4, rate: 550, status: "available" },
  { roomNumber: "402", roomType: "Garden suite", floor: 4, rate: 550, status: "occupied" },
  { roomNumber: "403", roomType: "Terrace suite", floor: 4, rate: 650, status: "available" },
  { roomNumber: "404", roomType: "Terrace suite", floor: 4, rate: 650, status: "occupied" },
];

export const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Reservations", icon: CalendarDays },
  { label: "Rooms", icon: BedDouble },
  { label: "Guests", icon: UsersRound },
  { label: "Reports", icon: BarChart3 },
] as const;

export const sectionPaths: Record<Section, string> = {
  Overview: "/",
  Reservations: "/reservations",
  Rooms: "/rooms",
  Guests: "/guests",
  Reports: "/reports",
};

export const initials = (name: string): string =>
  name
    .split(" ")
    .map(word => word[0])
    .slice(0, 2)
    .join("");

export const currency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const dateLabel = (value: string | Date): string =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const greetingForHour = (hour: number): string =>
  hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

export function getLocalDateString(val: string | Date = new Date()): string {
  if (!val) return "";
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return val.slice(0, 10);
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, "0");
    const day = String(val.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

export function deriveReservationStatus(
  checkIn: string | Date,
  checkOut: string | Date,
  now: Date = new Date()
): ReservationStatus {
  const todayStr = getLocalDateString(now);
  const inStr = getLocalDateString(checkIn);
  const outStr = getLocalDateString(checkOut);

  // 1. If the check out date is passed: status should be checked out
  if (todayStr >= outStr) {
    return "checked_out";
  }
  // 2. If present date is in between checkin and checkout: status should be checked in
  if (todayStr >= inStr && todayStr < outStr) {
    return "checked_in";
  }
  // 3. If booking date is future according to present date: status should be confirmed
  return "confirmed";
}

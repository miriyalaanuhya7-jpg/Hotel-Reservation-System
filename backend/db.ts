import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertReservation,
  Reservation,
  guests,
  reservations,
  rooms,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(
  user: typeof users.$inferInsert
): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { ...user, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { ...values };
  delete updateSet.openId;
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0];
}

export function isSameDate(
  d1: Date | string | null | undefined,
  d2: Date = new Date()
): boolean {
  if (!d1) return false;
  const a = new Date(d1);
  if (isNaN(a.getTime())) return false;
  if (
    a.getFullYear() === d2.getFullYear() &&
    a.getMonth() === d2.getMonth() &&
    a.getDate() === d2.getDate()
  ) {
    return true;
  }
  try {
    return a.toISOString().slice(0, 10) === d2.toISOString().slice(0, 10);
  } catch {
    return false;
  }
}

export function getLocalDateStringServer(val: string | Date = new Date()): string {
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

export function deriveReservationStatusServer(
  checkIn: string | Date,
  checkOut: string | Date,
  now: Date = new Date()
): "confirmed" | "checked_in" | "checked_out" | "pending" | "cancelled" {
  const todayStr = getLocalDateStringServer(now);
  const inStr = getLocalDateStringServer(checkIn);
  const outStr = getLocalDateStringServer(checkOut);

  if (todayStr >= outStr) return "checked_out";
  if (todayStr >= inStr && todayStr < outStr) return "checked_in";
  return "confirmed";
}

export const SIXTEEN_ROOMS = [
  // Floor 1
  {
    id: 1,
    roomNumber: "101",
    roomType: "Studio",
    floor: 1,
    status: "available" as const,
    rate: 250,
  },
  {
    id: 2,
    roomNumber: "102",
    roomType: "Studio",
    floor: 1,
    status: "cleaning" as const,
    rate: 250,
  },
  {
    id: 3,
    roomNumber: "103",
    roomType: "King room",
    floor: 1,
    status: "available" as const,
    rate: 320,
  },
  {
    id: 4,
    roomNumber: "104",
    roomType: "King room",
    floor: 1,
    status: "occupied" as const,
    rate: 320,
  },
  // Floor 2
  {
    id: 5,
    roomNumber: "201",
    roomType: "King room",
    floor: 2,
    status: "available" as const,
    rate: 340,
  },
  {
    id: 6,
    roomNumber: "202",
    roomType: "King room",
    floor: 2,
    status: "occupied" as const,
    rate: 340,
  },
  {
    id: 7,
    roomNumber: "203",
    roomType: "Deluxe suite",
    floor: 2,
    status: "available" as const,
    rate: 420,
  },
  {
    id: 8,
    roomNumber: "204",
    roomType: "Deluxe suite",
    floor: 2,
    status: "occupied" as const,
    rate: 420,
  },
  // Floor 3
  {
    id: 9,
    roomNumber: "301",
    roomType: "Deluxe suite",
    floor: 3,
    status: "available" as const,
    rate: 450,
  },
  {
    id: 10,
    roomNumber: "302",
    roomType: "Deluxe suite",
    floor: 3,
    status: "maintenance" as const,
    rate: 450,
  },
  {
    id: 11,
    roomNumber: "303",
    roomType: "Garden suite",
    floor: 3,
    status: "occupied" as const,
    rate: 520,
  },
  {
    id: 12,
    roomNumber: "304",
    roomType: "Garden suite",
    floor: 3,
    status: "available" as const,
    rate: 520,
  },
  // Floor 4
  {
    id: 13,
    roomNumber: "401",
    roomType: "Garden suite",
    floor: 4,
    status: "available" as const,
    rate: 550,
  },
  {
    id: 14,
    roomNumber: "402",
    roomType: "Garden suite",
    floor: 4,
    status: "occupied" as const,
    rate: 550,
  },
  {
    id: 15,
    roomNumber: "403",
    roomType: "Terrace suite",
    floor: 4,
    status: "available" as const,
    rate: 650,
  },
  {
    id: 16,
    roomNumber: "404",
    roomType: "Terrace suite",
    floor: 4,
    status: "occupied" as const,
    rate: 650,
  },
];

function getRelativeDate(offsetDays: number, hour = 14): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const fallbackDashboard = {
  summary: {
    occupancy: 38,
    arrivals: 2,
    departures: 2,
    revenue: 8430,
    availableRooms: 8,
    totalRooms: 16,
    occupiedRooms: 6,
  },
  reservations: [
    {
      id: 1,
      confirmationCode: "AS-4821",
      guestName: "Amelia Brooks",
      guestPhone: "+91 98765 43210",
      guestEmail: "amelia@example.com",
      roomNumber: "202",
      roomType: "King room",
      checkIn: getRelativeDate(0, 14), // Today arrival
      checkOut: getRelativeDate(3, 11),
      amount: 1020,
      status: "confirmed" as const,
      source: "Direct",
    },
    {
      id: 2,
      confirmationCode: "AS-4817",
      guestName: "Marcus Chen",
      guestPhone: "+91 98200 12345",
      guestEmail: "marcus@example.com",
      roomNumber: "404",
      roomType: "Terrace suite",
      checkIn: getRelativeDate(0, 15), // Today arrival
      checkOut: getRelativeDate(5, 11),
      amount: 3250,
      status: "confirmed" as const,
      source: "Booking.com",
    },
    {
      id: 3,
      confirmationCode: "AS-4812",
      guestName: "Sofia Laurent",
      guestPhone: "+91 97112 34567",
      guestEmail: "sofia@example.com",
      roomNumber: "104",
      roomType: "King room",
      checkIn: getRelativeDate(-3, 14),
      checkOut: getRelativeDate(0, 11), // Today departure
      amount: 960,
      status: "checked_in" as const,
      source: "Direct",
    },
    {
      id: 4,
      confirmationCode: "AS-4804",
      guestName: "Noah Williams",
      guestPhone: "+91 99887 76655",
      guestEmail: "noah@example.com",
      roomNumber: "204",
      roomType: "Deluxe suite",
      checkIn: getRelativeDate(-1, 14),
      checkOut: getRelativeDate(0, 10), // Today departure
      amount: 420,
      status: "checked_in" as const,
      source: "Expedia",
    },
    {
      id: 5,
      confirmationCode: "AS-4798",
      guestName: "Priya Shah",
      guestPhone: "+91 98111 22334",
      guestEmail: "priya@example.com",
      roomNumber: "303",
      roomType: "Garden suite",
      checkIn: getRelativeDate(-2, 14),
      checkOut: getRelativeDate(2, 11),
      amount: 2080,
      status: "checked_in" as const,
      source: "Direct",
    },
    {
      id: 6,
      confirmationCode: "AS-4780",
      guestName: "David Miller",
      guestPhone: "+91 98333 44556",
      guestEmail: "david@example.com",
      roomNumber: "402",
      roomType: "Garden suite",
      checkIn: getRelativeDate(1, 14), // Tomorrow
      checkOut: getRelativeDate(4, 11),
      amount: 1650,
      status: "pending" as const,
      source: "Booking.com",
    },
  ],
  rooms: SIXTEEN_ROOMS,
  guests: [
    {
      id: 1,
      name: "Amelia Brooks",
      email: "amelia@example.com",
      phone: "+91 98765 43210",
      vip: 1,
      stayCount: 3,
    },
    {
      id: 2,
      name: "Marcus Chen",
      email: "marcus@example.com",
      phone: "+91 98200 12345",
      vip: 0,
      stayCount: 2,
    },
    {
      id: 3,
      name: "Sofia Laurent",
      email: "sofia@example.com",
      phone: "+91 97112 34567",
      vip: 1,
      stayCount: 4,
    },
    {
      id: 4,
      name: "Noah Williams",
      email: "noah@example.com",
      phone: "+91 99887 76655",
      vip: 0,
      stayCount: 1,
    },
    {
      id: 5,
      name: "Priya Shah",
      email: "priya@example.com",
      phone: "+91 98111 22334",
      vip: 1,
      stayCount: 5,
    },
  ],
};

function getDynamicFallbackDashboard() {
  const mappedFallbackReservations = fallbackDashboard.reservations.map(r => {
    if ((r.status as string) !== "cancelled") {
      return {
        ...r,
        status: deriveReservationStatusServer(r.checkIn, r.checkOut),
      };
    }
    return r;
  });
  const fallbackOccupied = SIXTEEN_ROOMS.filter(r => r.status === "occupied").length;
  const fallbackTotal = SIXTEEN_ROOMS.length || 16;
  const fallbackAvailable = SIXTEEN_ROOMS.filter(r => r.status === "available").length;
  const fallbackOccupancy = fallbackTotal > 0 ? Math.round((fallbackOccupied / fallbackTotal) * 100) : 0;

  return {
    ...fallbackDashboard,
    summary: {
      ...fallbackDashboard.summary,
      occupancy: fallbackOccupancy,
      availableRooms: fallbackAvailable,
      totalRooms: fallbackTotal,
      occupiedRooms: fallbackOccupied,
    },
    reservations: mappedFallbackReservations,
    rooms: SIXTEEN_ROOMS,
  };
}

export async function getDashboardData() {
  const db = await getDb();
  if (!db) return getDynamicFallbackDashboard();
  try {
    const [reservationRows, roomRows, guestRows] = await Promise.all([
      db
        .select()
        .from(reservations)
        .orderBy(desc(reservations.createdAt))
        .limit(100),
      db.select().from(rooms).orderBy(rooms.floor, rooms.roomNumber),
      db.select().from(guests).orderBy(desc(guests.createdAt)).limit(50),
    ]);
    const allRooms = roomRows.length ? roomRows : SIXTEEN_ROOMS;
    const occupied = allRooms.filter(room => room.status === "occupied").length;
    const totalRooms = allRooms.length || 16;
    const availableRooms = allRooms.filter(
      room => room.status === "available"
    ).length;

    const activeReservations = reservationRows.filter(
      item => item.status !== "cancelled"
    );
    const arrivals = activeReservations.filter(item =>
      isSameDate(item.checkIn)
    ).length;
    const departures = activeReservations.filter(item =>
      isSameDate(item.checkOut)
    ).length;
    const revenue = activeReservations.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );

    const mappedReservationRows = reservationRows.map(r => {
      if (r.status !== "cancelled") {
        return {
          ...r,
          status: deriveReservationStatusServer(r.checkIn, r.checkOut),
        };
      }
      return r;
    });

    return {
      summary: {
        occupancy:
          totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
        arrivals,
        departures,
        revenue,
        availableRooms,
        totalRooms,
        occupiedRooms: occupied,
      },
      reservations: mappedReservationRows,
      rooms: allRooms,
      guests: guestRows,
    };
  } catch (error) {
    console.warn("[Database] Falling back to demo data:", error);
    return getDynamicFallbackDashboard();
  }
}

export async function createReservationRecord(
  input: Omit<InsertReservation, "confirmationCode"> & {
    confirmationCode?: string;
  }
) {
  const confirmationCode =
    input.confirmationCode ?? `AS-${Math.floor(1000 + Math.random() * 9000)}`;
  const status =
    input.status !== "cancelled"
      ? deriveReservationStatusServer(input.checkIn, input.checkOut)
      : input.status;
  const db = await getDb();
  if (!db) {
    const memoryRoom = SIXTEEN_ROOMS.find(r => r.roomNumber === input.roomNumber);
    if (
      memoryRoom &&
      (status === "confirmed" || status === "checked_in")
    ) {
      memoryRoom.status = "occupied";
    }
    return { ...input, status, id: Date.now(), confirmationCode };
  }
  await db.insert(reservations).values({ ...input, status, confirmationCode });
  if (
    input.roomNumber &&
    (status === "confirmed" || status === "checked_in")
  ) {
    try {
      await db
        .update(rooms)
        .set({ status: "occupied" })
        .where(eq(rooms.roomNumber, input.roomNumber));
    } catch (e) {
      console.warn("[Database] Could not update room status:", e);
    }
  }
  const rows = await db
    .select()
    .from(reservations)
    .where(eq(reservations.confirmationCode, confirmationCode))
    .limit(1);
  return rows[0];
}

export async function updateReservationStatusRecord(
  id: number,
  status: Reservation["status"]
) {
  const db = await getDb();
  if (!db) {
    const target = fallbackDashboard.reservations.find(r => r.id === id);
    if (target) {
      (target as { status: Reservation["status"] }).status = status;
      const memRoom = SIXTEEN_ROOMS.find(
        r => r.roomNumber === target.roomNumber
      );
      if (memRoom) {
        if (status === "checked_out") memRoom.status = "cleaning";
        else if (status === "cancelled") memRoom.status = "available";
        else if (status === "checked_in" || status === "confirmed")
          memRoom.status = "occupied";
      }
    }
    return { id, status };
  }
  await db.update(reservations).set({ status }).where(eq(reservations.id, id));
  try {
    const res = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);
    if (res[0]?.roomNumber) {
      let newRoomStatus: (typeof rooms.$inferSelect)["status"] | null = null;
      if (status === "checked_out") newRoomStatus = "cleaning";
      else if (status === "cancelled") newRoomStatus = "available";
      else if (status === "checked_in" || status === "confirmed")
        newRoomStatus = "occupied";
      if (newRoomStatus) {
        await db
          .update(rooms)
          .set({ status: newRoomStatus })
          .where(eq(rooms.roomNumber, res[0].roomNumber));
      }
    }
  } catch (e) {
    console.warn("[Database] Could not update room status:", e);
  }
  const rows = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  return rows[0];
}

export async function updateReservationRecord(
  id: number,
  input: Partial<InsertReservation>
) {
  const db = await getDb();
  if (!db) return { id, ...input };
  await db.update(reservations).set(input).where(eq(reservations.id, id));
  const rows = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  return rows[0];
}

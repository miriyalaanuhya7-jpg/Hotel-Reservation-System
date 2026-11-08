import "dotenv/config";
import { getDb, SIXTEEN_ROOMS } from "./db";
import { guests, reservations, rooms } from "../drizzle/schema";

export async function seed() {
  const db = await getDb();
  if (!db) {
    console.error(
      "[Seed] Could not connect to database. Check your DATABASE_URL in .env"
    );
    process.exit(1);
  }

  console.log("[Seed] Re-seeding hotel database with 4 floors and 16 rooms...");

  // Delete old rooms, reservations, guests for fresh 4-floor layout
  await db.delete(reservations);
  await db.delete(rooms);
  await db.delete(guests);

  console.log("[Seed] Seeding 16 rooms across 4 floors (4 rooms per floor)...");
  await db
    .insert(rooms)
    .values(SIXTEEN_ROOMS.map(({ id: _id, ...room }) => room));

  console.log("[Seed] Seeding guests...");
  await db.insert(guests).values([
    {
      name: "Amelia Brooks",
      email: "amelia@example.com",
      phone: "+91 98765 43210",
      vip: 1,
      stayCount: 3,
    },
    {
      name: "Marcus Chen",
      email: "marcus@example.com",
      phone: "+91 98200 12345",
      vip: 0,
      stayCount: 2,
    },
    {
      name: "Sofia Laurent",
      email: "sofia@example.com",
      phone: "+91 97112 34567",
      vip: 1,
      stayCount: 4,
    },
    {
      name: "Noah Williams",
      email: "noah@example.com",
      phone: "+91 99887 76655",
      vip: 0,
      stayCount: 1,
    },
    {
      name: "Priya Shah",
      email: "priya@example.com",
      phone: "+91 98111 22334",
      vip: 1,
      stayCount: 5,
    },
  ]);

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    14,
    0,
    0
  );
  const todayDeparture = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    11,
    0,
    0
  );
  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

  console.log(
    "[Seed] Seeding reservations with live today arrivals and departures..."
  );
  await db.insert(reservations).values([
    {
      confirmationCode: "AS-4821",
      guestName: "Amelia Brooks",
      guestPhone: "+91 98765 43210",
      guestEmail: "amelia@example.com",
      roomNumber: "202",
      roomType: "King room",
      checkIn: today, // Arrival today #1
      checkOut: inThreeDays,
      amount: 1020,
      status: "confirmed",
      source: "Direct",
    },
    {
      confirmationCode: "AS-4817",
      guestName: "Marcus Chen",
      guestPhone: "+91 98200 12345",
      guestEmail: "marcus@example.com",
      roomNumber: "404",
      roomType: "Terrace suite",
      checkIn: today, // Arrival today #2
      checkOut: inFiveDays,
      amount: 3250,
      status: "confirmed",
      source: "Booking.com",
    },
    {
      confirmationCode: "AS-4812",
      guestName: "Sofia Laurent",
      guestPhone: "+91 97112 34567",
      guestEmail: "sofia@example.com",
      roomNumber: "104",
      roomType: "King room",
      checkIn: threeDaysAgo,
      checkOut: todayDeparture, // Departure today #1
      amount: 960,
      status: "checked_in",
      source: "Direct",
    },
    {
      confirmationCode: "AS-4804",
      guestName: "Noah Williams",
      guestPhone: "+91 99887 76655",
      guestEmail: "noah@example.com",
      roomNumber: "204",
      roomType: "Deluxe suite",
      checkIn: yesterday,
      checkOut: todayDeparture, // Departure today #2
      amount: 420,
      status: "checked_in",
      source: "Expedia",
    },
    {
      confirmationCode: "AS-4798",
      guestName: "Priya Shah",
      guestPhone: "+91 98111 22334",
      guestEmail: "priya@example.com",
      roomNumber: "303",
      roomType: "Garden suite",
      checkIn: yesterday,
      checkOut: inThreeDays,
      amount: 2080,
      status: "checked_in",
      source: "Direct",
    },
    {
      confirmationCode: "AS-4780",
      guestName: "David Miller",
      guestPhone: "+91 98333 44556",
      guestEmail: "david@example.com",
      roomNumber: "402",
      roomType: "Garden suite",
      checkIn: tomorrow,
      checkOut: inThreeDays,
      amount: 1650,
      status: "pending",
      source: "Booking.com",
    },
  ]);

  console.log(
    "[Seed] Successfully seeded 16 rooms and today's arrivals & departures!"
  );
  process.exit(0);
}

seed().catch(err => {
  console.error("[Seed] Error seeding database:", err);
  process.exit(1);
});

import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import { deriveReservationStatusServer } from "../db";
import type { TrpcContext } from "../_core/context";

const ctx: TrpcContext = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("hotel dashboard", () => {
  it("returns the operational dashboard shape", async () => {
    const result = await appRouter.createCaller(ctx).hotel.dashboard();
    expect(result.summary).toMatchObject({
      occupancy: expect.any(Number),
      arrivals: expect.any(Number),
      departures: expect.any(Number),
      revenue: expect.any(Number),
    });
    expect(Array.isArray(result.reservations)).toBe(true);
    expect(Array.isArray(result.rooms)).toBe(true);
    expect(Array.isArray(result.guests)).toBe(true);
  });

  it("rejects a reservation without a guest name", async () => {
    await expect(
      appRouter.createCaller(ctx).hotel.createReservation({
        guestName: "x",
        guestEmail: "guest@example.com",
        roomNumber: "701",
        roomType: "Terrace suite",
        checkIn: "2026-09-22",
        checkOut: "2026-09-25",
        amount: 1485,
        status: "confirmed",
        source: "Direct",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid lifecycle statuses and invalid edit details", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.hotel.updateReservationStatus({
        id: 1,
        status: "invalid" as never,
      })
    ).rejects.toThrow();
    await expect(
      caller.hotel.updateReservation({
        id: 1,
        guestName: "x",
        guestEmail: "guest@example.com",
        roomNumber: "701",
        roomType: "Terrace suite",
        checkIn: "2026-09-22",
        checkOut: "2026-09-25",
        amount: 1485,
        status: "confirmed",
        source: "Direct",
      })
    ).rejects.toThrow();
  });

  it("creates a reservation and updates room status", async () => {
    const caller = appRouter.createCaller(ctx);
    const created = await caller.hotel.createReservation({
      guestName: "Sarah Connor",
      guestPhone: "+91 91234 56789",
      guestEmail: "sarah@example.com",
      roomNumber: "101",
      roomType: "Studio",
      checkIn: "2026-10-12",
      checkOut: "2026-10-15",
      amount: 750,
      status: "confirmed",
      source: "Direct",
    });

    expect(created).toBeDefined();
    expect(created.roomNumber).toBe("101");
    expect(created.confirmationCode).toMatch(/^AS-\d{4}$/);

    const dashboard = await caller.hotel.dashboard();
    const room101 = dashboard.rooms.find(r => r.roomNumber === "101");
    expect(room101?.status).toBe("occupied");
  });

  it("calculates occupancy percentage dynamically according to occupied rooms count", async () => {
    const caller = appRouter.createCaller(ctx);
    const dashboard = await caller.hotel.dashboard();
    const occupied = dashboard.rooms.filter(r => r.status === "occupied").length;
    const total = dashboard.rooms.length;
    const expectedRate = Math.round((occupied / total) * 100);
    expect(dashboard.summary.occupancy).toBe(expectedRate);
    expect(dashboard.summary.occupiedRooms).toBe(occupied);
  });

  it("derives status correctly based on present date and stay dates", () => {
    const presentDate = new Date("2026-10-12T12:00:00Z");

    // 1. Future booking date -> confirmed
    expect(
      deriveReservationStatusServer("2026-10-15", "2026-10-18", presentDate)
    ).toBe("confirmed");

    // 2. Present date is in between checkin and checkout -> checked_in
    expect(
      deriveReservationStatusServer("2026-10-12", "2026-10-15", presentDate)
    ).toBe("checked_in");
    expect(
      deriveReservationStatusServer("2026-10-10", "2026-10-15", presentDate)
    ).toBe("checked_in");

    // 3. Checkout date is passed -> checked_out
    expect(
      deriveReservationStatusServer("2026-10-05", "2026-10-10", presentDate)
    ).toBe("checked_out");
    expect(
      deriveReservationStatusServer("2026-10-08", "2026-10-12", presentDate)
    ).toBe("checked_out");
  });
});

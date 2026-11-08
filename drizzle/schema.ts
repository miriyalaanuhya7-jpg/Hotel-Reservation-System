import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  roomNumber: varchar("roomNumber", { length: 16 }).notNull().unique(),
  roomType: varchar("roomType", { length: 64 }).notNull(),
  floor: int("floor").notNull(),
  status: mysqlEnum("status", [
    "available",
    "occupied",
    "cleaning",
    "maintenance",
  ])
    .default("available")
    .notNull(),
  rate: int("rate").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const guests = mysqlTable("guests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  vip: int("vip").default(0).notNull(),
  stayCount: int("stayCount").default(1).notNull(),
  lastStayAt: timestamp("lastStayAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  confirmationCode: varchar("confirmationCode", { length: 24 })
    .notNull()
    .unique(),
  guestName: varchar("guestName", { length: 160 }).notNull(),
  guestPhone: varchar("guestPhone", { length: 32 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  roomNumber: varchar("roomNumber", { length: 16 }).notNull(),
  roomType: varchar("roomType", { length: 64 }).notNull(),
  checkIn: timestamp("checkIn").notNull(),
  checkOut: timestamp("checkOut").notNull(),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "checked_in",
    "checked_out",
    "cancelled",
  ])
    .default("confirmed")
    .notNull(),
  source: varchar("source", { length: 32 }).default("direct").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

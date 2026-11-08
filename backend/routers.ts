import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  createReservationRecord,
  getDashboardData,
  updateReservationRecord,
  updateReservationStatusRecord,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  hotel: router({
    dashboard: publicProcedure.query(() => getDashboardData()),
    createReservation: publicProcedure
      .input(
        z.object({
          guestName: z.string().min(2),
          guestPhone: z.string().optional().or(z.literal("")),
          guestEmail: z.string().email().optional().or(z.literal("")),
          roomNumber: z.string().min(1),
          roomType: z.string().min(1),
          checkIn: z.coerce.date(),
          checkOut: z.coerce.date(),
          amount: z.number().int().positive(),
          status: z
            .enum([
              "pending",
              "confirmed",
              "checked_in",
              "checked_out",
              "cancelled",
            ])
            .default("confirmed"),
          source: z.string().default("Direct"),
        })
      )
      .mutation(({ input }) => createReservationRecord(input)),
    updateReservationStatus: publicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum([
            "pending",
            "confirmed",
            "checked_in",
            "checked_out",
            "cancelled",
          ]),
        })
      )
      .mutation(({ input }) =>
        updateReservationStatusRecord(input.id, input.status)
      ),
    updateReservation: publicProcedure
      .input(
        z.object({
          id: z.number(),
          guestName: z.string().min(2),
          guestPhone: z.string().optional().or(z.literal("")),
          guestEmail: z.string().email().optional().or(z.literal("")),
          roomNumber: z.string().min(1),
          roomType: z.string().min(1),
          checkIn: z.coerce.date(),
          checkOut: z.coerce.date(),
          amount: z.number().int().positive(),
          status: z.enum([
            "pending",
            "confirmed",
            "checked_in",
            "checked_out",
            "cancelled",
          ]),
          source: z.string().min(1),
        })
      )
      .mutation(({ input }) => {
        const { id, ...changes } = input;
        return updateReservationRecord(id, changes);
      }),
  }),
});

export type AppRouter = typeof appRouter;

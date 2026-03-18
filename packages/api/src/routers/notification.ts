import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, protectedProcedure } from "../index";

type NotificationType =
  | "TRIP_CREATED"
  | "TRIP_DISPATCHED"
  | "TRIP_STARTED"
  | "TRIP_FINISHED"
  | "TRIP_CANCELLED"
  | "MAINTENANCE_DUE"
  | "LICENSE_EXPIRY"
  | "GENERAL";

/** Shared helper — call from any router to persist a notification */
export async function createNotification(data: {
  message: string;
  type: NotificationType;
  tripId?: string;
  driverId?: string;
  truckId?: string;
}) {
  return prisma.notification.create({ data });
}

export const notificationRouter = router({
  /** List notifications, newest first, with unread count */
  list: protectedProcedure
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(30),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 30;
      const cursor = input?.cursor;

      const [items, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          take: limit + 1,
          ...(cursor && { cursor: { id: cursor }, skip: 1 }),
          orderBy: { createdAt: "desc" },
          include: {
            driver: { include: { user: { select: { name: true } } } },
            truck: { select: { id: true, unitNumber: true } },
            trip: { select: { id: true, tripNumber: true } },
          },
        }),
        prisma.notification.count({ where: { read: false } }),
      ]);

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }

      return { items, nextCursor, unreadCount };
    }),

  /** Mark a single notification as read */
  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.notification.update({
        where: { id: input.id },
        data: { read: true },
      });
    }),

  /** Mark all notifications as read */
  markAllRead: protectedProcedure.mutation(async () => {
    return prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  }),

  /** Delete a single notification */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.notification.delete({ where: { id: input.id } });
    }),
});

import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, protectedProcedure } from "../index";

export const maintenanceRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
        type: z.enum(["SCHEDULED", "UNSCHEDULED", "INSPECTION"]).optional(),
        truckId: z.string().optional(),
        trailerId: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { status, type, truckId, trailerId, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(status && { status }),
        ...(type && { type }),
        ...(truckId && { truckId }),
        ...(trailerId && { trailerId }),
      };

      const items = await prisma.maintenanceLog.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { scheduledDate: "desc" },
        include: {
          truck: { select: { id: true, unitNumber: true, make: true, model: true } },
          trailer: { select: { id: true, unitNumber: true, type: true } },
        },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.maintenanceLog.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          truck: true,
          trailer: true,
        },
      });
    }),

  upcoming: protectedProcedure
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ input }) => {
      const days = input?.days ?? 30;
      const now = new Date();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      return prisma.maintenanceLog.findMany({
        where: {
          scheduledDate: { gte: now, lte: future },
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        },
        orderBy: { scheduledDate: "asc" },
        include: {
          truck: { select: { id: true, unitNumber: true, make: true, model: true } },
          trailer: { select: { id: true, unitNumber: true, type: true } },
        },
      });
    }),

  overdue: protectedProcedure.query(async () => {
    return prisma.maintenanceLog.findMany({
      where: {
        scheduledDate: { lt: new Date() },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
      orderBy: { scheduledDate: "asc" },
      include: {
        truck: { select: { id: true, unitNumber: true, make: true, model: true } },
        trailer: { select: { id: true, unitNumber: true, type: true } },
      },
    });
  }),

  create: dispatcherProcedure
    .input(
      z.object({
        type: z.enum(["SCHEDULED", "UNSCHEDULED", "INSPECTION"]),
        description: z.string().min(1),
        cost: z.number().min(0).default(0),
        mileageAtService: z.number().int().optional(),
        scheduledDate: z.string().transform((s) => new Date(s)),
        vendorName: z.string().optional(),
        truckId: z.string().optional(),
        trailerId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.maintenanceLog.create({ data: input });
    }),

  update: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["SCHEDULED", "UNSCHEDULED", "INSPECTION"]).optional(),
        description: z.string().min(1).optional(),
        cost: z.number().min(0).optional(),
        mileageAtService: z.number().int().optional(),
        scheduledDate: z.string().transform((s) => new Date(s)).optional(),
        completedDate: z.string().transform((s) => new Date(s)).optional().nullable(),
        status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
        vendorName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.maintenanceLog.update({ where: { id }, data });
    }),

  complete: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.maintenanceLog.update({
        where: { id: input.id },
        data: { status: "COMPLETED", completedDate: new Date() },
      });
    }),

  stats: protectedProcedure.query(async () => {
    const now = new Date();
    const [total, scheduled, inProgress, completed, overdue] = await Promise.all([
      prisma.maintenanceLog.count(),
      prisma.maintenanceLog.count({ where: { status: "SCHEDULED" } }),
      prisma.maintenanceLog.count({ where: { status: "IN_PROGRESS" } }),
      prisma.maintenanceLog.count({ where: { status: "COMPLETED" } }),
      prisma.maintenanceLog.count({
        where: { scheduledDate: { lt: now }, status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      }),
    ]);
    return { total, scheduled, inProgress, completed, overdue };
  }),

  delete: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.maintenanceLog.delete({ where: { id: input.id } });
    }),
});

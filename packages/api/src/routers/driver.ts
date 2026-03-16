import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, protectedProcedure } from "../index";

export const driverRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]).optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { status, search, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(status && { status }),
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { licenseNumber: { contains: search, mode: "insensitive" as const } },
            { phoneNumber: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const items = await prisma.driver.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          assignments: {
            where: { isCurrent: true },
            include: { truck: { select: { id: true, unitNumber: true, make: true, model: true } } },
          },
        },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return prisma.driver.findUniqueOrThrow({
      where: { userId: ctx.session.user.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        assignments: {
          orderBy: { startDate: "desc" },
          include: { truck: { select: { id: true, unitNumber: true, make: true, model: true } } },
        },
        hoursLogs: { orderBy: { date: "desc" }, take: 14 },
        trips: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { truck: { select: { unitNumber: true } } },
        },
        performanceScores: { orderBy: { period: "desc" }, take: 6 },
        incidents: { orderBy: { reportedAt: "desc" }, take: 5 },
      },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.driver.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          assignments: {
            orderBy: { startDate: "desc" },
            include: { truck: { select: { id: true, unitNumber: true, make: true, model: true } } },
          },
          hoursLogs: { orderBy: { date: "desc" }, take: 14 },
          trips: { orderBy: { createdAt: "desc" }, take: 10, include: { truck: { select: { unitNumber: true } } } },
          performanceScores: { orderBy: { period: "desc" }, take: 6 },
          incidents: { orderBy: { reportedAt: "desc" }, take: 5 },
        },
      });
    }),

  create: dispatcherProcedure
    .input(
      z.object({
        userId: z.string(),
        licenseNumber: z.string().min(1),
        licenseClass: z.string().min(1),
        licenseExpiry: z.string().transform((s) => new Date(s)),
        phoneNumber: z.string().min(1),
        hireDate: z.string().transform((s) => new Date(s)),
        medicalExpiryDate: z.string().transform((s) => new Date(s)).optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Update user role to DRIVER
      await prisma.user.update({
        where: { id: input.userId },
        data: { role: "DRIVER" },
      });
      return prisma.driver.create({ data: input });
    }),

  update: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        licenseNumber: z.string().min(1).optional(),
        licenseClass: z.string().min(1).optional(),
        licenseExpiry: z.string().transform((s) => new Date(s)).optional(),
        phoneNumber: z.string().min(1).optional(),
        medicalExpiryDate: z.string().transform((s) => new Date(s)).optional().nullable(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.driver.update({ where: { id }, data });
    }),

  updateStatus: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.driver.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  assignTruck: dispatcherProcedure
    .input(
      z.object({
        driverId: z.string(),
        truckId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // End any current assignments for this driver
      await prisma.driverAssignment.updateMany({
        where: { driverId: input.driverId, isCurrent: true },
        data: { isCurrent: false, endDate: new Date() },
      });

      return prisma.driverAssignment.create({
        data: {
          driverId: input.driverId,
          truckId: input.truckId,
          isCurrent: true,
        },
      });
    }),

  unassignTruck: dispatcherProcedure
    .input(z.object({ driverId: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.driverAssignment.updateMany({
        where: { driverId: input.driverId, isCurrent: true },
        data: { isCurrent: false, endDate: new Date() },
      });
    }),

  stats: protectedProcedure.query(async () => {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const [total, available, onTrip, offDuty, suspended, expiringLicenses] = await Promise.all([
      prisma.driver.count(),
      prisma.driver.count({ where: { status: "AVAILABLE" } }),
      prisma.driver.count({ where: { status: "ON_TRIP" } }),
      prisma.driver.count({ where: { status: "OFF_DUTY" } }),
      prisma.driver.count({ where: { status: "SUSPENDED" } }),
      prisma.driver.count({ where: { licenseExpiry: { lte: thirtyDays } } }),
    ]);
    return { total, available, onTrip, offDuty, suspended, expiringLicenses };
  }),

  logHours: protectedProcedure
    .input(
      z.object({
        driverId: z.string(),
        date: z.string().transform((s) => new Date(s)),
        drivingHrs: z.number().min(0).max(24),
        onDutyHrs: z.number().min(0).max(24),
        sleeperHrs: z.number().min(0).max(24),
        offDutyHrs: z.number().min(0).max(24),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.hoursOfServiceLog.create({ data: input });
    }),

  delete: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.driver.delete({ where: { id: input.id } });
    }),
});

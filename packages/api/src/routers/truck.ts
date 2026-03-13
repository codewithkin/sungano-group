import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, protectedProcedure } from "../index";

export const truckRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["AVAILABLE", "IN_TRANSIT", "MAINTENANCE", "OUT_OF_SERVICE"]).optional(),
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
            { unitNumber: { contains: search, mode: "insensitive" as const } },
            { make: { contains: search, mode: "insensitive" as const } },
            { model: { contains: search, mode: "insensitive" as const } },
            { licensePlate: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const items = await prisma.truck.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { unitNumber: "asc" },
        include: {
          assignments: {
            where: { isCurrent: true },
            include: { driver: { include: { user: { select: { name: true } } } } },
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

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.truck.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          assignments: {
            orderBy: { startDate: "desc" },
            include: { driver: { include: { user: { select: { name: true, email: true } } } } },
          },
          maintenanceLogs: { orderBy: { scheduledDate: "desc" }, take: 10 },
          documents: { orderBy: { createdAt: "desc" } },
          fuelLogs: { orderBy: { date: "desc" }, take: 10 },
        },
      });
    }),

  create: dispatcherProcedure
    .input(
      z.object({
        unitNumber: z.string().min(1),
        vin: z.string().min(1),
        make: z.string().min(1),
        model: z.string().min(1),
        year: z.number().int().min(1900).max(2030),
        licensePlate: z.string().min(1),
        fuelType: z.enum(["DIESEL", "PETROL", "LNG", "ELECTRIC"]).default("DIESEL"),
        tankCapacityLitres: z.number().positive(),
        mileage: z.number().int().min(0).default(0),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.truck.create({ data: input });
    }),

  update: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        unitNumber: z.string().min(1).optional(),
        make: z.string().min(1).optional(),
        model: z.string().min(1).optional(),
        year: z.number().int().optional(),
        licensePlate: z.string().min(1).optional(),
        fuelType: z.enum(["DIESEL", "PETROL", "LNG", "ELECTRIC"]).optional(),
        tankCapacityLitres: z.number().positive().optional(),
        mileage: z.number().int().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.truck.update({ where: { id }, data });
    }),

  updateStatus: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["AVAILABLE", "IN_TRANSIT", "MAINTENANCE", "OUT_OF_SERVICE"]),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.truck.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  stats: protectedProcedure.query(async () => {
    const [total, available, inTransit, maintenance, outOfService] = await Promise.all([
      prisma.truck.count(),
      prisma.truck.count({ where: { status: "AVAILABLE" } }),
      prisma.truck.count({ where: { status: "IN_TRANSIT" } }),
      prisma.truck.count({ where: { status: "MAINTENANCE" } }),
      prisma.truck.count({ where: { status: "OUT_OF_SERVICE" } }),
    ]);
    return { total, available, inTransit, maintenance, outOfService };
  }),

  delete: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.truck.delete({ where: { id: input.id } });
    }),
});

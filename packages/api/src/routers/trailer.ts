import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, protectedProcedure } from "../index";

export const trailerRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["AVAILABLE", "IN_TRANSIT", "MAINTENANCE", "OUT_OF_SERVICE"]).optional(),
        type: z.enum(["FLATBED", "REEFER", "DRY_VAN", "TANKER", "LOWBED", "CURTAIN_SIDE", "CONTAINER"]).optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { status, type, search, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(status && { status }),
        ...(type && { type }),
        ...(search && {
          OR: [
            { unitNumber: { contains: search, mode: "insensitive" as const } },
            { licensePlate: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const items = await prisma.trailer.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { unitNumber: "asc" },
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
      return prisma.trailer.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          maintenanceLogs: { orderBy: { scheduledDate: "desc" }, take: 10 },
          documents: { orderBy: { createdAt: "desc" } },
          trips: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      });
    }),

  create: dispatcherProcedure
    .input(
      z.object({
        type: z.enum(["FLATBED", "REEFER", "DRY_VAN", "TANKER", "LOWBED", "CURTAIN_SIDE", "CONTAINER"]),
        capacityTonnes: z.number().positive(),
        licensePlate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const count = await prisma.trailer.count();
      const unitNumber = `TRL-${String(count + 1).padStart(3, "0")}`;
      return prisma.trailer.create({
        data: { ...input, unitNumber, licensePlate: input.licensePlate ?? "" },
        select: { id: true, unitNumber: true, licensePlate: true, capacityTonnes: true },
      });
    }),

  update: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        unitNumber: z.string().min(1).optional(),
        type: z.enum(["FLATBED", "REEFER", "DRY_VAN", "TANKER", "LOWBED", "CURTAIN_SIDE", "CONTAINER"]).optional(),
        capacityTonnes: z.number().positive().optional(),
        licensePlate: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.trailer.update({ where: { id }, data });
    }),

  updateStatus: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["AVAILABLE", "IN_TRANSIT", "MAINTENANCE", "OUT_OF_SERVICE"]),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.trailer.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  stats: protectedProcedure.query(async () => {
    const [total, available, inTransit, maintenance, outOfService] = await Promise.all([
      prisma.trailer.count(),
      prisma.trailer.count({ where: { status: "AVAILABLE" } }),
      prisma.trailer.count({ where: { status: "IN_TRANSIT" } }),
      prisma.trailer.count({ where: { status: "MAINTENANCE" } }),
      prisma.trailer.count({ where: { status: "OUT_OF_SERVICE" } }),
    ]);
    return { total, available, inTransit, maintenance, outOfService };
  }),

  delete: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.trailer.delete({ where: { id: input.id } });
    }),
});

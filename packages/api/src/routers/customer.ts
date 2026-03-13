import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, protectedProcedure } from "../index";

export const customerRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { search, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const items = await prisma.customer.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { name: "asc" },
        include: {
          _count: { select: { shipments: true } },
        },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }

      return { items, nextCursor };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.customer.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          shipments: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          _count: { select: { shipments: true } },
        },
      });
    }),

  create: dispatcherProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.customer.create({ data: input });
    }),

  update: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.customer.update({ where: { id }, data });
    }),

  stats: protectedProcedure.query(async () => {
    const total = await prisma.customer.count();
    const withActiveShipments = await prisma.customer.count({
      where: {
        shipments: {
          some: { status: { in: ["PENDING", "ASSIGNED", "IN_TRANSIT", "PICKED_UP"] } },
        },
      },
    });
    const recentlyAdded = await prisma.customer.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });
    return { total, withActiveShipments, recentlyAdded };
  }),

  delete: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.customer.delete({ where: { id: input.id } });
    }),
});

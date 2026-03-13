import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, protectedProcedure } from "../index";

function generateRefNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SG-${ts}-${rand}`;
}

export const shipmentRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum(["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"])
            .optional(),
          customerId: z.string().optional(),
          search: z.string().optional(),
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { status, customerId, search, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(status && { status }),
        ...(customerId && { customerId }),
        ...(search && {
          OR: [
            { referenceNumber: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { pickupAddress: { contains: search, mode: "insensitive" as const } },
            { deliveryAddress: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const items = await prisma.shipment.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true } },
          trip: { select: { id: true, tripNumber: true, status: true } },
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
      return prisma.shipment.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          customer: true,
          trip: {
            include: {
              driver: { include: { user: { select: { name: true } } } },
              truck: { select: { id: true, unitNumber: true, make: true, model: true } },
            },
          },
          stops: { orderBy: { sequence: "asc" } },
          statusUpdates: { orderBy: { createdAt: "desc" }, take: 20 },
        },
      });
    }),

  unassigned: protectedProcedure.query(async () => {
    return prisma.shipment.findMany({
      where: { status: "PENDING", tripId: null },
      orderBy: { requestedPickup: "asc" },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });
  }),

  create: dispatcherProcedure
    .input(
      z.object({
        customerId: z.string(),
        description: z.string().min(1),
        weight: z.number().optional(),
        volume: z.number().optional(),
        specialInstructions: z.string().optional(),
        pickupAddress: z.string().min(1),
        deliveryAddress: z.string().min(1),
        requestedPickup: z.string(),
        requestedDelivery: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.shipment.create({
        data: {
          ...input,
          referenceNumber: generateRefNumber(),
          requestedPickup: new Date(input.requestedPickup),
          requestedDelivery: new Date(input.requestedDelivery),
        },
      });
    }),

  update: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        weight: z.number().optional(),
        volume: z.number().optional(),
        specialInstructions: z.string().optional(),
        pickupAddress: z.string().optional(),
        deliveryAddress: z.string().optional(),
        requestedPickup: z.string().optional(),
        requestedDelivery: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, requestedPickup, requestedDelivery, ...rest } = input;
      return prisma.shipment.update({
        where: { id },
        data: {
          ...rest,
          ...(requestedPickup && { requestedPickup: new Date(requestedPickup) }),
          ...(requestedDelivery && { requestedDelivery: new Date(requestedDelivery) }),
        },
      });
    }),

  updateStatus: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"]),
      })
    )
    .mutation(async ({ input }) => {
      const data: Record<string, unknown> = { status: input.status };
      if (input.status === "PICKED_UP") data.actualPickup = new Date();
      if (input.status === "DELIVERED") data.actualDelivery = new Date();
      return prisma.shipment.update({ where: { id: input.id }, data });
    }),

  stats: protectedProcedure.query(async () => {
    const [total, pending, inTransit, delivered, cancelled] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: "PENDING" } }),
      prisma.shipment.count({ where: { status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] } } }),
      prisma.shipment.count({ where: { status: "DELIVERED" } }),
      prisma.shipment.count({ where: { status: "CANCELLED" } }),
    ]);
    return { total, pending, inTransit, delivered, cancelled };
  }),

  delete: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.shipment.delete({ where: { id: input.id } });
    }),
});

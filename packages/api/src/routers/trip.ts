import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, managerProcedure, protectedProcedure } from "../index";

function generateTripNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TR-${ts}-${rand}`;
}

export const tripRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["PLANNED", "DISPATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
          driverId: z.string().optional(),
          truckId: z.string().optional(),
          search: z.string().optional(),
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { status, driverId, truckId, search, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(status && { status }),
        ...(driverId && { driverId }),
        ...(truckId && { truckId }),
        ...(search && {
          OR: [
            { tripNumber: { contains: search, mode: "insensitive" as const } },
            { notes: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const items = await prisma.trip.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { plannedStartTime: "desc" },
        include: {
          driver: { include: { user: { select: { name: true } } } },
          truck: { select: { id: true, unitNumber: true, make: true, model: true } },
          trailer: { select: { id: true, unitNumber: true, type: true } },
          _count: { select: { shipments: true, stops: true } },
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
      return prisma.trip.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          driver: { include: { user: { select: { name: true, email: true } } } },
          truck: true,
          trailer: true,
          shipments: {
            include: { customer: { select: { id: true, name: true } } },
            orderBy: { createdAt: "asc" },
          },
          stops: { orderBy: { sequence: "asc" } },
          fuelLogs: { orderBy: { date: "desc" } },
          expenses: { orderBy: { date: "desc" } },
          statusUpdates: { orderBy: { createdAt: "desc" }, take: 30 },
        },
      });
    }),

  /** Create a trip and optionally assign shipments to it */
  create: dispatcherProcedure
    .input(
      z.object({
        driverId: z.string(),
        truckId: z.string(),
        trailerId: z.string().optional(),
        plannedStartTime: z.string(),
        plannedEndTime: z.string(),
        plannedDistanceKm: z.number().optional(),
        notes: z.string().optional(),
        shipmentIds: z.array(z.string()).optional(),
        stops: z
          .array(
            z.object({
              sequence: z.number(),
              type: z.enum(["PICKUP", "DELIVERY", "FUEL", "REST", "INSPECTION"]),
              address: z.string(),
              shipmentId: z.string().optional(),
              plannedArrival: z.string().optional(),
              plannedDeparture: z.string().optional(),
              notes: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { shipmentIds, stops, ...tripData } = input;

      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          tripNumber: generateTripNumber(),
          plannedStartTime: new Date(tripData.plannedStartTime),
          plannedEndTime: new Date(tripData.plannedEndTime),
          ...(stops && {
            stops: {
              create: stops.map((s) => ({
                ...s,
                plannedArrival: s.plannedArrival ? new Date(s.plannedArrival) : undefined,
                plannedDeparture: s.plannedDeparture ? new Date(s.plannedDeparture) : undefined,
              })),
            },
          }),
        },
      });

      // Assign shipments to this trip
      if (shipmentIds && shipmentIds.length > 0) {
        await prisma.shipment.updateMany({
          where: { id: { in: shipmentIds } },
          data: { tripId: trip.id, status: "ASSIGNED" },
        });
      }

      return trip;
    }),

  /** Dispatch – start a trip */
  dispatch: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.trip.update({
        where: { id: input.id },
        data: { status: "DISPATCHED" },
      });
    }),

  /** Start trip (driver begins driving) */
  start: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.trip.update({
        where: { id: input.id },
        data: { status: "IN_PROGRESS", actualStartTime: new Date() },
      });
    }),

  /** Complete a trip */
  complete: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        actualDistanceKm: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.trip.update({
        where: { id: input.id },
        data: {
          status: "COMPLETED",
          actualEndTime: new Date(),
          ...(input.actualDistanceKm && { actualDistanceKm: input.actualDistanceKm }),
        },
      });
    }),

  /** Cancel a trip */
  cancel: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Unassign shipments
      await prisma.shipment.updateMany({
        where: { tripId: input.id },
        data: { tripId: null, status: "PENDING" },
      });
      return prisma.trip.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });
    }),

  /** Update stop status */
  updateStop: dispatcherProcedure
    .input(
      z.object({
        stopId: z.string(),
        status: z.enum(["PENDING", "EN_ROUTE", "ARRIVED", "COMPLETED", "SKIPPED"]),
      })
    )
    .mutation(async ({ input }) => {
      const data: Record<string, unknown> = { status: input.status };
      if (input.status === "ARRIVED") data.actualArrival = new Date();
      if (input.status === "COMPLETED") data.actualDeparture = new Date();
      return prisma.stop.update({ where: { id: input.stopId }, data });
    }),

  stats: protectedProcedure.query(async () => {
    const [total, planned, dispatched, inProgress, completed, cancelled] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({ where: { status: "PLANNED" } }),
      prisma.trip.count({ where: { status: "DISPATCHED" } }),
      prisma.trip.count({ where: { status: "IN_PROGRESS" } }),
      prisma.trip.count({ where: { status: "COMPLETED" } }),
      prisma.trip.count({ where: { status: "CANCELLED" } }),
    ]);
    return { total, planned, dispatched, inProgress, completed, cancelled };
  }),

  delete: dispatcherProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Unassign shipments first
      await prisma.shipment.updateMany({
        where: { tripId: input.id },
        data: { tripId: null, status: "PENDING" },
      });
      return prisma.trip.delete({ where: { id: input.id } });
    }),
});

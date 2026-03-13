import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, protectedProcedure } from "../index";

export const analyticsRouter = router({
  /* ─── Performance Scores ─── */
  performanceScores: protectedProcedure
    .input(
      z
        .object({
          driverId: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { driverId, limit = 20 } = input ?? {};
      return prisma.performanceScore.findMany({
        where: { ...(driverId && { driverId }) },
        take: limit,
        orderBy: { period: "desc" },
        include: {
          driver: { include: { user: { select: { name: true } } } },
        },
      });
    }),

  recordPerformance: dispatcherProcedure
    .input(
      z.object({
        driverId: z.string(),
        period: z.string(),
        onTimeDeliveryPct: z.number().min(0).max(100),
        fuelEfficiency: z.number().optional(),
        safetyScore: z.number().min(0).max(100).optional(),
        hoursCompliance: z.number().min(0).max(100).optional(),
        customerRating: z.number().min(0).max(5).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.performanceScore.upsert({
        where: {
          driverId_period: {
            driverId: input.driverId,
            period: new Date(input.period),
          },
        },
        update: {
          onTimeDeliveryPct: input.onTimeDeliveryPct,
          fuelEfficiency: input.fuelEfficiency,
          safetyScore: input.safetyScore,
          hoursCompliance: input.hoursCompliance,
          customerRating: input.customerRating,
        },
        create: {
          ...input,
          period: new Date(input.period),
        },
      });
    }),

  /* ─── Fleet-wide KPIs ─── */
  kpis: protectedProcedure.query(async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalTrips,
      completedTrips,
      totalShipments,
      deliveredShipments,
      activeDrivers,
      availableTrucks,
      openIncidents,
    ] = await Promise.all([
      prisma.trip.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.trip.count({ where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } } }),
      prisma.shipment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.shipment.count({ where: { status: "DELIVERED", createdAt: { gte: thirtyDaysAgo } } }),
      prisma.driver.count({ where: { status: "ACTIVE" } }),
      prisma.truck.count({ where: { status: "AVAILABLE" } }),
      prisma.incident.count({ where: { resolvedAt: null } }),
    ]);

    const tripCompletionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;
    const deliveryRate = totalShipments > 0 ? Math.round((deliveredShipments / totalShipments) * 100) : 0;

    return {
      totalTrips,
      completedTrips,
      tripCompletionRate,
      totalShipments,
      deliveredShipments,
      deliveryRate,
      activeDrivers,
      availableTrucks,
      openIncidents,
    };
  }),

  /** Average performance across all drivers for the latest period */
  averagePerformance: protectedProcedure.query(async () => {
    const agg = await prisma.performanceScore.aggregate({
      _avg: {
        onTimeDeliveryPct: true,
        fuelEfficiency: true,
        safetyScore: true,
        hoursCompliance: true,
        customerRating: true,
      },
      _count: true,
    });
    return {
      count: agg._count,
      avg: {
        onTimeDelivery: agg._avg.onTimeDeliveryPct ?? 0,
        fuelEfficiency: agg._avg.fuelEfficiency ?? 0,
        safety: agg._avg.safetyScore ?? 0,
        hoursCompliance: agg._avg.hoursCompliance ?? 0,
        customerRating: agg._avg.customerRating ?? 0,
      },
    };
  }),

  /* ─── Incidents ─── */
  incidents: protectedProcedure
    .input(
      z
        .object({
          severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
          type: z.enum(["ACCIDENT", "BREAKDOWN", "DELAY", "COMPLIANCE", "THEFT", "WEATHER", "OTHER"]).optional(),
          resolved: z.boolean().optional(),
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { severity, type, resolved, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(severity && { severity }),
        ...(type && { type }),
        ...(resolved !== undefined && {
          resolvedAt: resolved ? { not: null } : null,
        }),
      };
      const items = await prisma.incident.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { reportedAt: "desc" },
        include: {
          driver: { include: { user: { select: { name: true } } } },
          truck: { select: { id: true, unitNumber: true } },
        },
      });
      let nextCursor: string | undefined;
      if (items.length > limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }
      return { items, nextCursor };
    }),

  incidentById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.incident.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          driver: { include: { user: { select: { name: true } } } },
          truck: true,
        },
      });
    }),

  reportIncident: dispatcherProcedure
    .input(
      z.object({
        driverId: z.string().optional(),
        truckId: z.string().optional(),
        type: z.enum(["ACCIDENT", "BREAKDOWN", "DELAY", "COMPLIANCE", "THEFT", "WEATHER", "OTHER"]),
        severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        description: z.string().min(1),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.incident.create({ data: input });
    }),

  resolveIncident: dispatcherProcedure
    .input(
      z.object({
        id: z.string(),
        resolution: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.incident.update({
        where: { id: input.id },
        data: { resolvedAt: new Date(), resolution: input.resolution },
      });
    }),

  incidentStats: protectedProcedure.query(async () => {
    const [total, open, bySeverity, byType] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({ where: { resolvedAt: null } }),
      prisma.incident.groupBy({
        by: ["severity"],
        where: { resolvedAt: null },
        _count: true,
      }),
      prisma.incident.groupBy({
        by: ["type"],
        _count: true,
      }),
    ]);
    return {
      total,
      open,
      resolved: total - open,
      bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: s._count })),
      byType: byType.map((t) => ({ type: t.type, count: t._count })),
    };
  }),
});

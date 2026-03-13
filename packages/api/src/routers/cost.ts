import { z } from "zod";
import prisma from "@sungano-group/db";
import { router, dispatcherProcedure, protectedProcedure } from "../index";

export const costRouter = router({
  /* ─── Fuel Logs ─── */
  fuelLogs: protectedProcedure
    .input(
      z
        .object({
          truckId: z.string().optional(),
          tripId: z.string().optional(),
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { truckId, tripId, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(truckId && { truckId }),
        ...(tripId && { tripId }),
      };
      const items = await prisma.fuelLog.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { date: "desc" },
        include: {
          truck: { select: { id: true, unitNumber: true, make: true, model: true } },
          trip: { select: { id: true, tripNumber: true } },
        },
      });
      let nextCursor: string | undefined;
      if (items.length > limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }
      return { items, nextCursor };
    }),

  createFuelLog: dispatcherProcedure
    .input(
      z.object({
        truckId: z.string(),
        tripId: z.string().optional(),
        litres: z.number().positive(),
        costPerLitre: z.number().positive(),
        totalCost: z.number().positive(),
        mileageAt: z.number().int().positive(),
        station: z.string().optional(),
        date: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.fuelLog.create({
        data: { ...input, date: new Date(input.date) },
      });
    }),

  /* ─── Expenses ─── */
  expenses: protectedProcedure
    .input(
      z
        .object({
          category: z
            .enum(["FUEL", "TOLLS", "MAINTENANCE", "ACCOMMODATION", "FINES", "PERMITS", "OTHER"])
            .optional(),
          tripId: z.string().optional(),
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { category, tripId, cursor, limit = 20 } = input ?? {};
      const where = {
        ...(category && { category }),
        ...(tripId && { tripId }),
      };
      const items = await prisma.expense.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { date: "desc" },
        include: {
          trip: { select: { id: true, tripNumber: true } },
        },
      });
      let nextCursor: string | undefined;
      if (items.length > limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }
      return { items, nextCursor };
    }),

  createExpense: dispatcherProcedure
    .input(
      z.object({
        tripId: z.string().optional(),
        category: z.enum(["FUEL", "TOLLS", "MAINTENANCE", "ACCOMMODATION", "FINES", "PERMITS", "OTHER"]),
        description: z.string().min(1),
        amount: z.number().positive(),
        date: z.string(),
        receiptUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.expense.create({
        data: { ...input, date: new Date(input.date) },
      });
    }),

  /* ─── Aggregations ─── */
  summary: protectedProcedure
    .input(
      z
        .object({
          /** ISO date strings for range filtering */
          from: z.string().optional(),
          to: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const from = input?.from ? new Date(input.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = input?.to ? new Date(input.to) : new Date();
      const dateFilter = { date: { gte: from, lte: to } };

      const [fuelAgg, expenseAgg, expenseByCategory, maintenanceCost] = await Promise.all([
        prisma.fuelLog.aggregate({
          where: dateFilter,
          _sum: { totalCost: true, litres: true },
          _count: true,
        }),
        prisma.expense.aggregate({
          where: dateFilter,
          _sum: { amount: true },
          _count: true,
        }),
        prisma.expense.groupBy({
          by: ["category"],
          where: dateFilter,
          _sum: { amount: true },
          _count: true,
        }),
        prisma.maintenanceLog.aggregate({
          where: { scheduledDate: { gte: from, lte: to }, status: "COMPLETED" },
          _sum: { cost: true },
          _count: true,
        }),
      ]);

      const totalFuel = fuelAgg._sum.totalCost ?? 0;
      const totalExpenses = expenseAgg._sum.amount ?? 0;
      const totalMaintenance = maintenanceCost._sum.cost ?? 0;
      const grandTotal = totalFuel + totalExpenses + totalMaintenance;

      return {
        period: { from: from.toISOString(), to: to.toISOString() },
        fuel: {
          totalCost: totalFuel,
          totalLitres: fuelAgg._sum.litres ?? 0,
          count: fuelAgg._count,
        },
        expenses: {
          total: totalExpenses,
          count: expenseAgg._count,
          byCategory: expenseByCategory.map((c) => ({
            category: c.category,
            total: c._sum.amount ?? 0,
            count: c._count,
          })),
        },
        maintenance: {
          total: totalMaintenance,
          count: maintenanceCost._count,
        },
        grandTotal,
      };
    }),

  /** Monthly cost breakdown for charting */
  monthlyCosts: protectedProcedure
    .input(
      z
        .object({ months: z.number().min(1).max(24).default(6) })
        .optional()
    )
    .query(async ({ input }) => {
      const months = input?.months ?? 6;
      const results: { month: string; fuel: number; expenses: number; maintenance: number; total: number }[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const start = new Date();
        start.setMonth(start.getMonth() - i, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const [fuel, exp, maint] = await Promise.all([
          prisma.fuelLog.aggregate({ where: { date: { gte: start, lt: end } }, _sum: { totalCost: true } }),
          prisma.expense.aggregate({ where: { date: { gte: start, lt: end } }, _sum: { amount: true } }),
          prisma.maintenanceLog.aggregate({
            where: { scheduledDate: { gte: start, lt: end }, status: "COMPLETED" },
            _sum: { cost: true },
          }),
        ]);

        const fuelCost = fuel._sum.totalCost ?? 0;
        const expCost = exp._sum.amount ?? 0;
        const maintCost = maint._sum.cost ?? 0;

        results.push({
          month: start.toLocaleDateString("en-ZA", { year: "numeric", month: "short" }),
          fuel: fuelCost,
          expenses: expCost,
          maintenance: maintCost,
          total: fuelCost + expCost + maintCost,
        });
      }

      return results;
    }),
});

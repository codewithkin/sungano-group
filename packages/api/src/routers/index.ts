import { protectedProcedure, publicProcedure, router } from "../index";
import { truckRouter } from "./truck";
import { trailerRouter } from "./trailer";
import { maintenanceRouter } from "./maintenance";
import { driverRouter } from "./driver";
import { customerRouter } from "./customer";
import { shipmentRouter } from "./shipment";
import { tripRouter } from "./trip";
import { costRouter } from "./cost";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  truck: truckRouter,
  trailer: trailerRouter,
  maintenance: maintenanceRouter,
  driver: driverRouter,
  customer: customerRouter,
  shipment: shipmentRouter,
  trip: tripRouter,
  cost: costRouter,
});
export type AppRouter = typeof appRouter;

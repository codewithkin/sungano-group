import { protectedProcedure, publicProcedure, router } from "../index";
import { truckRouter } from "./truck";
import { trailerRouter } from "./trailer";
import { maintenanceRouter } from "./maintenance";

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
});
export type AppRouter = typeof appRouter;

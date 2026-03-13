import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

function createRoleProcedure(allowedRoles: string[]) {
  return protectedProcedure.use(({ ctx, next }) => {
    const userRole = (ctx.session.user as Record<string, unknown>).role as string | undefined;
    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }
    return next({ ctx });
  });
}

export const adminProcedure = createRoleProcedure(["ADMIN"]);
export const dispatcherProcedure = createRoleProcedure(["ADMIN", "DISPATCHER"]);
export const driverProcedure = createRoleProcedure(["ADMIN", "DISPATCHER", "DRIVER"]);

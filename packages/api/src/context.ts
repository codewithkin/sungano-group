import type { Context as HonoContext } from "hono";
import { authenticate } from "@sungano-group/auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const authResult = await authenticate(context.req.raw.headers);
  const session = authResult
    ? {
        user: {
          id: authResult.user.id,
          role: authResult.user.role,
          username: authResult.user.username,
          name: authResult.user.name ?? undefined,
          email: authResult.user.email ?? undefined,
        },
        token: authResult.token,
      }
    : null;

  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

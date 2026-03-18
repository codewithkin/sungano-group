import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@sungano-group/api/context";
import { appRouter } from "@sungano-group/api/routers/index";
import { JWT_COOKIE, authenticate, signAuthToken, verifyPassword } from "@sungano-group/auth";
import { env } from "@sungano-group/env/server";
import prisma from "@sungano-group/db";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { setCookie, deleteCookie } from "hono/cookie";

const app = new Hono();

app.use(logger());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposeHeaders: ["Content-Length"],
  }),
);

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const username = body?.username as string | undefined;
  const password = body?.password as string | undefined;

  if (!username || !password) {
    return c.json({ message: "Username and password required" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return c.json({ message: "Invalid credentials" }, 401);

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return c.json({ message: "Invalid credentials" }, 401);

  const token = await signAuthToken({ userId: user.id, role: user.role, username: user.username });

  setCookie(c, JWT_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  });

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
    },
  });
});

app.post("/api/auth/logout", (c) => {
  deleteCookie(c, JWT_COOKIE, { path: "/" });
  return c.json({ message: "Logged out" });
});

app.get("/api/auth/me", async (c) => {
  const authResult = await authenticate(c.req.raw.headers);
  if (!authResult) return c.json({ user: null }, 401);

  return c.json({
    user: {
      id: authResult.user.id,
      username: authResult.user.username,
      role: authResult.user.role,
      name: authResult.user.name,
      email: authResult.user.email,
    },
    token: authResult.token,
  });
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;

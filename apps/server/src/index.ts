import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@sungano-group/api/context";
import { appRouter } from "@sungano-group/api/routers/index";
import { JWT_COOKIE, authenticate, signAuthToken, verifyPassword } from "@sungano-group/auth";
import { env } from "@sungano-group/env/server";
import prisma from "@sungano-group/db";
import { createPresignedUploadUrl, isAllowedMimeType } from "@sungano-group/upload/server";
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

app.post("/api/upload/presign", async (c) => {
  const authResult = await authenticate(c.req.raw.headers);
  if (!authResult) return c.json({ message: "Unauthorized" }, 401);

  const body = await c.req.json().catch(() => null);
  const filename = body?.filename as string | undefined;
  const mimeType = body?.mimeType as string | undefined;
  const folder = (body?.folder as string | undefined) ?? "uploads";

  if (!filename || !mimeType) {
    return c.json({ message: "filename and mimeType are required" }, 400);
  }
  if (!isAllowedMimeType(mimeType)) {
    return c.json({ message: `File type "${mimeType}" is not allowed.` }, 400);
  }

  try {
    const result = await createPresignedUploadUrl(
      {
        accountId: env.R2_ACCOUNT_ID,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucketName: env.R2_BUCKET_NAME,
        publicUrl: env.R2_PUBLIC_URL,
      },
      filename,
      mimeType,
      folder,
    );
    return c.json(result);
  } catch (err) {
    return c.json({ message: err instanceof Error ? err.message : "Presign failed" }, 500);
  }
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

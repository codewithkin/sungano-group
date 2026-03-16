import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import prisma from "@sungano-group/db";
import { env } from "@sungano-group/env/server";

export type AuthRole = "ADMIN" | "MANAGER" | "STAFF" | "DRIVER";

export type AuthTokenPayload = JWTPayload & {
  sub: string;
  role: AuthRole;
  username: string;
};

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN ?? "7d";
export const JWT_COOKIE = "sg_token";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signAuthToken(payload: { userId: string; role: AuthRole; username: string }) {
  return new SignJWT({ role: payload.role, username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<AuthTokenPayload>(token, JWT_SECRET);
    return payload;
  } catch (err) {
    console.error("verifyAuthToken error", err);
    return null;
  }
}

export async function authenticate(headers: Headers) {
  const bearer = headers.get("authorization") ?? headers.get("Authorization");
  const cookie = headers.get("cookie") ?? headers.get("Cookie");

  let token: string | undefined;
  if (bearer?.startsWith("Bearer ")) {
    token = bearer.substring("Bearer ".length);
  }
  if (!token && cookie) {
    const match = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${JWT_COOKIE}=`));
    if (match) token = match.split("=")[1];
  }

  if (!token) return null;
  const payload = await verifyAuthToken(token);
  if (!payload?.sub) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return null;

  return {
    user,
    token,
  } as const;
}

import { env } from "@sungano-group/env/web";

const baseURL = env.NEXT_PUBLIC_SERVER_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  // Read raw response body as text first so we can extract meaningful
  // error messages when the server returns JSON like { message: "..." }.
  const text = await res.text();

  // Try to parse JSON if present.
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    // Prefer `message` field when the server returned structured JSON.
    const message = (typeof data === "object" && data !== null && "message" in (data as any))
      ? (data as any).message
      : (typeof data === "string" ? data : undefined);

    throw new Error(message || "Request failed");
  }

  // Successful response: return parsed JSON when available, otherwise return raw text.
  return (data !== undefined ? data : (undefined as unknown)) as T;
}

export function login(payload: { username: string; password: string }) {
  return fetch(`${baseURL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  }).then((res) => handleResponse<{ token: string; user: unknown }>(res));
}

export function logout() {
  return fetch(`${baseURL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).then((res) => handleResponse<{ message: string }>(res));
}

export function getCurrentUser() {
  return fetch(`${baseURL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
  }).then((res) => handleResponse<{ user: unknown; token?: string }>(res));
}

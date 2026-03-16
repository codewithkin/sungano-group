import { env } from "@sungano-group/env/web";

const baseURL = env.NEXT_PUBLIC_SERVER_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }
  return res.json() as Promise<T>;
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

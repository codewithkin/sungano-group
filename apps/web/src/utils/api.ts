const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

async function request<T = unknown>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(`${baseURL}${url}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function get<T = unknown>(url: string) {
  return request<T>("GET", url);
}

function post<T = unknown, B = unknown>(url: string, body?: B) {
  return request<T>("POST", url, body);
}

function patch<T = unknown, B = unknown>(url: string, body?: B) {
  return request<T>("PATCH", url, body);
}

function put<T = unknown, B = unknown>(url: string, body?: B) {
  return request<T>("PUT", url, body);
}

function del<T = unknown>(url: string) {
  return request<T>("DELETE", url);
}

export const api = { get, post, patch, put, del };

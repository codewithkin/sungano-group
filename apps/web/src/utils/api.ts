import axios, { AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

const client = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function get<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return client.get<T>(url, config).then((res) => res.data);
}

function post<T = unknown, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
  return client.post<T>(url, body, config).then((res) => res.data);
}

function patch<T = unknown, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) {
  return client.patch<T>(url, body, config).then((res) => res.data);
}

export const api = { get, post, patch };

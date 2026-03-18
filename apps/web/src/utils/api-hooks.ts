import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { api } from "./api";

type MutationOpts<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables, unknown>,
  "mutationFn"
>;

type QueryOpts<TData> = Omit<UseQueryOptions<TData, Error, TData>, "queryKey" | "queryFn">;

export function useApiQuery<TData = unknown>(queryKey: unknown[], url: string, options?: QueryOpts<TData>) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => api.get<TData>(url),
    ...options,
  });
}

export function useApiPost<TData = unknown, TVariables = unknown>(
  url: string,
  options?: MutationOpts<TData, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => api.post<TData, TVariables>(url, variables),
    ...options,
  });
}

export function useApiPatch<TData = unknown, TVariables = unknown>(
  url: string,
  options?: MutationOpts<TData, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => api.patch<TData, TVariables>(url, variables),
    ...options,
  });
}

export function useApiPut<TData = unknown, TVariables = unknown>(
  url: string,
  options?: MutationOpts<TData, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => api.put<TData, TVariables>(url, variables),
    ...options,
  });
}

export function useApiDelete<TData = unknown>(url: string, options?: MutationOpts<TData, void>) {
  return useMutation<TData, Error, void>({
    mutationFn: () => api.del<TData>(url),
    ...options,
  });
}

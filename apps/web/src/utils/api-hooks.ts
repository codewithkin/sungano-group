import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosRequestConfig } from "axios";
import { api } from "./api";

type MaybeConfig = AxiosRequestConfig | undefined;

type MutationOpts<TData, TError, TVariables> = Omit<
  UseMutationOptions<TData, TError, TVariables, unknown>,
  "mutationFn"
> & { config?: MaybeConfig };

type QueryOpts<TData> = Omit<UseQueryOptions<TData, unknown, TData>, "queryKey" | "queryFn"> & {
  config?: MaybeConfig;
};

export function useApiQuery<TData = unknown>(queryKey: unknown[], url: string, options?: QueryOpts<TData>) {
  return useQuery<TData>({
    queryKey,
    queryFn: () => api.get<TData>(url, options?.config),
    ...options,
  });
}

export function useApiPost<TData = unknown, TVariables = unknown>(
  url: string,
  options?: MutationOpts<TData, unknown, TVariables>
) {
  return useMutation<TData, unknown, TVariables>({
    mutationFn: (variables) => api.post<TData, TVariables>(url, variables, options?.config),
    ...options,
  });
}

export function useApiPatch<TData = unknown, TVariables = unknown>(
  url: string,
  options?: MutationOpts<TData, unknown, TVariables>
) {
  return useMutation<TData, unknown, TVariables>({
    mutationFn: (variables) => api.patch<TData, TVariables>(url, variables, options?.config),
    ...options,
  });
}

export function useApiPut<TData = unknown, TVariables = unknown>(
  url: string,
  options?: MutationOpts<TData, unknown, TVariables>
) {
  return useMutation<TData, unknown, TVariables>({
    mutationFn: (variables) => api.put<TData, TVariables>(url, variables, options?.config),
    ...options,
  });
}

export function useApiDelete<TData = unknown>(url: string, options?: MutationOpts<TData, unknown, void>) {
  return useMutation<TData, unknown, void>({
    mutationFn: () => api.del<TData>(url, options?.config),
    ...options,
  });
}

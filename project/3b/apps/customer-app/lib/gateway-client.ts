import "server-only";

import { GATEWAY_BASE_URL } from "@/lib/constants";
import type { ApiError } from "@/lib/types";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export class GatewayClient {
  constructor(private readonly baseUrl = GATEWAY_BASE_URL) {}

  async get<T>(path: string, token?: string | null): Promise<T> {
    return this.request<T>(path, { method: "GET", token });
  }

  async post<T>(path: string, body?: unknown, token?: string | null): Promise<T> {
    return this.request<T>(path, { method: "POST", body, token });
  }

  async patch<T>(path: string, body?: unknown, token?: string | null): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body, token });
  }

  async request<T>(path: string, options: RequestOptions): Promise<T> {
    const headers = new Headers(JSON_HEADERS);

    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => headers.set(key, value));
    }

    if (options.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      cache: "no-store",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) {
      throw await normalizeApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

export async function normalizeApiError(response: Response): Promise<ApiError> {
  try {
    const data = (await response.json()) as Partial<ApiError>;
    return {
      code: data.code || "INTERNAL_ERROR",
      message: data.message || "Unexpected gateway error",
      status: response.status,
    };
  } catch {
    return {
      code: "INTERNAL_ERROR",
      message: response.statusText || "Unexpected gateway error",
      status: response.status,
    };
  }
}

export function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error,
  );
}

import axios from "axios";
import { ENV } from "@/app/config/env";
import { useAuthStore } from "@/app/store/auth.store";

type ApiErrorPayload = {
  message?: string;
  code?: string;
};

export class HttpClientError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = "HttpClientError";
    this.status = options?.status;
    this.code = options?.code;
  }
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null;
}

function normalizeHttpError(error: unknown): HttpClientError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const payload = isApiErrorPayload(data) ? data : undefined;
    const message = payload?.message ?? error.message ?? "Request failed";

    return new HttpClientError(message, {
      status,
      code: payload?.code,
    });
  }

  if (error instanceof Error) {
    return new HttpClientError(error.message);
  }

  return new HttpClientError("Unexpected error while performing HTTP request");
}

export const httpClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    return config;
  }

  const nextHeaders = config.headers ?? {};
  nextHeaders.Authorization = `Bearer ${accessToken}`;

  return {
    ...config,
    headers: nextHeaders,
  };
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeHttpError(error))
);

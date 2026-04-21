import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { GatewayClient, isApiError } from "@/lib/gateway-client";
import type { CustomerSession } from "@/lib/types";

const gatewayClient = new GatewayClient();

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getOptionalSession(): Promise<CustomerSession | null> {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }

  try {
    return await gatewayClient.get<CustomerSession>("/auth/me", token);
  } catch (error) {
    if (isApiError(error) && error.code === "UNAUTHORIZED") {
      return null;
    }

    return null;
  }
}

export async function requireCustomerSession(): Promise<CustomerSession> {
  const session = await getOptionalSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { GatewayClient, isApiError } from "@/lib/gateway-client";
import type {
  LoginCustomerResponse,
  RegisterCustomerRequest,
} from "@/lib/types";

const gatewayClient = new GatewayClient();

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterCustomerRequest;
    await gatewayClient.post("/auth/register/customer", payload);
    const login = await gatewayClient.post<LoginCustomerResponse>(
      "/auth/login/customer",
      {
        email: payload.email,
        password: payload.password,
      },
    );

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_COOKIE, login.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(error, { status: error.status || 400 });
    }

    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "Unexpected error while registering.",
      },
      { status: 500 },
    );
  }
}

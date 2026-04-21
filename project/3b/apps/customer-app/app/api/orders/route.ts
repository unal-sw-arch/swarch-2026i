import { NextResponse } from "next/server";

import { GatewayClient, isApiError } from "@/lib/gateway-client";
import { getAccessToken } from "@/lib/session";
import type { OrderCreateRequest } from "@/lib/types";

const gatewayClient = new GatewayClient();

export async function POST(request: Request) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED",
          message: "Missing customer session.",
        },
        { status: 401 },
      );
    }

    const payload = (await request.json()) as OrderCreateRequest;
    const order = await gatewayClient.post("/orders", payload, token);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(error, { status: error.status || 400 });
    }

    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "Unexpected error while creating the order.",
      },
      { status: 500 },
    );
  }
}

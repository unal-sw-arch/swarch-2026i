import { NextResponse } from "next/server";

import { GatewayClient, isApiError } from "@/lib/gateway-client";
import { getAccessToken } from "@/lib/session";

const gatewayClient = new GatewayClient();

type TimelineRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: TimelineRouteProps) {
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

    const { id } = await params;
    const timeline = await gatewayClient.get(`/orders/${id}/timeline`, token);
    return NextResponse.json(timeline);
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(error, { status: error.status || 400 });
    }

    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "Unexpected error while retrieving the timeline.",
      },
      { status: 500 },
    );
  }
}

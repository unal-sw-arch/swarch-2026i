const express = require("express");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT || 4000);

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || "http://auth-service:8000",
  catalog: process.env.CATALOG_SERVICE_URL || "http://catalog-service:3000",
  order: process.env.ORDER_SERVICE_URL || "http://order-service:8080",
  notification:
    process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:8000",
};

const orderRegistry = new Map();
const ORDER_SERVICE_RESTAURANT_ID = 1;

app.use(cors());
app.use(express.json());

app.use((request, response, next) => {
  const requestId = request.header("x-request-id") || crypto.randomUUID();
  request.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  next();
});

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    services: SERVICES,
  });
});

app.post("/auth/register/customer", async (request, response) => {
  return proxyJson(request, response, `${SERVICES.auth}/auth/register/customer`, {
    method: "POST",
    body: request.body,
  });
});

app.post("/auth/login/customer", async (request, response) => {
  return proxyJson(request, response, `${SERVICES.auth}/auth/login/customer`, {
    method: "POST",
    body: request.body,
  });
});

app.post("/auth/login/restaurant", async (request, response) => {
  return proxyJson(request, response, `${SERVICES.auth}/auth/login/restaurant`, {
    method: "POST",
    body: request.body,
  });
});

app.get("/auth/me", async (request, response) => {
  const token = extractToken(request);
  if (!token) {
    return sendError(response, 401, "UNAUTHORIZED", "Missing bearer token");
  }

  return proxyJson(request, response, `${SERVICES.auth}/auth/me`, {
    method: "GET",
    token,
  });
});

app.get("/restaurants", async (request, response) => {
  return proxyJson(request, response, `${SERVICES.catalog}/restaurants`, {
    method: "GET",
  });
});

app.get("/restaurants/:id/menu", async (request, response) => {
  return proxyJson(
    request,
    response,
    `${SERVICES.catalog}/restaurants/${request.params.id}/menu`,
    {
      method: "GET",
    },
  );
});

app.post("/orders", async (request, response) => {
  const token = extractToken(request);
  if (!token) {
    return sendError(response, 401, "UNAUTHORIZED", "Missing bearer token");
  }

  const session = await getCustomerSession(token, request.requestId);
  if (!session.ok) {
    return sendError(
      response,
      session.status,
      session.code,
      session.message,
    );
  }

  const orderPayload = {
    restaurantId: mapRestaurantIdToOrderService(request.body.restaurantId),
    customerName: session.data.name,
    customerPhone: session.data.email,
    notes: request.body.notes || "",
    items: Array.isArray(request.body.items) ? request.body.items : [],
  };

  try {
    const downstream = await fetch(`${SERVICES.order}/orders`, {
      method: "POST",
      headers: buildHeaders(request.requestId),
      body: JSON.stringify(orderPayload),
    });

    const data = await parseJsonSafe(downstream);
    if (!downstream.ok) {
      const error = normalizeError(downstream.status, data);
      return response.status(error.status).json(error.body);
    }

    const normalized = normalizeOrderResponse(data, session.data.userId);
    orderRegistry.set(String(normalized.id), {
      customerId: session.data.userId,
      restaurantId: request.body.restaurantId,
      createdAt: normalized.createdAt,
    });

    normalized.restaurantId = request.body.restaurantId;
    return response.status(201).json(normalized);
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
});

app.get("/orders/:id", async (request, response) => {
  const token = extractToken(request);
  if (!token) {
    return sendError(response, 401, "UNAUTHORIZED", "Missing bearer token");
  }

  const session = await getCustomerSession(token, request.requestId);
  if (!session.ok) {
    return sendError(
      response,
      session.status,
      session.code,
      session.message,
    );
  }

  try {
    const downstream = await fetch(`${SERVICES.order}/orders/${request.params.id}`, {
      method: "GET",
      headers: buildHeaders(request.requestId),
    });

    const data = await parseJsonSafe(downstream);
    if (!downstream.ok) {
      const error = normalizeError(downstream.status, data);
      return response.status(error.status).json(error.body);
    }

    const normalized = normalizeOrderResponse(
      data,
      session.data.userId,
      orderRegistry.get(String(request.params.id))?.restaurantId,
    );
    return response.json(normalized);
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
});

app.get("/customers/me/orders", async (request, response) => {
  const token = extractToken(request);
  if (!token) {
    return sendError(response, 401, "UNAUTHORIZED", "Missing bearer token");
  }

  const session = await getCustomerSession(token, request.requestId);
  if (!session.ok) {
    return sendError(
      response,
      session.status,
      session.code,
      session.message,
    );
  }

  const createdOrders = Array.from(orderRegistry.entries())
    .filter(([, order]) => order.customerId === session.data.userId)
    .map(([orderId]) => orderId);

  try {
    const items = await Promise.all(
      createdOrders.map(async (orderId) => {
        const downstream = await fetch(`${SERVICES.order}/orders/${orderId}`, {
          method: "GET",
          headers: buildHeaders(request.requestId),
        });

        const data = await parseJsonSafe(downstream);
        if (!downstream.ok) {
          return null;
        }

        const normalized = normalizeOrderResponse(data, session.data.userId);
        return {
          id: normalized.id,
          restaurantId:
            orderRegistry.get(String(orderId))?.restaurantId ||
            normalized.restaurantId,
          status: normalized.status,
          totalAmount: normalized.totalAmount,
        };
      }),
    );

    return response.json({
      items: items.filter(Boolean),
    });
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
});

app.get("/orders/:id/timeline", async (request, response) => {
  const token = extractToken(request);
  if (!token) {
    return sendError(response, 401, "UNAUTHORIZED", "Missing bearer token");
  }

  const session = await getCustomerSession(token, request.requestId);
  if (!session.ok) {
    return sendError(
      response,
      session.status,
      session.code,
      session.message,
    );
  }

  return proxyJson(
    request,
    response,
    `${SERVICES.notification}/activities/order/${request.params.id}`,
    {
      method: "GET",
      token,
      transform: (data) => ({
        orderId: Number(request.params.id),
        events: Array.isArray(data.events)
          ? data.events.sort(
              (left, right) =>
                new Date(right.timestamp).getTime() -
                new Date(left.timestamp).getTime(),
            )
          : [],
      }),
    },
  );
});

app.get("/promotions/active", async (_request, response) => {
  response.json({
    items: [
      {
        id: 9001,
        title: "Combo Almuerzo",
        description: "Bebida gratis",
      },
      {
        id: 9002,
        title: "Entrega Premium",
        description: "10% off on your first prototype order",
      },
    ],
  });
});

app.get("/recommendations", async (request, response) => {
  const restaurantId = request.query.restaurantId;
  if (!restaurantId) {
    return response.json({ items: [] });
  }

  try {
    const downstream = await fetch(
      `${SERVICES.catalog}/restaurants/${restaurantId}/menu`,
      {
        method: "GET",
        headers: buildHeaders(request.requestId),
      },
    );

    const data = await parseJsonSafe(downstream);
    if (!downstream.ok || !Array.isArray(data.items)) {
      return response.json({ items: [] });
    }

    const firstAvailable = data.items.find((item) => item.isAvailable);
    if (!firstAvailable) {
      return response.json({ items: [] });
    }

    return response.json({
      items: [
        {
          menuItemId: firstAvailable.id,
          reason: "Popular item",
        },
      ],
    });
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
});

app.use((_request, response) => {
  sendError(response, 404, "NOT_FOUND", "Route not found");
});

app.listen(PORT, () => {
  console.log(`[api-gateway] listening on port ${PORT}`);
});

function extractToken(request) {
  const authHeader = request.header("authorization");
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function buildHeaders(requestId, token) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-request-id": requestId,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function proxyJson(request, response, url, options) {
  try {
    const downstream = await fetch(url, {
      method: options.method,
      headers: buildHeaders(request.requestId, options.token),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const data = await parseJsonSafe(downstream);
    if (!downstream.ok) {
      const error = normalizeError(downstream.status, data);
      return response.status(error.status).json(error.body);
    }

    return response.json(options.transform ? options.transform(data) : data);
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function normalizeError(status, data) {
  return {
    status,
    body: {
      code: data.code || inferErrorCode(status),
      message: data.message || "Unexpected downstream error",
    },
  };
}

function inferErrorCode(status) {
  switch (status) {
    case 400:
      return "VALIDATION_ERROR";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    default:
      return "INTERNAL_ERROR";
  }
}

function sendError(response, status, code, message) {
  return response.status(status).json({ code, message });
}

function sendUnexpectedError(response, error) {
  console.error("[api-gateway] unexpected error", error);
  return sendError(response, 500, "INTERNAL_ERROR", "Unexpected gateway error");
}

function normalizeOrderResponse(data, customerId, restaurantIdOverride) {
  return {
    id: data.id,
    customerId,
    restaurantId: restaurantIdOverride || data.restaurantId,
    status: data.status,
    totalAmount: Number(data.totalAmount),
    createdAt: data.createdAt,
    items: Array.isArray(data.items)
      ? data.items.map((item) => ({
          menuItemId: item.menuItemId,
          productName: item.productName,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
        }))
      : [],
  };
}

function mapRestaurantIdToOrderService(restaurantId) {
  if (Number(restaurantId) === 10) {
    return ORDER_SERVICE_RESTAURANT_ID;
  }

  return Number(restaurantId);
}

async function getCustomerSession(token, requestId) {
  try {
    const response = await fetch(`${SERVICES.auth}/auth/me`, {
      method: "GET",
      headers: buildHeaders(requestId, token),
    });
    const data = await parseJsonSafe(response);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        code: data.code || "UNAUTHORIZED",
        message: data.message || "Unable to validate token",
      };
    }

    if (data.role !== "CUSTOMER") {
      return {
        ok: false,
        status: 403,
        code: "FORBIDDEN",
        message: "Customer role required",
      };
    }

    return { ok: true, data };
  } catch (error) {
    console.error("[api-gateway] auth session lookup failed", error);
    return {
      ok: false,
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Unable to validate current session",
    };
  }
}

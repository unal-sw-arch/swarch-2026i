import type { OrderStatus } from "@/shared/constants/order-status";

const statusConfig = {
  CREATED: {
    label: "Created",
    className: "bg-slate-100 text-slate-700",
  },
  IN_PREPARATION: {
    label: "In Preparation",
    className: "bg-amber-100 text-amber-800",
  },
  READY: {
    label: "Ready",
    className: "bg-emerald-100 text-emerald-800",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-blue-100 text-blue-800",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-800",
  },
  UNKNOWN: {
    label: "Unknown",
    className: "bg-slate-100 text-slate-500",
  },
} as const;

function normalizeStatus(status: string): keyof typeof statusConfig {
  const normalized = status.trim().toUpperCase().replace(/\s+/g, "_");

  if (normalized in statusConfig) {
    return normalized as keyof typeof statusConfig;
  }

  const lowercase = status.trim().toLowerCase();

  if (lowercase === "created") return "CREATED";
  if (lowercase === "in_preparation" || lowercase === "in preparation") return "IN_PREPARATION";
  if (lowercase === "ready") return "READY";
  if (lowercase === "delivered") return "DELIVERED";
  if (lowercase === "cancelled") return "CANCELLED";

  return "UNKNOWN";
}

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const normalizedStatus = normalizeStatus(String(status));
  const { label, className } = statusConfig[normalizedStatus];

  return <span className={`rounded px-2 py-1 text-xs font-medium ${className}`}>{label}</span>;
}

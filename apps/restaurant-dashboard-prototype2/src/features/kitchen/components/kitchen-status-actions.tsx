import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { useUpdateKitchenStatus } from "@/features/kitchen/hooks/use-update-kitchen-status";
import type { KitchenOrder, KitchenOrderStatus } from "@/features/kitchen/types/kitchen.types";
import { ORDER_STATUS } from "@/shared/constants/order-status";

type KitchenStatusActionsProps = {
  orderId: KitchenOrder["orderId"];
  status: KitchenOrderStatus;
};

export function KitchenStatusActions({ orderId, status }: KitchenStatusActionsProps) {
  const { mutate, isPending, error } = useUpdateKitchenStatus();
  const [showError, setShowError] = useState(false);

  const nextStatus: Record<KitchenOrderStatus, KitchenOrderStatus | null> = {
    [ORDER_STATUS.CREATED]: ORDER_STATUS.IN_PREPARATION,
    [ORDER_STATUS.IN_PREPARATION]: ORDER_STATUS.READY,
    [ORDER_STATUS.READY]: ORDER_STATUS.DELIVERED,
    [ORDER_STATUS.DELIVERED]: null,
  };

  const labels: Record<KitchenOrderStatus, string> = {
    [ORDER_STATUS.CREATED]: "Iniciar preparación",
    [ORDER_STATUS.IN_PREPARATION]: "Marcar como listo",
    [ORDER_STATUS.READY]: "Marcar como entregado",
    [ORDER_STATUS.DELIVERED]: "Entregado",
  };

  const handleStatusUpdate = () => {
    const newStatus = nextStatus[status];
    if (!newStatus) return;

    setShowError(false);
    mutate(
      { orderId, status: newStatus },
      {
        onError: () => {
          setShowError(true);
        },
      }
    );
  };

  // Si el estado es DELIVERED, solo mostrar badge sin acción
  if (status === ORDER_STATUS.DELIVERED) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-block rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
          {labels[status]}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="subtle"
          disabled={isPending}
          onClick={handleStatusUpdate}
        >
          {isPending ? "Procesando..." : labels[status]}
        </Button>
      </div>
      {showError && error && (
        <p className="text-xs text-rose-600">
          {error instanceof Error ? error.message : "Error al actualizar estado"}
        </p>
      )}
    </div>
  );
}

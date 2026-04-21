import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import type { ID } from "@/shared/types/common.types";
import { useUpdateAvailability } from "@/features/products/hooks/use-update-availability";

type AvailabilityToggleProps = {
  productId: ID;
  isAvailable: boolean;
  restaurantId: ID;
};

export function AvailabilityToggle({ productId, isAvailable, restaurantId }: AvailabilityToggleProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useUpdateAvailability(restaurantId);

  const handleToggle = async () => {
    setActionError(null);

    try {
      await mutateAsync({
        productId,
        isAvailable: !isAvailable,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la disponibilidad.";
      setActionError(message);
    }
  };

  return (
    <div className="space-y-1">
      <Button type="button" variant="subtle" onClick={handleToggle} disabled={isPending} className="px-2 py-1 text-xs">
        {isPending ? "Saving..." : isAvailable ? "Mark unavailable" : "Mark available"}
      </Button>
      {actionError ? <p className="text-xs text-red-700">{actionError}</p> : null}
    </div>
  );
}

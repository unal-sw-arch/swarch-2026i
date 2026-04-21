import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { KitchenOrdersTable } from "@/features/kitchen/components/kitchen-orders-table";
import { useKitchenOrders } from "@/features/kitchen/hooks/use-kitchen-orders";

export function KitchenQueuePage() {
  const { data, isLoading, isError, refetch } = useKitchenOrders();

  const handleRefresh = () => {
    void refetch();
  };

  if (isLoading) return <LoadingState label="Cargando cola de cocina..." />;
  if (isError) return <ErrorState label="No se pudo cargar la cola de cocina" />;
  if (!data || data.length === 0) return <EmptyState label="No hay pedidos en cocina" />;

  return (
    <section className="space-y-4">
      <Card className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Cocina</h1>
            <p className="text-sm text-slate-600">
              Seguimiento de tickets en cocina y cambios de estado operativos.
            </p>
          </div>
          <Button type="button" variant="subtle" onClick={handleRefresh}>
            Actualizar
          </Button>
        </div>
      </Card>
      <KitchenOrdersTable orders={data} />
    </section>
  );
}

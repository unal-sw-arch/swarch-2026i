import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { useRestaurantOrders } from "@/features/orders/hooks/use-restaurant-orders";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

export function OrdersPage() {
  const { restaurantId } = useAuthSession();
  const { data, isLoading, isError, refetch, isFetching } = useRestaurantOrders(restaurantId);

  const handleRefresh = () => {
    void refetch();
  };

  const orders = data ?? [];

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState label="Cargando pedidos..." />;
    }

    if (isError) {
      return <ErrorState label="No se pudieron cargar los pedidos" onRetry={handleRefresh} />;
    }

    if (orders.length === 0) {
      return <EmptyState label="No hay pedidos para mostrar" description="Cuando ingresen nuevos pedidos, aparecerán aquí." />;
    }

    return <OrdersTable orders={orders} />;
  };

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
            <p className="text-sm text-slate-600">Listado operativo de pedidos del restaurante.</p>
          </div>
          <Button type="button" onClick={handleRefresh} disabled={isFetching || !restaurantId} className="sm:self-start">
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </Card>

      {renderContent()}
    </section>
  );
}

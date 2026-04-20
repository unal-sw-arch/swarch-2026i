import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ProductsTable } from "@/features/products/components/products-table";
import { useRestaurantMenu } from "@/features/products/hooks/use-restaurant-menu";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

export function ProductsPage() {
  const { restaurantId } = useAuthSession();
  const { data, isLoading, isError, isFetching, refetch } = useRestaurantMenu(restaurantId);

  if (restaurantId == null) {
    return <ErrorState label="No se encontró una sesión de restaurante válida." />;
  }

  const handleRefresh = () => {
    void refetch();
  };

  const products = data ?? [];

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState label="Cargando menú..." />;
    }

    if (isError) {
      return <ErrorState label="No se pudo cargar el menú" onRetry={handleRefresh} />;
    }

    if (products.length === 0) {
      return (
        <EmptyState
          label="No hay productos para mostrar"
          description="Cuando el restaurante tenga productos disponibles en su catálogo, aparecerán aquí."
        />
      );
    }

    return <ProductsTable products={products} restaurantId={restaurantId} />;
  };

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
            <p className="text-sm text-slate-600">Disponibilidad del menú y control de productos operativos.</p>
          </div>
          <Button type="button" onClick={handleRefresh} disabled={isFetching || restaurantId == null} className="sm:self-start">
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </Card>

      {renderContent()}
    </section>
  );
}

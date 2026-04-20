import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { Card } from "@/shared/components/ui/card";

export function DashboardHomePage() {
  return (
    <section className="space-y-4">
      <Card className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Overview</p>
        <h1 className="text-2xl font-semibold text-slate-900">Restaurant Dashboard</h1>
        <p className="text-sm text-slate-600">Bienvenido al panel operativo del restaurante. Desde aquí puedes entrar a pedidos, cocina y productos.</p>
      </Card>
      <QuickActions />
    </section>
  );
}

import type { MenuProduct } from "@/features/products/types/products.types";
import { formatCurrency } from "@/shared/lib/currency";
import { AvailabilityToggle } from "./availability-toggle";

type ProductsTableProps = {
  products: MenuProduct[];
  restaurantId: MenuProduct["restaurantId"];
};

export function ProductsTable({ products, restaurantId }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2">Price</th>
            <th className="px-3 py-2">Availability</th>
            <th className="px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-slate-200/80">
              <td className="px-3 py-2">{product.name}</td>
              <td className="px-3 py-2 text-slate-600">{product.description}</td>
              <td className="px-3 py-2">{formatCurrency(product.price)}</td>
              <td className="px-3 py-2">
                {product.isAvailable ? (
                  <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">Available</span>
                ) : (
                  <span className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">Unavailable</span>
                )}
              </td>
              <td className="px-3 py-2">
                <AvailabilityToggle productId={product.id} isAvailable={product.isAvailable} restaurantId={restaurantId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

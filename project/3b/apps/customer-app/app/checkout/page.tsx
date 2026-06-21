import { CheckoutClient } from "@/components/checkout-client";
import { requireCustomerSession } from "@/lib/session";

export default async function CheckoutPage() {
  await requireCustomerSession();

  return (
    <div className="page-shell">
      <CheckoutClient />
    </div>
  );
}

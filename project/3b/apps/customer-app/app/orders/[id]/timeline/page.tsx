import { notFound } from "next/navigation";

import { TimelineClient } from "@/components/timeline-client";
import { OrdersRepository } from "@/lib/repositories/orders-repository";
import { requireCustomerSession } from "@/lib/session";

type TimelinePageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderTimelinePage({ params }: TimelinePageProps) {
  await requireCustomerSession();
  const { id } = await params;
  const orderId = Number(id);

  if (Number.isNaN(orderId)) {
    notFound();
  }

  const timeline = await OrdersRepository.getTimeline(orderId);

  return (
    <div className="page-shell">
      <TimelineClient
        initialEvents={timeline.events}
        orderId={orderId}
      />
    </div>
  );
}

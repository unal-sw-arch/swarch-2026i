"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { useToast } from "@/components/toast-provider";
import type { ApiError, TimelineEvent } from "@/lib/types";

const ORDER_STEPS = ["CREATED", "IN_PREPARATION", "READY", "DELIVERED"] as const;

function getEventStatus(event: TimelineEvent): string {
  return String(event.payload?.status || (event.eventType === "ORDER_READY" ? "READY" : "CREATED"));
}

export function TimelineClient({
  initialEvents,
  orderId,
}: {
  initialEvents: TimelineEvent[];
  orderId: number;
}) {
  const [events, setEvents] = useState(initialEvents);
  const { pushToast } = useToast();

  useEffect(() => {
    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/orders/${orderId}/timeline`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        pushToast(error.code, error.message);
        return;
      }

      const data = (await response.json()) as { events: TimelineEvent[] };
      setEvents(data.events);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [orderId, pushToast]);

  const currentStatus = useMemo(() => {
    if (events.length === 0) return "CREATED";
    return getEventStatus(events[0]);
  }, [events]);

  const currentIndex = Math.max(0, ORDER_STEPS.indexOf(currentStatus as (typeof ORDER_STEPS)[number]));

  return (
    <div className="stack">
      <section className="panel section-card">
        <div className="page-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>Order tracker</h2>
            <p className="muted">Polling every few seconds against the timeline endpoint.</p>
          </div>
        </div>

        <div className="tracker">
          {ORDER_STEPS.map((step, index) => (
            <div
              className={index <= currentIndex ? "tracker__step tracker__step--active" : "tracker__step"}
              key={step}
            >
              <strong>{step}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>
                {index < currentIndex
                  ? "Completed"
                  : index === currentIndex
                    ? "Current"
                    : "Pending"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel section-card">
        <div className="page-heading" style={{ marginBottom: 16 }}>
          <div>
            <h2>Timeline events</h2>
            <p className="muted">Notification service events ordered from newest to oldest.</p>
          </div>
        </div>

        <div className="timeline">
          {events.length === 0 ? (
            <div className="empty-state">Timeline has no events yet.</div>
          ) : (
            events.map((event, index) => (
              <div className="timeline__item" key={`${event.eventType}-${event.timestamp}-${index}`}>
                <span className="timeline__dot" />
                <div className="meta-card">
                  <div className="stat-row" style={{ justifyContent: "space-between" }}>
                    <strong>{event.eventType}</strong>
                    <span className="chip">{format(new Date(event.timestamp), "HH:mm:ss")}</span>
                  </div>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    Status: {String(event.payload?.status || "N/A")} · {format(new Date(event.timestamp), "PPP")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

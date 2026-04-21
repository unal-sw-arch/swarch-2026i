import { Sparkles } from "lucide-react";

import type { Promotion } from "@/lib/types";

export function PromotionCard({ promotion }: { promotion: Promotion }) {
  return (
    <article className="card">
      <span className="chip chip--success">
        <Sparkles size={14} />
        Active promo
      </span>
      <h3 className="card__title" style={{ marginTop: 18 }}>
        {promotion.title}
      </h3>
      <p className="card__muted">{promotion.description}</p>
    </article>
  );
}

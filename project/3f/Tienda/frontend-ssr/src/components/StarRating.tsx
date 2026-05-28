"use client";
import { useState } from "react";

interface Props {
  onChange: (value: number) => void;
}

export default function StarRating({ onChange }: Props) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n}
          className="cursor-pointer transition-all duration-200 transform hover:scale-125"
          style={{ 
            color: n <= (hover || selected) ? "#FBBF24" : "#E5E7EB",
            fontSize: n <= (hover || selected) ? "1.875rem" : "1.75rem"
          }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => { setSelected(n); onChange(n); }}
          role="button"
          tabIndex={0}
        >
          {n <= (hover || selected) ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}
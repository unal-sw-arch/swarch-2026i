"use client";
import React, { useState } from "react";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function ImageWithFallback({ src, alt, className, fallback, ...rest }: Props) {
  const placeholder = fallback || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E";
  const [currentSrc, setCurrentSrc] = useState<any>(src);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <img
      src={currentSrc || placeholder}
      alt={alt}
      className={className}
      onError={() => {
        // Si la imagen falla, intentamos con placeholder; si ya era placeholder, ocultamos
        if (currentSrc && currentSrc !== placeholder) {
          setCurrentSrc(placeholder);
        } else {
          setHidden(true);
        }
      }}
      {...rest}
    />
  );
}

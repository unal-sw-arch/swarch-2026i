"use client";
import React, { useState } from "react";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function ImageWithFallback({ src, alt, className, fallback, ...rest }: Props) {
  const placeholder = fallback || "https://via.placeholder.com/400x300?text=Sin+imagen";
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

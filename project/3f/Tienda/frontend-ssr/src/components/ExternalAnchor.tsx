"use client";
import React from "react";

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export default function ExternalAnchor({ href, children, className, ...rest }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => {
        // stop propagation so a parent Link (server component) won't receive the click
        e.stopPropagation();
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

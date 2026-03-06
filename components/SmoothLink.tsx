"use client";

import Link, { LinkProps } from "next/link";
import { useLenis } from "lenis/react";
import React from "react";

interface SmoothLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: React.ReactNode;
  className?: string;
}

export default function SmoothLink({ href, children, className, onClick, ...props }: SmoothLinkProps) {
  const lenis = useLenis();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 1. If the developer passed an onClick function, fire it first
    if (onClick) onClick(e);

    // 2. Check if the link is an anchor targeting an ID on the same page
    const hrefString = href.toString();
    if (hrefString.startsWith("#")) {
      e.preventDefault(); // Stop the default instant snap

      if (lenis) {
        lenis.scrollTo(hrefString, {
          offset: -90, // 🌟 MAGIC TOUCH: Stops 90px early so your sticky header doesn't cover the content!
          duration: 1.2, // Matches your general Lenis smoothness
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium ease-out curve
        });
      }
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
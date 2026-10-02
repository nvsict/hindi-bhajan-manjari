"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    _mgq?: unknown[];
  }
}

interface MgidWidgetProps {
  /** MGID widget ID from the dashboard, e.g. "2090402" */
  widgetId: string;
  /** Reserved height (px) to prevent layout shift while the ad loads */
  minHeight?: number;
  /** Optional small label above the ad (set to "" to hide) */
  label?: string;
  className?: string;
}

/**
 * MGID widget container (Next.js App Router safe).
 *
 * - The loader script (jsc.mgid.com/site/<id>.js) is added ONCE in layout.tsx.
 * - Render only on the client to avoid hydration mismatches.
 * - Pushes ["_mgc.load"] onto window._mgq on mount. This replaces the inline
 *   <script> from MGID's guide, which does not run reliably inside React and
 *   would not re-run on client-side navigation.
 * - Place this inside page-level components (not in a layout), so a fresh
 *   instance mounts, and a fresh load is triggered, on every page visit.
 */
export default function MgidWidget({
  widgetId,
  minHeight = 280,
  label = "विज्ञापन",
  className = "",
}: MgidWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pushedRef.current) return;
    pushedRef.current = true; // guards against React strict-mode double effect

    try {
      window._mgq = window._mgq || [];
      window._mgq.push(["_mgc.load"]);
    } catch (err) {
      console.error("MGID load error:", err);
    }
  }, [mounted]);

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full my-8 ${className}`}
      style={{ minHeight }}
    >
      {label ? (
        <p className="mb-2 text-center text-[11px] tracking-wide text-stone-400">
          {label}
        </p>
      ) : null}

      {mounted ? (
        <div
          data-type="_mgwidget"
          data-widget-id={widgetId}
          suppressHydrationWarning
        />
      ) : null}
    </aside>
  );
}
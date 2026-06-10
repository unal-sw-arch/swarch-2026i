'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const START_EVENT = 'gs:route-loading-start';

function isModifiedEvent(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const finishTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (finishTimeoutRef.current !== null) {
        window.clearTimeout(finishTimeoutRef.current);
        finishTimeoutRef.current = null;
      }
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    function start() {
      clearTimers();
      setIsActive(true);
      setProgress((current) => (current > 8 ? current : 8));

      progressIntervalRef.current = window.setInterval(() => {
        setProgress((current) => {
          if (current >= 88) return current;
          const increment = current < 40 ? 12 : current < 70 ? 7 : 3;
          return Math.min(current + increment, 88);
        });
      }, 180);
    }

    function finish() {
      clearTimers();
      setProgress(100);
      finishTimeoutRef.current = window.setTimeout(() => {
        setIsActive(false);
        setProgress(0);
        finishTimeoutRef.current = null;
      }, 220);
    }

    function handleStartEvent() {
      start();
    }

    function handleDocumentClick(event: MouseEvent) {
      if (isModifiedEvent(event)) return;
      if (event.button !== 0) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!anchor.href) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;

      const currentUrl = new URL(window.location.href);
      const nextRoute = `${nextUrl.pathname}${nextUrl.search}`;
      const currentRoute = `${currentUrl.pathname}${currentUrl.search}`;
      if (nextRoute === currentRoute) return;

      start();
    }

    window.addEventListener(START_EVENT, handleStartEvent);
    document.addEventListener('click', handleDocumentClick, true);
    finish();

    return () => {
      clearTimers();
      window.removeEventListener(START_EVENT, handleStartEvent);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [pathname, searchParams]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70]"
      aria-hidden="true"
    >
      <div
        className="h-1 origin-left rounded-r-full bg-gradient-to-r from-primary-container via-[#ffc29f] to-secondary-container shadow-[0_0_18px_rgba(255,154,93,0.45)] transition-[transform,opacity] duration-200 ease-out"
        style={{
          transform: `scaleX(${progress / 100})`,
          opacity: isActive ? 1 : 0,
        }}
      />
    </div>
  );
}

export function emitRouteLoadingStart() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(START_EVENT));
}

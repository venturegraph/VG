'use client';

import React, { useEffect, useState } from 'react';

export interface ReadingProgressBarProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  targetId?: string;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  targetRef,
  targetId,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const updateProgress = () => {
      const target =
        targetRef?.current ||
        (targetId ? document.getElementById(targetId) : null);

      if (!target) {
        setProgress(0);
        return;
      }

      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const headerOffset =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--header-height'
          )
        ) || 0;

      // 0% when top reaches the bottom of the header (or is below it)
      if (rect.top >= headerOffset) {
        setProgress(0);
        return;
      }

      // 100% when bottom reaches the viewport bottom (or has passed it)
      if (rect.bottom <= vh) {
        setProgress(100);
        return;
      }

      // Progress through the element between top reaching headerOffset and bottom reaching vh
      const totalDistance = rect.height - (vh - headerOffset);
      if (totalDistance <= 0) {
        setProgress(rect.top <= headerOffset ? 100 : 0);
        return;
      }

      const scrolled = headerOffset - rect.top;
      const pct = Math.min(100, Math.max(0, (scrolled / totalDistance) * 100));
      setProgress(pct);
    };

    const handleScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        updateProgress();
        rafId = null;
      });
    };

    // Calculate initial progress
    updateProgress();

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    const currentTarget =
      targetRef?.current ||
      (targetId ? document.getElementById(targetId) : null);

    if (typeof ResizeObserver !== 'undefined' && currentTarget) {
      resizeObserver = new ResizeObserver(() => {
        handleScrollOrResize();
      });
      resizeObserver.observe(currentTarget);
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [targetRef, targetId]);

  return (
    <div
      className="fixed left-0 right-0 w-full h-[3px] bg-transparent z-[60] pointer-events-none"
      style={{ top: 'var(--header-height, 11rem)' }}
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#FA654D] motion-safe:transition-[width] motion-safe:duration-75 motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;

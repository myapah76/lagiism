import { useEffect, useRef } from 'react';

interface UseRunwayAutoplayOptions {
  enabled: boolean;
  intervalMs?: number;
  resetKey: number;
  onAdvance: () => void;
}

export function useRunwayAutoplay({
  enabled,
  intervalMs = 5000,
  resetKey,
  onAdvance,
}: UseRunwayAutoplayOptions): void {
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      onAdvanceRef.current();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, resetKey]);
}

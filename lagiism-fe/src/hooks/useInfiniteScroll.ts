import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  totalItems: number;
  batchSize?: number;
  resetKey?: string;
}

export function useInfiniteScroll({
  totalItems,
  batchSize = 4,
  resetKey = '',
}: UseInfiniteScrollOptions) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(batchSize, totalItems)
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(batchSize, totalItems));
  }, [batchSize, totalItems, resetKey]);

  const hasMore = visibleCount < totalItems;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, totalItems));
  }, [batchSize, totalItems]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return {
    visibleCount,
    hasMore,
    sentinelRef,
    loadMore,
  };
}

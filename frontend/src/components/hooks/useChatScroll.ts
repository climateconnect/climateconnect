import { useEffect, useRef, useCallback } from "react";

interface UseChatScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  loadMore: (page: number) => Promise<void>;
  rootMargin?: string;
}

export function useChatScroll({
  hasMore,
  isLoading,
  loadMore,
  rootMargin = "50px",
}: UseChatScrollOptions) {
  const scrollRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasMore && !isLoading && !loadingRef.current) {
        loadingRef.current = true;
        pageRef.current += 1;
        loadMore(pageRef.current).finally(() => {
          loadingRef.current = false;
        });
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollRef.current;

    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: container,
      rootMargin,
      threshold: 0,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, rootMargin]);

  return { scrollRef, sentinelRef };
}

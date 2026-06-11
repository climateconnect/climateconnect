import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => Promise<any>;
  threshold?: number;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading || loadingRef.current) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
            loadingRef.current = true;
            onLoadMore().finally(() => {
              loadingRef.current = false;
            });
          }
        },
        {
          rootMargin: `${threshold}px`,
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [hasMore, isLoading, onLoadMore, threshold]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { lastElementRef };
}

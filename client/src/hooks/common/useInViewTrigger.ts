import { useCallback, useRef } from 'react';

export const useInViewTrigger = (onEnter: () => void, isActive: boolean) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();

      if (!node || !isActive) {
        return;
      }

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0]?.isIntersecting) {
          onEnter();
        }
      });
      observerRef.current.observe(node);
    },
    [onEnter, isActive]
  );
};

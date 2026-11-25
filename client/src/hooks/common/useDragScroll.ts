import { RefObject, useEffect } from 'react';

const DRAG_THRESHOLD_PX = 5;

export const useDragScroll = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let isPressed = false;
    let hasDragged = false;
    let startX = 0;
    let startScroll = 0;

    const startDrag = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) {
        return;
      }

      isPressed = true;
      hasDragged = false;
      startX = event.clientX;
      startScroll = element.scrollLeft;
    };

    const moveDrag = (event: PointerEvent) => {
      if (!isPressed) {
        return;
      }

      const distance = event.clientX - startX;

      if (!hasDragged && Math.abs(distance) < DRAG_THRESHOLD_PX) {
        return;
      }

      hasDragged = true;
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
      element.scrollLeft = startScroll - distance;
    };

    const endDrag = () => {
      isPressed = false;
      element.style.cursor = '';
      element.style.userSelect = '';
    };

    // A drag that ends over a pill must not count as selecting it.
    const swallowClickAfterDrag = (event: MouseEvent) => {
      if (hasDragged) {
        event.stopPropagation();
        event.preventDefault();
        hasDragged = false;
      }
    };

    element.addEventListener('pointerdown', startDrag);
    element.addEventListener('click', swallowClickAfterDrag, true);
    window.addEventListener('pointermove', moveDrag);
    window.addEventListener('pointerup', endDrag);

    return () => {
      element.removeEventListener('pointerdown', startDrag);
      element.removeEventListener('click', swallowClickAfterDrag, true);
      window.removeEventListener('pointermove', moveDrag);
      window.removeEventListener('pointerup', endDrag);
    };
  }, [ref]);
};

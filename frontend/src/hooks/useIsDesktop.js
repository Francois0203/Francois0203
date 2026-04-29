import { useState, useEffect } from 'react';

const BREAKPOINT = 768;

/**
 * Returns true when the viewport is desktop-sized AND the primary input is a
 * fine pointer (mouse / trackpad).  Reactive to both resize and input changes.
 */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    window.innerWidth >= BREAKPOINT &&
    window.matchMedia('(pointer: fine)').matches
  );

  useEffect(() => {
    const widthMq   = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
    const pointerMq = window.matchMedia('(pointer: fine)');

    const check = () => setIsDesktop(widthMq.matches && pointerMq.matches);

    widthMq.addEventListener('change', check);
    pointerMq.addEventListener('change', check);

    return () => {
      widthMq.removeEventListener('change', check);
      pointerMq.removeEventListener('change', check);
    };
  }, []);

  return isDesktop;
};

export { useIsDesktop };

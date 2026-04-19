import React, { useState, useEffect } from 'react';
import DesktopConnect from './DesktopConnect';
import MobileConnect  from './MobileConnect';

const MOBILE_BREAKPOINT = 768;

const Connect = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const mq       = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile ? <MobileConnect /> : <DesktopConnect />;
};

export default Connect;

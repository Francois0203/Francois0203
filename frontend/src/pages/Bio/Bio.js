import React, { useState, useEffect } from 'react';
import DesktopBio from './DesktopBio';
import MobileBio  from './MobileBio';

const MOBILE_BREAKPOINT = 768;

const Bio = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const mq       = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile ? <MobileBio /> : <DesktopBio />;
};

export default Bio;

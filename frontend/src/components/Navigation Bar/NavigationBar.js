import React, { useState, useEffect } from "react";

import DesktopNav from "./DesktopNav";
import MobileNav  from "./MobileNav";

// ============================================
// BREAKPOINT
// ============================================
// Below this width the mobile nav is rendered.
const MOBILE_BREAKPOINT = 768;

// ============================================
// NAVIGATION BAR
// ============================================
// Orchestrates desktop vs. mobile navigation.
// Renders DesktopNav on wide screens and MobileNav
// on narrow screens, driven by a media query listener.

const NavigationBar = ({
  links      = [],
  onNavigate = () => {},
  activeTab  = null,
  burgerSize = 56,
  className  = "",
}) => {
  // ----------------------------------------
  // Breakpoint detection
  // ----------------------------------------
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ----------------------------------------
  // Render
  // ----------------------------------------
  if (isMobile) {
    return (
      <MobileNav
        links={links}
        onNavigate={onNavigate}
        activeTab={activeTab}
        triggerSize={burgerSize}
      />
    );
  }

  return (
    <DesktopNav
      links={links}
      onNavigate={onNavigate}
      activeTab={activeTab}
    />
  );
};

// ============================================
// EXPORTS
// ============================================

export default NavigationBar;
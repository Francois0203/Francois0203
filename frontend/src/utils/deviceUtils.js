/**
 * Device and performance detection utilities
 * Used to optimize animations and effects based on device capabilities
 */

/**
 * Checks if the user prefers reduced motion (accessibility setting)
 * @returns {boolean} True if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Detects if the device is likely a mobile device
 * @returns {boolean} True if mobile device is detected
 */
export const isMobileDevice = () => {
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check touch capability and screen size
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent.toLowerCase()) || (isTouchDevice && isSmallScreen);
};

/**
 * Detects if the device is a tablet
 * @returns {boolean} True if tablet device is detected
 */
export const isTabletDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
  const isMediumScreen = window.innerWidth > 768 && window.innerWidth <= 1024;
  
  return tabletRegex.test(userAgent.toLowerCase()) || isMediumScreen;
};

/**
 * Detects if animations should be reduced based on device and user preferences
 * @returns {boolean} True if animations should be reduced
 */
export const shouldReduceAnimations = () => {
  return prefersReducedMotion() || isMobileDevice();
};

/**
 * Get optimal particle count based on device capabilities
 * @param {number} desktopCount - Particle count for desktop
 * @param {number} mobileCount - Particle count for mobile (default: 25% of desktop)
 * @returns {number} Optimal particle count
 */
export const getOptimalParticleCount = (desktopCount, mobileCount = null) => {
  if (shouldReduceAnimations()) {
    return mobileCount !== null ? mobileCount : Math.floor(desktopCount * 0.25);
  }
  if (isTabletDevice()) {
    return Math.floor(desktopCount * 0.5);
  }
  return desktopCount;
};

/**
 * Get optimal animation interval based on device capabilities
 * @param {number} desktopInterval - Interval for desktop (ms)
 * @returns {number} Optimal interval
 */
export const getOptimalInterval = (desktopInterval) => {
  if (shouldReduceAnimations()) {
    return desktopInterval * 3; // Much slower on mobile
  }
  if (isTabletDevice()) {
    return desktopInterval * 1.5;
  }
  return desktopInterval;
};

/**
 * Check if device supports backdrop-filter (for glassmorphism)
 * @returns {boolean} True if backdrop-filter is supported
 */
export const supportsBackdropFilter = () => {
  return CSS.supports('backdrop-filter', 'blur(10px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
};

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Request idle callback wrapper with fallback
 * @param {Function} callback - Function to execute when idle
 * @param {Object} options - Options for requestIdleCallback
 */
export const scheduleIdleTask = (callback, options = {}) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback for Safari
  return setTimeout(callback, 1);
};

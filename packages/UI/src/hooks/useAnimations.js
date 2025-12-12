import { useState, useEffect } from 'react';

export const getInitialAnimations = () => {
  const sessionInfo = localStorage.getItem('userSessionInfo');
  if (sessionInfo) {
    try {
      const parsed = JSON.parse(sessionInfo);
      if (parsed.animationsEnabled !== undefined) {
        return parsed.animationsEnabled; // true or false
      }
    } catch {
      // fallback to default
    }
  }

  // Default: animations ON
  return true;
};

export const useAnimations = () => {
  const [animationsEnabled, setAnimationsEnabled] = useState(getInitialAnimations());

  useEffect(() => {
    if (animationsEnabled) {
      document.documentElement.removeAttribute('data-no-animations');
    } else {
      document.documentElement.setAttribute('data-no-animations', 'true');
    }

    // persist in localStorage
    const sessionInfo = localStorage.getItem('userSessionInfo');
    let updatedInfo = {};

    if (sessionInfo) {
      try {
        updatedInfo = JSON.parse(sessionInfo);
      } catch {
        updatedInfo = {};
      }
    }

    updatedInfo.animationsEnabled = animationsEnabled;
    localStorage.setItem('userSessionInfo', JSON.stringify(updatedInfo));
  }, [animationsEnabled]);

  const toggleAnimations = () => setAnimationsEnabled((prev) => !prev);

  return { animationsEnabled, toggleAnimations, setAnimationsEnabled };
};
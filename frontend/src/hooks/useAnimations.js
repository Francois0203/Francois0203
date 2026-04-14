import { useState, useEffect } from 'react';

const STORAGE_KEY   = 'userSessionInfo';
const ANIMATIONS_FIELD = 'reduceAnimations';

export const getInitialAnimations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed[ANIMATIONS_FIELD] === 'boolean') {
        return parsed[ANIMATIONS_FIELD];
      }
    }
  } catch {
    // corrupted storage — fall through to system preference
  }

  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
};

export const useAnimations = () => {
  const [reduceAnimations, setReduceAnimations] = useState(getInitialAnimations);

  useEffect(() => {
    const root = document.documentElement;

    if (reduceAnimations) {
      root.setAttribute('data-no-animations', 'true');
    } else {
      root.removeAttribute('data-no-animations');
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const info   = stored ? JSON.parse(stored) : {};
      info[ANIMATIONS_FIELD] = reduceAnimations;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      // storage unavailable — DOM attribute is still updated
    }
  }, [reduceAnimations]);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;

    const handleChange = (e) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const info   = stored ? JSON.parse(stored) : {};
        if (typeof info[ANIMATIONS_FIELD] !== 'boolean') {
          setReduceAnimations(e.matches);
        }
      } catch {
        setReduceAnimations(e.matches);
      }
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const toggleAnimations = () => setReduceAnimations((prev) => !prev);

  return { reduceAnimations, toggleAnimations };
};

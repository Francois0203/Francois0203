import { useEffect, useState } from 'react';

/**
 * Which section the reader is in. One observer with the viewport collapsed
 * to a thin band near the top; a section is current while it crosses it.
 *
 * @param {string[]} ids section element ids, in document order.
 * @param {number} [offset] where the band sits, clearing any fixed header.
 */
const useActiveSection = (ids, offset = 96) => {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!ids.length || typeof IntersectionObserver === 'undefined') return undefined;

    const nodes = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!nodes.length) return undefined;

    // From all the elements: a callback only reports what changed.
    const pick = () => {
      let current = null;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top - offset <= 0) current = node.id;
      }
      // Above the first section, the first one is the answer.
      setActive(current ?? nodes[0].id);
    };

    const observer = new IntersectionObserver(pick, {
      rootMargin: `-${offset}px 0px 0px 0px`,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    nodes.forEach(node => observer.observe(node));

    // The observer does not fire on a resize that moves a boundary.
    window.addEventListener('resize', pick);
    pick();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', pick);
    };
  }, [ids, offset]);

  return active;
};

export default useActiveSection;

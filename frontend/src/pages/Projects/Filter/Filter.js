import { useLayoutEffect, useRef, useState } from 'react';
import styles from './Filter.module.css';

// Glass pills to filter the projects. A bright marker slides to the chosen one.
const Filter = ({ options = [], value, onChange, allLabel, total, toneOf }) => {
  const rowRef = useRef(null);
  const [mark, setMark] = useState(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const measure = () => {
      const el = row.querySelector('[aria-pressed="true"]');
      if (el) setMark({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [value, options.length]);

  const tone = value ? toneOf(value) : 'blue';

  return (
    <div
      ref={rowRef}
      className={`glass ${styles.row}`}
      role="group"
      data-tone={tone}
      style={mark ? { '--x': `${mark.x}px`, '--y': `${mark.y}px`, '--w': `${mark.w}px`, '--h': `${mark.h}px` } : undefined}
    >
      {mark && <span className={styles.marker} aria-hidden="true" />}
      <button type="button" className={styles.pill} onClick={() => onChange(null)} aria-pressed={value === null}>
        {allLabel}<span className={styles.count}>{total}</span>
      </button>
      {options.map(([name, count]) => (
        <button
          key={name}
          type="button"
          className={styles.pill}
          data-tone={toneOf(name)}
          onClick={() => onChange(value === name ? null : name)}
          aria-pressed={value === name}
        >
          <span className={styles.dot} aria-hidden="true" />
          {name}<span className={styles.count}>{count}</span>
        </button>
      ))}
    </div>
  );
};

export default Filter;

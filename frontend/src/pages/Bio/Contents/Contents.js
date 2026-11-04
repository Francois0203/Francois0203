import { useLayoutEffect, useRef, useState } from 'react';
import { scrollPageTo } from '../../../hooks';
import styles from './Contents.module.css';

// The side menu. A glass marker slides to the section you are reading.
const Contents = ({ title, items = [], active }) => {
  const listRef = useRef(null);
  const [mark, setMark] = useState(null);

  useLayoutEffect(() => {
    const el = listRef.current?.querySelector('[data-current]');
    if (!el) { setMark(null); return; }
    setMark({ y: el.offsetTop, h: el.offsetHeight });
  }, [active, items.length]);

  return (
    <nav className={`glass ${styles.contents}`} aria-label={title} data-print-hide>
      <p className={styles.title}>{title}</p>
      <div ref={listRef} className={styles.list} style={mark ? { '--y': `${mark.y}px`, '--h': `${mark.h}px` } : undefined}>
        {mark && <span className={styles.marker} aria-hidden="true" />}
        {items.map(c => (
          <a
            key={c.id}
            href={`#${c.id}`}
            data-tone={c.tone}
            onClick={(e) => {
              const target = document.getElementById(c.id);
              if (!target) return;
              e.preventDefault();
              scrollPageTo(target, { offset: -96 });
            }}
            className={styles.link}
            data-current={c.id === active ? '' : undefined}
            aria-current={c.id === active ? 'true' : undefined}
          >
            <span className={styles.dot} aria-hidden="true" />
            {c.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Contents;

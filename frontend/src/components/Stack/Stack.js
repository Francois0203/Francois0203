import { useMemo, useState } from 'react';
import Draggable from '../Draggable';
import { markFor } from './marks';
import { useCopy } from '../../content/copy/store';
import styles from './Stack.module.css';

const TONES = ['blue', 'green', 'orange', 'pink', 'yellow'];

// Skills grouped on glass cards. Each one can be grabbed and tossed, then springs home.
const Stack = ({ entries = [] }) => {
  const [focus, setFocus] = useState(null);

  const other = useCopy('bio').skillsOther;
  const groups = useMemo(() => {
    const map = new Map();
    const seen = new Set();

    for (const entry of entries) {
      const label = typeof entry === 'string' ? entry : entry?.label ?? '';
      if (!label || seen.has(label)) continue;
      seen.add(label);

      const group = (typeof entry === 'object' && entry?.group) || other;
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(label);
    }

    return [...map.entries()].map(([name, items]) => ({ name, items }));
  }, [entries, other]);

  if (!groups.length) return null;

  // One index across every column, so the wave crosses the whole block.
  let n = 0;

  return (
    <div
      className={styles.stack}
      data-focused={focus !== null ? '' : undefined}
      style={{ '--step': '26ms' }}
      onMouseLeave={() => setFocus(null)}
    >
      {groups.map(({ name, items }, g) => (
        <section
          key={name}
          className={`glass ${styles.group}`}
          data-tone={TONES[g % TONES.length]}
          data-dim={focus !== null && focus !== name ? '' : undefined}
          onMouseEnter={() => setFocus(name)}
          onFocus={() => setFocus(name)}
        >
          <h3 className={styles.heading}>
            <span className={styles.ordinal}>{String(g + 1).padStart(2, '0')}</span>
            <span className={styles.name}>{name}</span>
            <span className={styles.count}>{items.length}</span>
          </h3>

          <ul className={styles.list}>
            {items.map((item) => {
              n += 1;
              const Mark = markFor(item);
              return (
                <li key={item} data-rise="pop" style={{ '--i': n, '--rise': '12px' }}>
                  <Draggable as="span" className={styles.entry}>
                    <Mark className={styles.mark} aria-hidden="true" />
                    {item}
                  </Draggable>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default Stack;

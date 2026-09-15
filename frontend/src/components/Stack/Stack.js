import { useMemo, useState } from 'react';
import useReveal from '../../hooks/useReveal';
import { markFor } from './marks';
import styles from './Stack.module.css';

/*
 * The stack, as a printed index. A grid of identical chips is a wall that
 * nobody reads; grouped columns are a shape people know how to scan.
 *
 * Pointing at a group brings it forward and steps the others back, so half
 * the stack can be isolated without a filter control to operate.
 */
const Stack = ({ entries = [] }) => {
  const [ref, shown] = useReveal({ threshold: 0.06 });
  const [focus, setFocus] = useState(null);

  const groups = useMemo(() => {
    const map = new Map();
    const seen = new Set();

    for (const entry of entries) {
      const label = typeof entry === 'string' ? entry : entry?.label ?? '';
      if (!label || seen.has(label)) continue;
      seen.add(label);

      const group = (typeof entry === 'object' && entry?.group) || 'Also';
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(label);
    }

    return [...map.entries()].map(([name, items]) => ({ name, items }));
  }, [entries]);

  if (!groups.length) return null;

  // One index across every column, so the wave crosses the whole block.
  let n = 0;

  return (
    <div
      ref={ref}
      className={styles.stack}
      data-shown={shown ? '' : undefined}
      data-focused={focus !== null ? '' : undefined}
      style={{ '--step': '26ms' }}
      onMouseLeave={() => setFocus(null)}
    >
      {groups.map(({ name, items }, g) => (
        <section
          key={name}
          className={styles.group}
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
                <li key={item} data-rise style={{ '--i': n, '--rise': '12px' }}>
                  <span className={styles.entry}>
                    <Mark className={styles.mark} aria-hidden="true" />
                    {item}
                  </span>
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

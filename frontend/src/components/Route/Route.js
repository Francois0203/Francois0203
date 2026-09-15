import useReveal from '../../hooks/useReveal';
import styles from './Route.module.css';

/*
 * The route. A rail draws as you scroll, with a lit ember at its head, and
 * each waypoint ignites as the head reaches it. Entirely CSS scroll driven:
 * no listener, no rAF, no measurement. Where that is unsupported, or motion
 * is off, the rail is drawn in full and every node is lit.
 *
 * Oldest first, because a drawn line only means anything travelled forwards.
 */
const Route = ({ stops = [] }) => {
  const [ref, shown] = useReveal({ threshold: 0.03 });

  if (!stops.length) return null;

  return (
    <ol
      ref={ref}
      className={styles.route}
      data-shown={shown ? '' : undefined}
      style={{ '--step': '70ms' }}
    >
      <span className={styles.rail} aria-hidden="true" />
      <span className={styles.trail} aria-hidden="true">
        <span className={styles.head} />
      </span>

      {stops.map((s, i) => (
        <li key={s.id ?? i} className={styles.stop}>
          <span className={styles.node} aria-hidden="true" />

          <p className={styles.when} data-rise style={{ '--i': i }}>
            {s.period ?? 'Earlier'}
          </p>

          <div className={styles.body} data-rise style={{ '--i': i }}>
            <p className={styles.kind}>
              {s.kind === 'education' ? 'Education' : 'Experience'}
            </p>
            <h3 className={styles.place}>{s.place}</h3>
            {s.what && <p className={styles.what}>{s.what}</p>}
            {s.note && <p className={styles.note}>{s.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default Route;

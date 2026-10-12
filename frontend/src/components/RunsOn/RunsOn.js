import { markFor } from '../Stack/marks';
import styles from './RunsOn.module.css';

const INKS = ['blue', 'green', 'orange', 'pink', 'yellow'];

const Row = ({ items, hidden }) => (
  <ul className={styles.row} aria-hidden={hidden || undefined}>
    {items.map((name, i) => {
      const Mark = markFor(name);
      return (
        <li key={name} className={styles.node} style={{ '--m': `var(--c-${INKS[i % INKS.length]})`, '--m-ink': `var(--c-${INKS[i % INKS.length]}-ink)` }}>
          <Mark className={styles.mark} aria-hidden="true" />
          <span>{name}</span>
        </li>
      );
    })}
  </ul>
);

const RunsOn = ({ label = 'day to day', items = [] }) => {
  if (!items.length) return null;
  const speed = `${Math.max(24, items.length * 4)}s`;

  return (
    <div className={styles.strip}>
      <span className={styles.label}>{label}</span>
      <div className={styles.viewport} data-scrolls>
        <div className={styles.track} style={{ '--speed': speed }}>
          <Row items={items} />
          <Row items={items} hidden />
        </div>
      </div>
    </div>
  );
};

export default RunsOn;

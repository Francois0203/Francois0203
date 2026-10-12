import Shape from '../Shape';
import styles from './Drift.module.css';

// Big flat shapes that float behind a section and move at their own pace as it scrolls.
const Drift = ({ shapes = [], className = '' }) => (
  <div className={`${styles.field} ${className}`} aria-hidden="true" data-print-hide>
    {shapes.map((s, i) => (
      <span
        key={i}
        className={styles.item}
        style={{
          left: s.x,
          top: s.y,
          width: s.size,
          '--speed': s.speed ?? 1,
          '--spin': `${s.spin ?? 0}deg`,
          '--tilt': `${s.rotate ?? 0}deg`,
        }}
        data-hide-narrow={s.wide ? '' : undefined}
      >
        <Shape kind={s.kind} colour={s.colour} className={styles.shape} />
      </span>
    ))}
  </div>
);

export default Drift;

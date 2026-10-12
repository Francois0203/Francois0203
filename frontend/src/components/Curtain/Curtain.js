import Shape from '../Shape';
import styles from './Curtain.module.css';

const PARADE = [
  { kind: 'circle', colour: 'blue' },
  { kind: 'star', colour: 'yellow' },
  { kind: 'ring', colour: 'orange' },
  { kind: 'hexagon', colour: 'green' },
  { kind: 'squircle', colour: 'pink' },
];

const Curtain = ({ label, id }) => (
  <section id={id} className={styles.curtain} aria-label={label}>
    <p className={styles.label}>{label}</p>
    <div className={styles.row} aria-hidden="true">
      {PARADE.map((p, i) => (
        <span key={i} className={styles.item} style={{ '--i': i, '--from': i % 2 ? '1' : '-1' }}>
          <Shape kind={p.kind} colour={p.colour} className={styles.shape} />
        </span>
      ))}
    </div>
  </section>
);

export default Curtain;

import { useCopy } from '../../content/copy/store';
import styles from './Loading.module.css';

const WORD = 'Loading';

// Shown while a page's code downloads: a glossy jelly hops, squashes and changes colour over a bouncing word.
const Loading = () => {
  const { loading } = useCopy('site');
  return (
    <div className={styles.wrap} role="status">
      <span className="sr-only">{loading}</span>
      <div className={styles.stage} aria-hidden="true">
        <span className={styles.shadow} />
        <span className={styles.hop}>
          <span className={styles.jelly}>
            <span className={`${styles.tint} ${styles.blue}`} />
            <span className={`${styles.tint} ${styles.pink}`} />
            <span className={`${styles.tint} ${styles.green}`} />
            <span className={styles.gloss} />
            <span className={styles.eyes}><i /><i /></span>
          </span>
        </span>
      </div>
      <p className={styles.word} aria-hidden="true">
        {[...WORD].map((ch, i) => <span key={i} style={{ '--i': i }}>{ch}</span>)}
        <span className={styles.dots}><i /><i /><i /></span>
      </p>
    </div>
  );
};

export default Loading;

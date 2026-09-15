import styles from './Loading.module.css';

/*
 * The Suspense fallback. Shaped like the page it stands in for, so the arrival
 * is a fill rather than a jump, and it holds the height so the footer does not
 * ride up to meet it.
 */
const Loading = () => (
  <div className={styles.wrap} role="status" aria-label="Loading">
    <span className={styles.eyebrow} />
    <span className={styles.title} />
    <span className={styles.line} />
    <span className={`${styles.line} ${styles.short}`} />
    <span className={styles.rule} aria-hidden="true" />
  </div>
);

export default Loading;

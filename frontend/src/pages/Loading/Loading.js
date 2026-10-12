import styles from './Loading.module.css';

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

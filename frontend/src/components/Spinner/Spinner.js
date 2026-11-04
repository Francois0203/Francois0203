import styles from './Spinner.module.css';

// A loading ring. size is any CSS length; label is read to screen readers.
const Spinner = ({ size = '1.25rem', tone, label = 'Loading', className = '' }) => (
  <span className={[styles.wrap, className].filter(Boolean).join(' ')} data-tone={tone} style={{ '--size': size }} role="status">
    <span className={styles.ring} aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
);

export default Spinner;

import { MdFavorite } from 'react-icons/md';
import styles from './SupportButton.module.css';

// The support link, with a light travelling round its edge.
const SupportButton = ({ href, children }) => (
  <a className={styles.support} href={href} target="_blank" rel="noopener noreferrer">
    <span className={styles.inner}>
      <MdFavorite className={styles.icon} aria-hidden="true" />
      {children}
    </span>
  </a>
);

export default SupportButton;

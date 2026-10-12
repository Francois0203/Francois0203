import styles from './Monogram.module.css';

// The FM mark: a tilted indigo sticker.
const Monogram = ({ size = 34, className = '' }) => (
  <span className={`${styles.mark} ${className}`} style={{ '--s': `${size}px` }} aria-hidden="true">
    FM
  </span>
);

export default Monogram;

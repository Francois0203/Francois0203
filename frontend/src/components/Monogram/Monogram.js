import styles from './Monogram.module.css';

// The FM logo. `size` is its height in pixels.
const Monogram = ({ size = 34, className = '' }) => (
  <img
    src="/logo-mark.png"
    alt=""
    aria-hidden="true"
    className={`${styles.mark} ${className}`}
    style={{ '--s': `${size}px` }}
    width={Math.round(size * 412 / 343)}
    height={size}
  />
);

export default Monogram;

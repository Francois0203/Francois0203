import styles from './Chip.module.css';

const Chip = ({ as: Tag = 'span', dot = null, solid = false, className = '', children, ...rest }) => (
  <Tag
    className={[styles.chip, solid && styles.solid, className].filter(Boolean).join(' ')}
    data-dot={dot ?? undefined}
    {...rest}
  >
    {dot && <span className={styles.dot} aria-hidden="true" />}
    {children}
  </Tag>
);

export default Chip;

import styles from './Chip.module.css';

// A small glass label. dot adds a status light, tone colours its rim.
const Chip = ({ as: Tag = 'span', dot = null, solid = false, tone, className = '', children, ...rest }) => (
  <Tag
    className={[styles.chip, solid && styles.solid, className].filter(Boolean).join(' ')}
    data-dot={dot ?? undefined}
    data-tone={tone}
    {...rest}
  >
    {dot && <span className={styles.dot} aria-hidden="true" />}
    {children}
  </Tag>
);

export default Chip;

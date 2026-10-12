import styles from './Button.module.css';

const Button = ({
  as: Tag = 'button',
  variant = 'line',
  size = 'md',
  full = false,
  arrow = false,
  className = '',
  children,
  ...rest
}) => (
  <Tag
    className={[styles.btn, styles[variant], size !== 'md' && styles[size], full && styles.full, className]
      .filter(Boolean).join(' ')}
    {...(Tag === 'button' && !rest.type ? { type: 'button' } : null)}
    {...rest}
  >
    <span className={styles.label}>{children}</span>
    {arrow && (
      <svg className={styles.arrow} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </Tag>
);

export default Button;

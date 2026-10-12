import styles from './Slab.module.css';

const Slab = ({
  as: Tag = 'div',
  live = false,
  interactive = false,
  pad = false,
  className = '',
  children,
  ...rest
}) => (
  <Tag
    className={[
      styles.slab,
      live && styles.live,
      interactive && styles.interactive,
      pad && styles.pad,
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

export default Slab;

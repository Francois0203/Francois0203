import styles from './Slab.module.css';

/*
 * A slab of glass. `live` turns on backdrop-filter, which re-blurs
 * everything behind it on every frame its backdrop moves, and the field
 * behind it moves constantly. Two or three on screen, no more.
 */
const Slab = ({
  as: Tag = 'div',
  live = false,
  interactive = false,
  sheen = false,
  className = '',
  children,
  ...rest
}) => (
  <Tag
    className={[
      styles.slab,
      live && styles.live,
      interactive && styles.interactive,
      sheen && styles.sheen,
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

export default Slab;

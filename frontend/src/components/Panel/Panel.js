import { forwardRef, useRef } from 'react';
import useTilt from '../../hooks/useTilt';
import styles from './Panel.module.css';

// A solid raised panel. tilt leans it toward the pointer, in degrees.
const Panel = forwardRef(({
  as: Tag = 'div',
  tone,
  tilt = 0,
  lift = 0,
  strong = false,
  flat = false,
  pad = 'md',
  className = '',
  children,
  ...rest
}, outerRef) => {
  const own = useRef(null);
  useTilt(own, { max: tilt, lift, enabled: tilt > 0 });
  const setRef = (node) => {
    own.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };

  return (
    <Tag
      ref={setRef}
      className={['panel', styles.panel, strong && styles.strong, flat && styles.flat, tilt > 0 && styles.tilt, styles[pad], className].filter(Boolean).join(' ')}
      data-tone={tone}
      {...rest}
    >
      {children}
    </Tag>
  );
});

Panel.displayName = 'Panel';

export default Panel;

import { forwardRef, useRef } from 'react';
import useTilt from '../../hooks/useTilt';
import styles from './Glass.module.css';

// A frosted panel with a coloured rim. tilt leans it toward the pointer, in degrees.
const Glass = forwardRef(({
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
      className={['glass', styles.panel, strong && styles.strong, flat && styles.flat, tilt > 0 && styles.tilt, styles[pad], className].filter(Boolean).join(' ')}
      data-tone={tone}
      {...rest}
    >
      {children}
    </Tag>
  );
});

Glass.displayName = 'Glass';

export default Glass;

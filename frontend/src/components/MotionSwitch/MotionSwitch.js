import { useAnimations } from '../../hooks/useAnimations';
import { useCopy } from '../../content/copy/store';
import styles from './MotionSwitch.module.css';

// Turns the site's motion off and on. Remembered on this device.
const MotionSwitch = ({ className = '' }) => {
  const words = useCopy('a11y');
  const { reduceAnimations, toggleAnimations } = useAnimations();
  return (
    <button
      type="button"
      className={[styles.switch, className].filter(Boolean).join(' ')}
      data-on={reduceAnimations ? '' : undefined}
      onClick={toggleAnimations}
      aria-pressed={reduceAnimations}
      aria-label={reduceAnimations ? words.restoreMotion : words.reduceMotion}
      title={reduceAnimations ? words.restoreMotion : words.reduceMotion}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        {reduceAnimations
          ? <path d="M9 5v14M15 5v14" strokeLinecap="round" />
          : <path d="M3 12h4l2.5-6 5 12L17 12h4" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </button>
  );
};

export default MotionSwitch;

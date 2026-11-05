import { useId } from 'react';
import { useCopy } from '../../content/copy/store';
import { useTheme } from '../../hooks/useTheme';
import styles from './ThemeSwitch.module.css';

// Light and dark toggle. The sun folds its rays and a bite turns it into a moon.
const ThemeSwitch = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const words = useCopy('a11y');
  const dark = theme !== 'light';
  const mask = `moon${useId().replace(/:/g, '')}`;
  return (
    <button
      type="button"
      className={[styles.switch, className].filter(Boolean).join(' ')}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={dark ? words.toLight : words.toDark}
      title={dark ? words.toLight : words.toDark}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" className={styles.icon} data-dark={dark ? '' : undefined}>
        <mask id={mask} stroke="none">
          <rect width="24" height="24" fill="white" />
          <circle className={styles.bite} cx="16" cy="8.5" r="5" fill="black" />
        </mask>
        <circle className={styles.core} cx="12" cy="12" r="5.5" fill="currentColor" stroke="none" mask={`url(#${mask})`} />
        <path className={styles.rays} d="M12 2v2M12 20v2M22 12h-2M4 12H2M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4M19.1 19.1l-1.4-1.4M6.3 6.3 4.9 4.9" />
      </svg>
    </button>
  );
};

export default ThemeSwitch;

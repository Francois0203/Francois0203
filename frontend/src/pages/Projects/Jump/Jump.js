import { Bone } from '../../../components/Skeleton';
import { scrollPageTo } from '../../../hooks';
import styles from './Jump.module.css';

const go = (e, id) => {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  scrollPageTo(el, { offset: -96 });
};

// Real counts that double as the way down the page.
const Jump = ({ items = [], label, loading = false }) => (
  <nav className={styles.jump} aria-label={label}>
    {items.map((it, i) => (
      <a
        key={it.id}
        href={`#${it.id}`}
        className={`panel ${styles.key}`}
        data-tone={it.tone}
        data-rise
        style={{ '--i': i + 4 }}
        onClick={(e) => go(e, it.id)}
      >
        <span className={styles.count}>{loading ? <Bone w="1.4rem" h="1.4rem" /> : it.value}</span>
        <span className={styles.label}>{it.label}</span>
        <svg className={styles.arrow} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M8 3v10M4 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    ))}
  </nav>
);

export default Jump;

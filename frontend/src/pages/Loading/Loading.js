import Skeleton, { Bone } from '../../components/Skeleton';
import { useCopy } from '../../content/copy/store';
import styles from './Loading.module.css';

const TONES = ['blue', 'pink', 'green'];

// Shown while a page's code downloads: three bouncing glass beads over the outline of a page.
const Loading = () => {
  const { loading } = useCopy('site');
  return (
    <Skeleton label={loading} className={styles.wrap}>
      <div className={styles.beads} aria-hidden="true">
        {TONES.map((t, i) => <span key={t} className={styles.bead} style={{ '--c': `var(--c-${t})`, '--i': i }} />)}
      </div>
      <div className={`glass ${styles.card}`} data-tone="blue">
        <Bone w="8rem" h="1.8rem" r="999px" />
        <Bone w="min(70%, 28rem)" h="clamp(2.4rem, 6vw, 4rem)" />
        <Bone w="min(90%, 34rem)" h="0.95rem" />
        <Bone w="min(60%, 22rem)" h="0.95rem" />
      </div>
    </Skeleton>
  );
};

export default Loading;

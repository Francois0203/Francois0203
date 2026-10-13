import Skeleton, { Bone } from '../../components/Skeleton';
import styles from './Loading.module.css';

// Shown while a page's code downloads: the rough shape of a page header.
const Loading = () => (
  <Skeleton label="Loading the page" className={styles.wrap}>
    <Bone w="9rem" h="1.6rem" r="999px" />
    <Bone w="min(60%, 26rem)" h="clamp(2.5rem, 6vw, 4.5rem)" style={{ marginBottom: '0.6rem' }} />
    <Bone w="min(46%, 30rem)" h="0.9rem" />
    <Bone w="min(32%, 20rem)" h="0.9rem" />
  </Skeleton>
);

export default Loading;

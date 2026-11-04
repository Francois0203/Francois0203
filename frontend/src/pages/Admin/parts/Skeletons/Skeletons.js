import Skeleton, { Bone } from '../../../../components/Skeleton';
import styles from './Skeletons.module.css';

// Rows like the admin lists, shown while the entries load.
export const ListSkeleton = ({ rows = 3 }) => (
  <Skeleton label="Loading entries" className={styles.list}>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className={styles.row} style={{ '--i': i }}>
        <Bone w="1rem" h="1.6rem" r="6px" />
        <div className={styles.text}>
          <Bone w={`${[45, 60, 38][i % 3]}%`} h="1rem" />
          <Bone w={`${[30, 42, 26][i % 3]}%`} h="0.8rem" />
        </div>
        <Bone w="1.8rem" h="1.8rem" r="50%" />
      </div>
    ))}
  </Skeleton>
);

// Labelled fields like the admin forms, shown while the saved values load.
export const FormSkeleton = ({ fields = 6 }) => (
  <Skeleton label="Loading" className={styles.form}>
    {Array.from({ length: fields }, (_, i) => (
      <div key={i} className={styles.field} data-wide={i === 2 ? '' : undefined}>
        <Bone w="6rem" h="0.75rem" />
        <Bone h={i === 2 ? '6rem' : 'var(--field-h)'} r="var(--r-field)" />
      </div>
    ))}
  </Skeleton>
);

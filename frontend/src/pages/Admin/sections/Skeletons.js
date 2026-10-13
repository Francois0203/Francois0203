import Skeleton, { Bone } from '../../../components/Skeleton';
import formStyles from '../AdminForms.module.css';

// Rows like the admin lists, shown while the entries load.
export const ListSkeleton = ({ rows = 3 }) => (
  <Skeleton label="Loading entries">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className={formStyles.listRow}>
        <Bone w="1rem" h="1.6rem" r="4px" />
        <div className={formStyles.listRowContent}>
          <Bone w={`${[45, 60, 38][i % 3]}%`} h="1rem" />
          <Bone w={`${[30, 42, 26][i % 3]}%`} h="0.8rem" style={{ marginTop: '0.4rem' }} />
        </div>
        <Bone w="1.6rem" h="1.6rem" r="6px" />
      </div>
    ))}
  </Skeleton>
);

// Labelled fields like the admin forms, shown while the saved values load.
export const FormSkeleton = ({ fields = 6 }) => (
  <Skeleton label="Loading">
    <div className={formStyles.grid}>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="input-container" style={i === 2 ? { gridColumn: '1 / -1' } : undefined}>
          <Bone w="6rem" h="0.75rem" style={{ marginBottom: '0.5rem' }} />
          <Bone h={i === 2 ? '6rem' : 'var(--field-h)'} r="6px" />
        </div>
      ))}
    </div>
  </Skeleton>
);

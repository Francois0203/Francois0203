import { useRef } from 'react';
import useTilt from '../../../hooks/useTilt';
import styles from './Course.module.css';

// A qualification as a glass card that leans toward the pointer.
const Course = ({ title, org, when, note, current, nowLabel, tone, i }) => {
  const ref = useRef(null);
  useTilt(ref, { max: 6, lift: 12 });
  return (
    <div className={styles.cell} style={{ '--i': i }} data-rise="side">
      <article ref={ref} className={`glass ${styles.card}`} data-tone={tone}>
        <p className={styles.when}>
          {current && <span className={styles.now}>{nowLabel}</span>}
          {when}
        </p>
        <h3 className={styles.title}>{title}</h3>
        {org && <p className={styles.org}>{org}</p>}
        {note && <p className={styles.note}>{note}</p>}
      </article>
    </div>
  );
};

export default Course;

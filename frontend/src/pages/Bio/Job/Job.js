import { useRef } from 'react';
import useTilt from '../../../hooks/useTilt';
import styles from './Job.module.css';

// One role on the timeline: a glass card hanging off a glowing node.
const Job = ({ title, org, when, note, tags, current, nowLabel, tone, i }) => {
  const ref = useRef(null);
  useTilt(ref, { max: 3 });
  return (
    <article className={styles.job} data-tone={tone} style={{ '--i': i }} data-rise="side">
      <span className={styles.node} data-stop aria-hidden="true" />
      <div ref={ref} className={`glass ${styles.card}`}>
        <header className={styles.head}>
          <div>
            <h3 className={styles.title}>{title}</h3>
            {org && <p className={styles.org}>{org}</p>}
          </div>
          {when && (
            <p className={styles.when}>
              {current && <span className={styles.now}>{nowLabel}</span>}
              {when}
            </p>
          )}
        </header>
        {note && <p className={styles.note}>{note}</p>}
        {tags?.length > 0 && (
          <ul className={styles.tags}>
            {tags.map((tag, k) => <li key={k}>{tag}</li>)}
          </ul>
        )}
      </div>
    </article>
  );
};

export default Job;

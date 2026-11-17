import styles from './Course.module.css';

// One qualification as a row in the ledger.
const Course = ({ title, org, when, note, current, nowLabel, tone, i }) => (
  <li className={styles.row} data-tone={tone} style={{ '--i': i }} data-rise>
    <p className={styles.when}>
      {current && <span className={styles.now}>{nowLabel}</span>}
      {when}
    </p>
    <h3 className={styles.title}>{title}</h3>
    {org && <p className={styles.org}>{org}</p>}
    {note && <p className={styles.note}>{note}</p>}
  </li>
);

export default Course;

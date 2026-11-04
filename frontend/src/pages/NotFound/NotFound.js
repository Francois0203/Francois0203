import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Draggable from '../../components/Draggable';
import Headline from '../../components/Headline';
import { useCopy } from '../../content/copy/store';
import styles from './NotFound.module.css';

const DIGITS = [
  { d: '4', tone: 'blue' },
  { d: '0', tone: 'pink' },
  { d: '4', tone: 'orange' },
];

// A wrong turn. The 404 is made of glass blocks the visitor can toss around.
const NotFound = () => {
  const t = useCopy('notFound');
  return (
    <section className={styles.page}>
      <div className={styles.digits} aria-hidden="true">
        {DIGITS.map(({ d, tone }, i) => (
          <Draggable key={i} className={styles.slot}>
            <span className={`glass ${styles.digit}`} data-tone={tone} style={{ '--i': i }}>{d}</span>
          </Draggable>
        ))}
      </div>

      <div className={styles.copy} data-shown="">
        <Chip dot="off">{t.chip}</Chip>
        <Headline as="h1" text={t.title} tone="pink" className={styles.title} />
        <p className={styles.text}>{t.text}</p>
        <div className={styles.actions}>
          <Button as={Link} to="/" variant="primary" arrow>{t.primary}</Button>
          <Button as={Link} to="/projects" variant="glass">{t.secondary}</Button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;

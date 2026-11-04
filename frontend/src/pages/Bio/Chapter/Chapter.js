import useReveal from '../../../hooks/useReveal';
import Headline from '../../../components/Headline';
import styles from './Chapter.module.css';

// One part of the record: a numbered title, then its content rising in.
const Chapter = ({ id, n, title, tone = 'blue', aside, children }) => {
  const [ref, shown] = useReveal({ threshold: 0.04 });
  return (
    <section
      id={id}
      ref={ref}
      className={styles.chapter}
      data-tone={tone}
      data-shown={shown ? '' : undefined}
      style={{ '--step': '70ms' }}
    >
      <header className={styles.head}>
        <span className={styles.num} data-rise aria-hidden="true">{String(n).padStart(2, '0')}</span>
        <Headline as="h2" text={`*${title}*`} tone={tone} className={styles.title} start={1} />
        {aside && <p className={styles.aside} data-rise style={{ '--i': 3 }}>{aside}</p>}
      </header>
      {children}
    </section>
  );
};

export default Chapter;

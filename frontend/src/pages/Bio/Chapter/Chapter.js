import Headline from '../../../components/Headline';
import styles from './Chapter.module.css';

// One part of the record: a title, then its content rising in.
const Chapter = ({ id, title, tone = 'blue', aside, children }) => {
  return (
    <section
      id={id}
      className={styles.chapter}
      data-tone={tone}
      style={{ '--step': '70ms' }}
    >
      <header className={styles.head}>
        <Headline as="h2" text={`*${title}*`} tone={tone} className={styles.title} start={1} />
        {aside && <p className={styles.aside} data-rise style={{ '--i': 3 }}>{aside}</p>}
      </header>
      {children}
    </section>
  );
};

export default Chapter;

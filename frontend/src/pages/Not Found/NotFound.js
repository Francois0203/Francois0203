import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Embers from '../../components/Embers';
import styles from './NotFound.module.css';

/* A wrong turn, stated once and got out of the way of. */
const NotFound = () => (
  <section className={styles.page}>
    <Embers count={10} />
    <p className={styles.code}>404</p>
    <h1 className={styles.title}>No page here</h1>
    <p className={styles.text}>
      The address does not match anything here. It may have moved, or it may
      never have existed.
    </p>
    <div className={styles.actions}>
      <Button as={Link} to="/" variant="fill">Back to the start</Button>
      <Button as={Link} to="/projects" variant="line">See the work</Button>
    </div>
  </section>
);

export default NotFound;

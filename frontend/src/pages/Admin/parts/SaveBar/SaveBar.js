import Button from '../../../../components/Button';
import styles from './SaveBar.module.css';

// The green save button at the bottom of a section.
const SaveBar = ({ save, dirty, label = 'Save', children }) => {
  const tracked = dirty !== undefined;
  return (
    <div className={styles.bar} data-dirty={dirty ? '' : undefined}>
      <Button
        variant="confirm"
        status={save.status}
        onClick={() => save.run()}
        disabled={tracked && !dirty}
      >
        {label}
      </Button>
      {children}
      {dirty && (
        <span className={styles.unsaved} role="status">
          <span className={styles.dot} aria-hidden="true" />
          Unsaved changes
        </span>
      )}
    </div>
  );
};

export default SaveBar;

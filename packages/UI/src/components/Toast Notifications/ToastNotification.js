import React, { useEffect, useState, memo, useCallback } from "react";

import styles from "./ToastNotification.module.css";
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

const ToastNotification = memo(({ id, type = "info", title, message, errorCode, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onClose(id);
      }, 400);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 400);
  }, [id, onClose]);

  return (
    <div className={`${styles.toastWrapper} ${isClosing ? styles.closing : styles.opening}`}>
      <div className={`${styles.toastMessage} ${styles[type]}`}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close notification">
          ×
        </button>
        <div className={styles.toastHeader}>{title}</div>
        <div className={styles.toastBody}>{message}</div>
        {errorCode && <div className={styles.toastFooter}>Code: {errorCode}</div>}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.type === nextProps.type &&
    prevProps.title === nextProps.title &&
    prevProps.message === nextProps.message &&
    prevProps.errorCode === nextProps.errorCode &&
    prevProps.onClose === nextProps.onClose
  );
});

ToastNotification.displayName = "ToastNotification";

export default ToastNotification;